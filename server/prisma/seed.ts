import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const TZ = 'Asia/Ho_Chi_Minh';

interface SeedUser {
  email: string;
  username: string;
  fullName: string;
  role: Role;
  passwordHash: string;
  teacherId?: string;
}

async function upsertUser(u: SeedUser) {
  return prisma.user.upsert({
    where: { email: u.email },
    update: {
      username: u.username,
      fullName: u.fullName,
      passwordHash: u.passwordHash,
      role: u.role,
      teacherId: u.teacherId ?? null,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      passwordHash: u.passwordHash,
      role: u.role,
      teacherId: u.teacherId ?? null,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      timezone: TZ,
      ...(u.role === Role.STUDENT ? { studentProfile: { create: {} } } : {}),
      ...(u.role === Role.ASSISTANT ? { assistantProfile: { create: {} } } : {}),
    },
  });
}

async function main(): Promise<void> {
  // Hash the shared passwords once.
  const [adminPwd, teacherPwd, studentPwd] = await Promise.all([
    argon2.hash('admin123!'),
    argon2.hash('teacher123!'),
    argon2.hash('student123!'),
  ]);

  // ----- Super Admin (platform owner) -----
  const superAdmin = await upsertUser({
    email: 'admin@schedule-teacher.local',
    username: 'superadmin',
    fullName: 'Platform Owner',
    role: Role.SUPER_ADMIN,
    passwordHash: adminPwd,
  });

  // ----- 3 Teachers (login by username teacher01/02/03) -----
  const teacherDefs = [
    { username: 'teacher01', fullName: 'Cô Hương' },
    { username: 'teacher02', fullName: 'Thầy Minh' },
    { username: 'teacher03', fullName: 'Cô Lan' },
  ];
  const teachers = [];
  for (const def of teacherDefs) {
    teachers.push(
      await upsertUser({
        email: `${def.username}@schedule-teacher.local`,
        username: def.username,
        fullName: def.fullName,
        role: Role.TEACHER,
        passwordHash: teacherPwd,
      }),
    );
  }
  const teacher01 = teachers[0];

  // ----- 3 Students under teacher01 (login by username student01/02/03) -----
  const studentDefs = [
    { username: 'student01', fullName: 'Nguyễn An' },
    { username: 'student02', fullName: 'Trần Bình' },
    { username: 'student03', fullName: 'Lê Chi' },
  ];
  const students = [];
  for (let i = 0; i < studentDefs.length; i++) {
    const def = studentDefs[i];
    const u = await upsertUser({
      email: `${def.username}@schedule-teacher.local`,
      username: def.username,
      fullName: def.fullName,
      role: Role.STUDENT,
      passwordHash: studentPwd,
      teacherId: teacher01.id,
    });
    // Give each seed student a display code (STU0001, …).
    await prisma.studentProfile.upsert({
      where: { userId: u.id },
      update: { code: `STU${String(i + 1).padStart(4, '0')}` },
      create: { userId: u.id, code: `STU${String(i + 1).padStart(4, '0')}` },
    });
    students.push(u);
  }

  // ----- Sample class for teacher01 + enroll the 3 students -----
  const klass = await prisma.class.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { teacherId: teacher01.id },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      teacherId: teacher01.id,
      name: 'Japanese N5',
      level: 'N5',
      color: '#5D87FF',
      createdBy: teacher01.id,
    },
  });

  for (const s of students) {
    await prisma.classEnrollment.upsert({
      where: { classId_studentId: { classId: klass.id, studentId: s.id } },
      update: {},
      create: { classId: klass.id, studentId: s.id },
    });
  }

  console.log('Seed complete:');
  console.log('  SUPER_ADMIN -> username: superadmin | pass: admin123!');
  console.log('  TEACHERS    -> teacher01 / teacher02 / teacher03 | pass: teacher123!');
  console.log('  STUDENTS    -> student01 / student02 / student03 | pass: student123! (under teacher01)');
  console.log(`  Sample class "${klass.name}" with ${students.length} students.`);
  console.log({ superAdmin: superAdmin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
