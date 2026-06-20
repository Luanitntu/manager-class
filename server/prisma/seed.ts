import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await argon2.hash('admin123!');

  // Super Admin (platform owner) — login with email or username "admin"
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@schedule-teacher.local' },
    update: { username: 'admin', passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: 'admin@schedule-teacher.local',
      username: 'admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      fullName: 'Platform Admin',
      emailVerified: true,
    },
  });

  // Sample Teacher (tenant root) — login with email or username "teacher01"
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@schedule-teacher.local' },
    update: { username: 'teacher01', passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: 'teacher@schedule-teacher.local',
      username: 'teacher01',
      passwordHash,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
      fullName: 'Demo Teacher',
      emailVerified: true,
    },
  });

  // Sample class owned by the teacher
  const klass = await prisma.class.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      teacherId: teacher.id,
      name: 'Japanese N5',
      level: 'N5',
      color: '#5D87FF',
      createdBy: teacher.id,
    },
  });

  console.log('Seed complete:', {
    superAdmin: superAdmin.email,
    teacher: teacher.email,
    sampleClass: klass.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
