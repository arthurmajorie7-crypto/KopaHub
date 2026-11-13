import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production.');
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

const sanitizeUser = ({ passwordHash, ...user }) => user;
const signToken = (user) => jwt.sign({ id: user.id }, JWT_SECRET || 'local-development-only-secret', { expiresIn: '7d' });
const titleCase = (value) => value.toLowerCase().replace(/(^|_)([a-z])/g, (_m, _p, c) => ` ${c.toUpperCase()}`).trim();
const amount = (value) => Number(value);

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required.' });
  try {
    const payload = jwt.verify(authorization.slice(7), JWT_SECRET || 'local-development-only-secret');
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ message: 'Invalid session.' });
    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}
function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', app: 'KopaHub API', database: 'connected' });
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const phoneNumber = String(req.body.phoneNumber || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase() || null;
  const { password, confirmPassword } = req.body;
  if (fullName.length < 2 || phoneNumber.length < 6 || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Enter a valid name, phone number, and password of at least 8 characters.' });
  }
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
  try {
    const user = await prisma.user.create({ data: { fullName, phoneNumber, email, passwordHash: await bcrypt.hash(password, 12) } });
    return res.status(201).json({ token: signToken(user), user: sanitizeUser(user), message: 'Account created successfully.' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'A user with this email or phone number already exists.' });
    }
    throw error;
  }
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const identifier = String(req.body.email || req.body.phoneNumber || '').trim();
  const password = req.body.password;
  const user = await prisma.user.findFirst({ where: { OR: [{ email: { equals: identifier, mode: 'insensitive' } }, { phoneNumber: identifier }] } });
  if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email/phone or password.' });
  }
  res.json({ token: signToken(user), user: sanitizeUser(user), message: 'Login successful.' });
}));
app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.user }));
app.post('/api/auth/logout', authenticate, (_req, res) => res.json({ message: 'Logged out successfully.' }));

app.post('/api/auth/forgot-password', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const user = await prisma.user.findUnique({ where: { email } });
  const response = { message: 'If an account exists for this email, reset instructions will be sent.' };
  // In development only, return a short-lived reset token; production should send this via email.
  if (user && process.env.NODE_ENV !== 'production') {
    response.resetToken = jwt.sign({ id: user.id, purpose: 'password-reset' }, JWT_SECRET || 'local-development-only-secret', { expiresIn: '15m' });
  }
  res.json(response);
}));
app.post('/api/auth/reset-password', asyncRoute(async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  let payload;
  try { payload = jwt.verify(token, JWT_SECRET || 'local-development-only-secret'); } catch { return res.status(400).json({ message: 'Reset token is invalid or expired.' }); }
  if (payload.purpose !== 'password-reset') return res.status(400).json({ message: 'Reset token is invalid or expired.' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
  await prisma.user.update({ where: { id: payload.id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  res.json({ message: 'Password reset successfully.' });
}));

app.get('/api/dashboard', authenticate, asyncRoute(async (req, res) => {
  const [user, memberships, activeLoans, notifications, recentPayments] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.user.id }, select: { fullName: true } }),
    prisma.groupMember.findMany({ where: { userId: req.user.id }, include: { group: { include: { _count: { select: { members: true } } } } } }),
    prisma.loan.findMany({ where: { borrowerId: req.user.id, status: 'APPROVED' }, select: { outstanding: true, dueDate: true }, orderBy: { dueDate: 'asc' } }),
    prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.payment.findMany({ where: { userId: req.user.id }, include: { loan: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  const totalSavings = memberships.reduce((sum, item) => sum + amount(item.group.totalSavings), 0);
  const nextPayment = activeLoans[0]?.outstanding ? amount(activeLoans[0].outstanding) : 0;
  res.json({
    welcome: `Welcome back, ${(user?.fullName || 'Member').split(' ')[0]}`,
    totalSavings,
    activeLoans: activeLoans.length,
    nextPayment,
    groupInfo: memberships[0] ? { name: memberships[0].group.name, members: memberships[0].group._count.members, status: 'Active' } : { name: 'No group yet', members: 0, status: 'Join a group' },
    recentActivity: recentPayments.map((item) => ({ id: item.id, title: item.loan ? 'Loan payment' : 'Group payment', subtitle: item.reference || titleCase(item.method), amount: `KSh ${amount(item.amount).toLocaleString()}` })),
    notifications: notifications.map((item) => ({ ...item, read: item.isRead })),
  });
}));

app.get('/api/groups', authenticate, asyncRoute(async (req, res) => {
  const groups = await prisma.group.findMany({ where: { members: { some: { userId: req.user.id } } }, include: { admin: { select: { fullName: true } }, _count: { select: { members: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ groups: groups.map((group) => ({ id: group.id, name: group.name, members: group._count.members, pool: amount(group.totalSavings), admin: group.admin.fullName, status: 'Active' })) });
}));
app.get('/api/loans', authenticate, asyncRoute(async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { borrowerId: req.user.id };
  const loans = await prisma.loan.findMany({ where, include: { borrower: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ loans: loans.map((loan) => ({ id: loan.id, member: loan.borrower.fullName, amount: amount(loan.amount), interestRate: amount(loan.interestRate), dueDate: loan.dueDate?.toISOString().slice(0, 10) || '—', balance: amount(loan.outstanding), status: titleCase(loan.status) })) });
}));
app.get('/api/payments', authenticate, asyncRoute(async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
  const payments = await prisma.payment.findMany({ where, include: { user: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } });
  res.json({ payments: payments.map((payment) => ({ id: payment.id, member: payment.user.fullName, method: titleCase(payment.method), amount: amount(payment.amount), reference: payment.transactionId || payment.reference || '—', status: titleCase(payment.status) })) });
}));
app.get('/api/reports', authenticate, asyncRoute(async (req, res) => {
  const paymentWhere = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
  const [payments, loans] = await Promise.all([
    prisma.payment.findMany({ where: paymentWhere, select: { amount: true, createdAt: true } }),
    prisma.loan.findMany({ where: req.user.role === 'ADMIN' ? {} : { borrowerId: req.user.id }, select: { amount: true, createdAt: true } }),
  ]);
  const paymentsTotal = payments.reduce((sum, row) => sum + amount(row.amount), 0);
  const loansTotal = loans.reduce((sum, row) => sum + amount(row.amount), 0);
  res.json({ summary: { savings: paymentsTotal, loans: loansTotal, payments: paymentsTotal }, monthly: [] });
}));
app.get('/api/profile', authenticate, asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: sanitizeUser(user) });
}));
app.patch('/api/profile', authenticate, asyncRoute(async (req, res) => {
  const data = {};
  for (const field of ['fullName', 'phoneNumber', 'email', 'location']) {
    if (typeof req.body[field] === 'string') data[field] = req.body[field].trim() || (field === 'email' ? null : undefined);
  }
  try {
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ message: 'Profile updated successfully.', user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ message: 'Email or phone number is already in use.' });
    throw error;
  }
}));
app.get('/api/admin', authenticate, requireAdmin, asyncRoute(async (_req, res) => {
  const [members, groups, loans, payments] = await Promise.all([prisma.user.count(), prisma.group.count(), prisma.loan.count(), prisma.payment.count()]);
  res.json({ summary: { members, groups, loans, payments } });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error. Check the API logs and database configuration.' });
});

const server = app.listen(PORT, () => console.log(`KopaHub API listening on http://localhost:${PORT}`));
async function shutdown() { server.close(); await prisma.$disconnect(); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
