import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'Password123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kopahub.io' },
    update: {},
    create: { fullName: 'Aisha Wanjiku', phoneNumber: '+254700000001', email: 'admin@kopahub.io', passwordHash, role: 'ADMIN', location: 'Nairobi, Kenya' },
  });
  const member = await prisma.user.upsert({
    where: { email: 'grace@kopahub.io' },
    update: {},
    create: { fullName: 'Grace Wanjiku', phoneNumber: '+254700000003', email: 'grace@kopahub.io', passwordHash, role: 'MEMBER', location: 'Kisumu, Kenya' },
  });
  const group = await prisma.group.upsert({
    where: { id: 'kopahub-demo-group' },
    update: {},
    create: { id: 'kopahub-demo-group', name: 'Nairobi Hustlers', description: 'KopaHub sample savings circle', totalSavings: 520000, adminId: admin.id },
  });
  await prisma.groupMember.upsert({ where: { userId_groupId: { userId: admin.id, groupId: group.id } }, update: {}, create: { userId: admin.id, groupId: group.id, role: 'ADMIN' } });
  await prisma.groupMember.upsert({ where: { userId_groupId: { userId: member.id, groupId: group.id } }, update: {}, create: { userId: member.id, groupId: group.id } });
  const notification = await prisma.notification.findFirst({ where: { userId: admin.id, title: 'Monthly savings reminder' } });
  if (!notification) await prisma.notification.create({ data: { userId: admin.id, title: 'Monthly savings reminder', message: 'Your group contribution is due today.', type: 'REMINDER' } });
  console.log('Seed complete. Demo admin: admin@kopahub.io');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
