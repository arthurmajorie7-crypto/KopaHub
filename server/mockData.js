const users = [
  {
    id: 'user-1001',
    fullName: 'Aisha Wanjiku',
    phoneNumber: '+254700000001',
    email: 'admin@kopahub.io',
    passwordHash: '$2a$10$27/O9sCr8w0bL4VnU0r7je0O3iKuYx2N8zl.Jm3Is3BsQv6X9OClu',
    role: 'admin',
    location: 'Nairobi, Kenya',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    id: 'user-1002',
    fullName: 'Patrick Kariuki',
    phoneNumber: '+254700000002',
    email: 'patrick@kopahub.io',
    passwordHash: '$2a$10$27/O9sCr8w0bL4VnU0r7je0O3iKuYx2N8zl.Jm3Is3BsQv6X9OClu',
    role: 'admin',
    location: 'Mombasa, Kenya',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  },
  {
    id: 'user-1003',
    fullName: 'Grace Wanjiku',
    phoneNumber: '+254700000003',
    email: 'grace@kopahub.io',
    passwordHash: '$2a$10$27/O9sCr8w0bL4VnU0r7je0O3iKuYx2N8zl.Jm3Is3BsQv6X9OClu',
    role: 'member',
    location: 'Kisumu, Kenya',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  },
];

export const groups = [
  {
    id: 'group-1',
    name: 'Nairobi Hustlers',
    totalSavings: 520000,
    status: 'Active',
    adminName: 'Aisha Wanjiku',
    members: [
      { id: 'user-1001', name: 'Aisha Wanjiku' },
      { id: 'user-1002', name: 'Patrick Kariuki' },
      { id: 'user-1003', name: 'Grace Wanjiku' },
    ],
  },
  {
    id: 'group-2',
    name: 'Mombasa Circle',
    totalSavings: 330000,
    status: 'Active',
    adminName: 'Patrick Kariuki',
    members: [{ id: 'user-1002', name: 'Patrick Kariuki' }],
  },
  {
    id: 'group-3',
    name: 'Kisumu Growth',
    totalSavings: 410500,
    status: 'Review',
    adminName: 'Grace Wanjiku',
    members: [{ id: 'user-1003', name: 'Grace Wanjiku' }],
  },
];

export const loans = [
  {
    id: 'loan-1',
    member: 'Grace Wanjiku',
    amount: 150000,
    interestRate: 12,
    dueDate: '2026-11-23',
    balance: 120000,
    status: 'Approved',
  },
  {
    id: 'loan-2',
    member: 'Patrick Kariuki',
    amount: 90000,
    interestRate: 10,
    dueDate: '2026-12-07',
    balance: 72000,
    status: 'Pending',
  },
  {
    id: 'loan-3',
    member: 'Aisha Wanjiku',
    amount: 240000,
    interestRate: 14,
    dueDate: '2026-12-18',
    balance: 195000,
    status: 'Rejected',
  },
];

export const payments = [
  {
    id: 'payment-1',
    member: 'Aisha Wanjiku',
    method: 'Mobile Money',
    amount: 7500,
    reference: 'MM-10124',
    status: 'Completed',
  },
  {
    id: 'payment-2',
    member: 'Grace Wanjiku',
    method: 'Bank',
    amount: 21000,
    reference: 'BK-99181',
    status: 'Completed',
  },
  {
    id: 'payment-3',
    member: 'Patrick Kariuki',
    method: 'Manual',
    amount: 5000,
    reference: 'MN-2044',
    status: 'Pending',
  },
];

export const notifications = [
  { id: 'n-1', title: 'Loan approved', message: 'Your microloan has been approved for processing.', read: false },
  { id: 'n-2', title: 'Monthly savings reminder', message: 'Your group contribution is due today.', read: false },
  { id: 'n-3', title: 'New member joined', message: 'Mercy has joined Nairobi Hustlers group.', read: true },
];

export { users };
