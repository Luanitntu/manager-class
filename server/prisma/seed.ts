import {
  DocumentTargetType,
  DocumentType,
  PaymentStatus,
  PrismaClient,
  Role,
  ScoreType,
  SessionStatus,
  UserStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function availableUsername(email: string, username: string): Promise<string | undefined> {
  const existing = await prisma.user.findUnique({ where: { username }, select: { email: true } });
  return !existing || existing.email === email ? username : undefined;
}

async function tableHasColumn(tableName: string, columnName: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
    'select column_name from information_schema.columns where table_name = $1 and column_name = $2',
    tableName,
    columnName,
  );
  return rows.length > 0;
}

async function main(): Promise<void> {
  const passwordHash = await argon2.hash('admin123!');
  const adminUsername = await availableUsername('admin@schedule-teacher.local', 'admin');
  const teacherUsername = await availableUsername('teacher@schedule-teacher.local', 'teacher01');
  const studentUsername = await availableUsername('student@schedule-teacher.local', 'student01');

  // Super Admin (platform owner) — login with email or username "admin"
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@schedule-teacher.local' },
    update: { ...(adminUsername ? { username: adminUsername } : {}), passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: 'admin@schedule-teacher.local',
      ...(adminUsername ? { username: adminUsername } : {}),
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
    update: { ...(teacherUsername ? { username: teacherUsername } : {}), passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: 'teacher@schedule-teacher.local',
      ...(teacherUsername ? { username: teacherUsername } : {}),
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

  // Sample Student for student-portal smoke tests.
  const student = await prisma.user.upsert({
    where: { email: 'student@schedule-teacher.local' },
    update: {
      ...(studentUsername ? { username: studentUsername } : {}),
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      teacherId: teacher.id,
    },
    create: {
      email: 'student@schedule-teacher.local',
      ...(studentUsername ? { username: studentUsername } : {}),
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      fullName: 'Demo Student',
      emailVerified: true,
      teacherId: teacher.id,
      studentProfile: {
        create: {
          learningGoal: 'Prepare for Japanese N5',
          educationLevel: 'Beginner',
        },
      },
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      learningGoal: 'Prepare for Japanese N5',
      educationLevel: 'Beginner',
    },
    create: {
      userId: student.id,
      learningGoal: 'Prepare for Japanese N5',
      educationLevel: 'Beginner',
    },
  });

  await prisma.classEnrollment.upsert({
    where: {
      classId_studentId: {
        classId: klass.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      classId: klass.id,
      studentId: student.id,
    },
  });

  const nextSessionStart = new Date();
  nextSessionStart.setDate(nextSessionStart.getDate() + 3);
  nextSessionStart.setHours(18, 0, 0, 0);
  const nextSessionEnd = new Date(nextSessionStart);
  nextSessionEnd.setHours(19, 30, 0, 0);

  const smokeSessionId = '00000000-0000-0000-0000-000000000041';
  if (await tableHasColumn('teaching_sessions', 'instructor_id')) {
    await prisma.$executeRawUnsafe(
      `insert into "teaching_sessions" (
        "id", "teacher_id", "class_id", "start_time", "end_time", "lesson_topic",
        "status", "created_by", "updated_by", "created_at", "updated_at", "instructor_id"
      ) values ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7::text::"SessionStatus", $8::uuid, $9::uuid, now(), now(), $10::uuid)
      on conflict ("id") do update set
        "start_time" = excluded."start_time",
        "end_time" = excluded."end_time",
        "lesson_topic" = excluded."lesson_topic",
        "status" = excluded."status",
        "updated_by" = excluded."updated_by",
        "updated_at" = now(),
        "instructor_id" = excluded."instructor_id"`,
      smokeSessionId,
      teacher.id,
      klass.id,
      nextSessionStart,
      nextSessionEnd,
      'N5 vocabulary review',
      SessionStatus.SCHEDULED,
      teacher.id,
      teacher.id,
      teacher.id,
    );
  } else {
    await prisma.teachingSession.upsert({
      where: { id: smokeSessionId },
      update: {
        startTime: nextSessionStart,
        endTime: nextSessionEnd,
        status: SessionStatus.SCHEDULED,
        lessonTopic: 'N5 vocabulary review',
      },
      create: {
        id: smokeSessionId,
        teacherId: teacher.id,
        classId: klass.id,
        startTime: nextSessionStart,
        endTime: nextSessionEnd,
        status: SessionStatus.SCHEDULED,
        lessonTopic: 'N5 vocabulary review',
        createdBy: teacher.id,
      },
    });
  }

  const document = await prisma.document.upsert({
    where: { id: '00000000-0000-0000-0000-000000000042' },
    update: {
      title: 'N5 Vocabulary Practice',
      category: 'N5',
      url: 'https://example.com/n5-vocabulary-practice',
      deletedAt: null,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000042',
      teacherId: teacher.id,
      title: 'N5 Vocabulary Practice',
      description: 'Student smoke-test learning material.',
      type: DocumentType.LINK,
      category: 'N5',
      url: 'https://example.com/n5-vocabulary-practice',
      ownerId: teacher.id,
      createdBy: teacher.id,
    },
  });

  await prisma.documentAssignment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000043' },
    update: {
      documentId: document.id,
      targetType: DocumentTargetType.CLASS,
      classId: klass.id,
      studentId: null,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000043',
      documentId: document.id,
      targetType: DocumentTargetType.CLASS,
      classId: klass.id,
    },
  });

  const tuition = await prisma.tuition.upsert({
    where: { id: '00000000-0000-0000-0000-000000000044' },
    update: {
      totalAmount: 1200000,
      paidAmount: 500000,
      status: PaymentStatus.PARTIALLY_PAID,
      dueDate: new Date('2026-07-15T00:00:00.000Z'),
    },
    create: {
      id: '00000000-0000-0000-0000-000000000044',
      teacherId: teacher.id,
      studentId: student.id,
      classId: klass.id,
      totalAmount: 1200000,
      paidAmount: 500000,
      status: PaymentStatus.PARTIALLY_PAID,
      dueDate: new Date('2026-07-15T00:00:00.000Z'),
      notes: 'Phase 4 student smoke tuition.',
      createdBy: teacher.id,
      updatedBy: teacher.id,
    },
  });

  await prisma.paymentRecord.upsert({
    where: { receiptNumber: 'SMOKE-STUDENT-001' },
    update: {
      tuitionId: tuition.id,
      amount: 500000,
      method: 'transfer',
      note: 'Seeded partial payment for student smoke test.',
    },
    create: {
      tuitionId: tuition.id,
      amount: 500000,
      method: 'transfer',
      receiptNumber: 'SMOKE-STUDENT-001',
      note: 'Seeded partial payment for student smoke test.',
      createdBy: teacher.id,
    },
  });

  await prisma.score.upsert({
    where: { id: '00000000-0000-0000-0000-000000000045' },
    update: {
      value: 8.5,
      maxValue: 10,
      label: 'Vocabulary quiz',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000045',
      teacherId: teacher.id,
      studentId: student.id,
      classId: klass.id,
      type: ScoreType.QUIZ,
      label: 'Vocabulary quiz',
      value: 8.5,
      maxValue: 10,
      createdBy: teacher.id,
    },
  });

  await prisma.studentComment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000046' },
    update: {
      category: 'Progress',
      content: 'Good improvement on vocabulary recall. Keep reviewing particles before the next class.',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000046',
      teacherId: teacher.id,
      studentId: student.id,
      authorId: teacher.id,
      category: 'Progress',
      content: 'Good improvement on vocabulary recall. Keep reviewing particles before the next class.',
    },
  });

  console.log('Seed complete:', {
    superAdmin: superAdmin.email,
    teacher: teacher.email,
    student: student.email,
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
