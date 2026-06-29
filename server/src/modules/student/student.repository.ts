import { Injectable } from '@nestjs/common';
import { Prisma, Role, StudyStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const STUDENT_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  avatarKey: true,
  status: true,
  createdAt: true,
  studentProfile: true,
  // Classes the student is currently enrolled in (for the "Lớp học" column).
  enrollments: {
    where: { class: { deletedAt: null } },
    select: {
      class: {
        select: {
          id: true,
          name: true,
          locationType: true,
          room: true,
          meetingProvider: true,
          meetingUrl: true,
        },
      },
    },
    orderBy: { enrolledAt: 'asc' },
  },
  _count: { select: { enrollments: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByTeacher(
    teacherId: string,
    search: string | undefined,
    status: StudyStatus | undefined,
    skip: number,
    take: number,
  ) {
    const where: Prisma.UserWhereInput = {
      teacherId,
      role: Role.STUDENT,
      deletedAt: null,
      ...(status ? { studentProfile: { studyStatus: status } } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: STUDENT_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  findStudentForTenant(studentId: string, teacherId: string) {
    return this.prisma.user.findFirst({
      where: { id: studentId, teacherId, role: Role.STUDENT, deletedAt: null },
      select: {
        ...STUDENT_SELECT,
        teacher: { select: { id: true, fullName: true } },
        enrollments: {
          // Keep enrollments to archived (soft-deleted) classes too; the UI shows
          // them struck-through. isActive=false marks an archived class.
          include: {
            class: {
              select: {
                id: true,
                name: true,
                level: true,
                isActive: true,
                locationType: true,
                room: true,
                meetingProvider: true,
                meetingUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // ----- Payments (tuition + records) -----
  listTuitions(studentId: string, teacherId: string) {
    return this.prisma.tuition.findMany({
      where: { studentId, teacherId },
      include: {
        class: { select: { id: true, name: true } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----- Enrollments with join date (for the activity timeline) -----
  listEnrollmentsWithDate(studentId: string, teacherId: string) {
    return this.prisma.classEnrollment.findMany({
      where: { studentId, class: { teacherId, deletedAt: null } },
      include: { class: { select: { id: true, name: true } } },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async updateProfile(
    studentId: string,
    userData: Prisma.UserUpdateInput,
    profileData: Prisma.StudentProfileUpdateWithoutUserInput &
      Prisma.StudentProfileCreateWithoutUserInput,
  ) {
    return this.prisma.user.update({
      where: { id: studentId },
      data: {
        ...userData,
        studentProfile: {
          upsert: { create: profileData, update: profileData },
        },
      },
      select: STUDENT_SELECT,
    });
  }

  // ----- Scores -----
  createScore(data: Prisma.ScoreUncheckedCreateInput) {
    return this.prisma.score.create({ data });
  }

  listScores(studentId: string, teacherId: string) {
    return this.prisma.score.findMany({
      where: { studentId, teacherId },
      include: { class: { select: { id: true, name: true } } },
      orderBy: { scoredAt: 'desc' },
    });
  }

  updateScore(id: string, teacherId: string, data: Prisma.ScoreUpdateInput) {
    return this.prisma.score.updateMany({ where: { id, teacherId }, data });
  }

  deleteScore(id: string, teacherId: string) {
    return this.prisma.score.deleteMany({ where: { id, teacherId } });
  }

  findScore(id: string, teacherId: string) {
    return this.prisma.score.findFirst({ where: { id, teacherId } });
  }

  // ----- Comments -----
  createComment(data: Prisma.StudentCommentUncheckedCreateInput) {
    return this.prisma.studentComment.create({ data });
  }

  listComments(studentId: string, teacherId: string) {
    return this.prisma.studentComment.findMany({
      where: { studentId, teacherId },
      include: { author: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  deleteComment(id: string, teacherId: string) {
    return this.prisma.studentComment.deleteMany({ where: { id, teacherId } });
  }
}
