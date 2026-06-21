import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const STUDENT_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  status: true,
  createdAt: true,
  studentProfile: true,
  _count: { select: { enrollments: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByTeacher(teacherId: string, search: string | undefined, skip: number, take: number) {
    const where: Prisma.UserWhereInput = {
      teacherId,
      role: Role.STUDENT,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
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
        enrollments: {
          include: { class: { select: { id: true, name: true, level: true } } },
        },
      },
    });
  }

  findStudentTenant(studentId: string) {
    return this.prisma.user.findFirst({
      where: { id: studentId, role: Role.STUDENT, deletedAt: null },
      select: { id: true, teacherId: true },
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
      orderBy: { createdAt: 'desc' },
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
