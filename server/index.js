import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users, groups, loans, payments, notifications } from './mockData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kopahub-dev-secret';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const userStore = structuredClone(users);
const groupStore = structuredClone(groups);
const loanStore = structuredClone(loans);
const paymentStore = structuredClone(payments);
const notificationStore = structuredClone(notifications);

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    location: user.location,
    profileImage: user.profileImage,
  };
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = userStore.find((entry) => entry.id === decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid session.' });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'KopaHub API' });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, phoneNumber, email, password, confirmPassword } = req.body;

  if (!fullName || !phoneNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const existingUser = userStore.find((user) => user.email === email || user.phoneNumber === phoneNumber);
  if (existingUser) {
    return res.status(409).json({ message: 'A user with this email or phone number already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `user-${Date.now()}`,
    fullName,
    phoneNumber,
    email: email || `member-${Date.now()}@kopahub.io`,
    passwordHash,
    role: 'member',
    location: 'Nairobi, Kenya',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  };

  userStore.push(newUser);
  const token = signToken(newUser);

  return res.status(201).json({
    token,
    user: sanitizeUser(newUser),
    message: 'Account created successfully.',
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = userStore.find((entry) => entry.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: sanitizeUser(user),
    message: 'Login successful.',
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  return res.json({
    message: `Password reset instructions have been sent to ${email}.`,
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Missing reset parameters.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = userStore[0];
  user.passwordHash = hashed;

  return res.json({ message: 'Password reset successfully.' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/dashboard', authenticate, (req, res) => {
  const user = userStore.find((entry) => entry.id === req.user.id) || userStore[0];

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
    stats: [
      { label: 'Savings rate', value: '78%', change: '+8%' },
      { label: 'Active groups', value: '4', change: '+1' },
      { label: 'Outstanding', value: 'KSh 200,000', change: '2 due soon' },
      { label: 'Member health', value: 'Excellent', change: '+15%' },
    ],
  });
});

app.get('/api/groups', authenticate, (req, res) => {
  res.json({
    groups: groupStore.map((group) => ({
      id: group.id,
      name: group.name,
      members: group.members.length,
      pool: group.totalSavings,
      admin: group.adminName,
      status: group.status,
    })),
  });
});

app.get('/api/loans', authenticate, (req, res) => {
  res.json({
    loans: loanStore.map((loan) => ({
      id: loan.id,
      member: loan.member,
      amount: loan.amount,
      interestRate: loan.interestRate,
      dueDate: loan.dueDate,
      balance: loan.balance,
      status: loan.status,
    })),
  });
});

app.get('/api/payments', authenticate, (req, res) => {
  res.json({
    payments: paymentStore.map((payment) => ({
      id: payment.id,
      member: payment.member,
      method: payment.method,
      amount: payment.amount,
      reference: payment.reference,
      status: payment.status,
    })),
  });
});

app.get('/api/reports', authenticate, (req, res) => {
  res.json({
    summary: {
      savings: 1450000,
      loans: 420000,
      payments: 890000,
    },
    monthly: [
      { month: 'Jan', savings: 120000, loans: 35000, payments: 82000 },
      { month: 'Feb', savings: 98000, loans: 41000, payments: 76000 },
      { month: 'Mar', savings: 150000, loans: 52000, payments: 95000 },
      { month: 'Apr', savings: 164000, loans: 61000, payments: 120000 },
    ],
  });
});

app.get('/api/profile', authenticate, (req, res) => {
  const user = userStore.find((entry) => entry.id === req.user.id) || userStore[0];
  res.json({ user: sanitizeUser(user) });
});

app.patch('/api/profile', authenticate, (req, res) => {
  const user = userStore.find((entry) => entry.id === req.user.id) || userStore[0];
  Object.assign(user, req.body);
  res.json({ message: 'Profile updated successfully.', user: sanitizeUser(user) });
});

app.get('/api/admin', authenticate, (req, res) => {
  const summary = {
    members: userStore.length,
    groups: groupStore.length,
    loans: loanStore.length,
    payments: paymentStore.length,
  };

  res.json({ summary });
});

app.listen(PORT, () => {
  console.log(`KopaHub API listening on http://localhost:${PORT}`);
});
