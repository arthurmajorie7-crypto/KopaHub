import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users, groups, loans, payments, notifications } from './mockData.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-only-change-this-secret';

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

const userStore = structuredClone(users);
const groupStore = structuredClone(groups);
const loanStore = structuredClone(loans);
const paymentStore = structuredClone(payments);
const notificationStore = structuredClone(notifications);
const resetTokens = new Map();

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required.' });
  try {
    const payload = jwt.verify(authorization.slice(7), JWT_SECRET);
    const user = userStore.find((entry) => entry.id === payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid session.' });
    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'KopaHub API', mode: 'demo' }));

app.post('/api/auth/register', async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const phoneNumber = String(req.body.phoneNumber || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase() || null;
  const { password, confirmPassword } = req.body;
  if (fullName.length < 2 || phoneNumber.length < 6 || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Enter a valid name, phone number, and password of at least 8 characters.' });
  }
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
  if (userStore.some((user) => user.phoneNumber === phoneNumber || (email && user.email.toLowerCase() === email))) {
    return res.status(409).json({ message: 'A user with this email or phone number already exists.' });
  }
  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fullName,
    phoneNumber,
    email: email || `${phoneNumber.replace(/\D/g, '')}@phone.kopahub.local`,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'member',
    location: '',
    profileImage: null,
  };
  userStore.push(user);
  return res.status(201).json({ token: signToken(user), user: sanitizeUser(user), message: 'Account created successfully.' });
});

app.post('/api/auth/login', async (req, res) => {
  const identifier = String(req.body.email || req.body.phoneNumber || '').trim().toLowerCase();
  const password = req.body.password;
  const user = userStore.find((entry) => entry.email.toLowerCase() === identifier || entry.phoneNumber.toLowerCase() === identifier);
  if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email/phone or password.' });
  }
  return res.json({ token: signToken(user), user: sanitizeUser(user), message: 'Login successful.' });
});

app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.user }));
app.post('/api/auth/logout', authenticate, (_req, res) => res.json({ message: 'Logged out successfully.' }));

app.post('/api/auth/forgot-password', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const user = userStore.find((entry) => entry.email.toLowerCase() === email);
  let response = { message: 'If an account exists for this email, reset instructions will be sent.' };
  if (user && process.env.NODE_ENV !== 'production') {
    const token = jwt.sign({ id: user.id, purpose: 'password-reset' }, JWT_SECRET, { expiresIn: '15m' });
    resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 });
    response = { ...response, resetToken: token };
  }
  return res.json(response);
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  const reset = resetTokens.get(token);
  if (!reset || reset.expiresAt < Date.now()) return res.status(400).json({ message: 'Reset token is invalid or expired.' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
  const user = userStore.find((entry) => entry.id === reset.userId);
  if (!user) return res.status(400).json({ message: 'Reset token is invalid or expired.' });
  user.passwordHash = await bcrypt.hash(password, 12);
  resetTokens.delete(token);
  return res.json({ message: 'Password reset successfully.' });
});

app.get('/api/dashboard', authenticate, (req, res) => {
  const user = userStore.find((entry) => entry.id === req.user.id);
  res.json({
    welcome: `Welcome back, ${user.fullName.split(' ')[0]}`,
    totalSavings: 1260000,
    activeLoans: 3,
    nextPayment: 35000,
    groupInfo: { name: 'Nairobi Hustlers', members: 28, status: 'On track' },
    recentActivity: [
      { id: 'a-1', title: 'Group contribution', subtitle: 'Nairobi Hustlers', amount: '+KSh 25,000' },
      { id: 'a-2', title: 'Loan repayment', subtitle: 'Msa Microfinance', amount: '-KSh 12,500' },
      { id: 'a-3', title: 'New member joined', subtitle: 'Mercy Kamau', amount: '+1' },
    ],
    notifications: notificationStore.slice(0, 3),
  });
});

app.get('/api/groups', authenticate, (_req, res) => res.json({ groups: groupStore.map((group) => ({ id: group.id, name: group.name, members: group.members.length, pool: group.totalSavings, admin: group.adminName, status: group.status })) }));
app.get('/api/loans', authenticate, (_req, res) => res.json({ loans: loanStore }));
app.get('/api/payments', authenticate, (_req, res) => res.json({ payments: paymentStore }));
app.get('/api/reports', authenticate, (_req, res) => res.json({ summary: { savings: 1450000, loans: 420000, payments: 890000 }, monthly: [{ month: 'Jan', savings: 120000, loans: 35000, payments: 82000 }, { month: 'Feb', savings: 98000, loans: 41000, payments: 76000 }, { month: 'Mar', savings: 150000, loans: 52000, payments: 95000 }, { month: 'Apr', savings: 164000, loans: 61000, payments: 120000 }] }));
app.get('/api/profile', authenticate, (req, res) => res.json({ user: userStore.find((entry) => entry.id === req.user.id) && sanitizeUser(userStore.find((entry) => entry.id === req.user.id)) }));
app.patch('/api/profile', authenticate, (req, res) => {
  const user = userStore.find((entry) => entry.id === req.user.id);
  const { fullName, phoneNumber, email, location } = req.body;
  if (typeof fullName === 'string' && fullName.trim().length >= 2) user.fullName = fullName.trim();
  if (typeof phoneNumber === 'string') user.phoneNumber = phoneNumber.trim();
  if (typeof email === 'string') user.email = email.trim().toLowerCase();
  if (typeof location === 'string') user.location = location.trim();
  res.json({ message: 'Profile updated successfully.', user: sanitizeUser(user) });
});
app.get('/api/admin', authenticate, requireAdmin, (_req, res) => res.json({ summary: { members: userStore.length, groups: groupStore.length, loans: loanStore.length, payments: paymentStore.length } }));

// Demo accounts use a runtime-generated hash; no plaintext password is stored.
const demoPasswordHash = await bcrypt.hash('Password123!', 12);
for (const user of userStore) {
  if (user.email === 'admin@kopahub.io' || user.email === 'patrick@kopahub.io') user.passwordHash = demoPasswordHash;
}

app.listen(PORT, () => console.log(`KopaHub API listening on http://localhost:${PORT}`));
