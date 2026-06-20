import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Data-access for classes. All queries are tenant-scoped by `teacherId`
 * passed from the service — the repository never trusts a raw id alone.
 */
@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ClassUncheckedCreateInput) {
    return this.prisma.class.create({ data });
  }

  findManyByTeacher(teacherId: string, where: Prisma.ClassWhereInput, skip: number, take: number) {
    const fullWhere: Prisma.ClassWhereInput = { teacherId, deletedAt: null, ...where };
    return this.prisma.$transaction([
      this.prisma.class.findMany({
        where: fullWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { enrollments: true, sessions: true } } },
      }),
      this.prisma.class.count({ where: fullWhere }),
    ]);
  }

  findOneForTenant(id: string, teacherId: string) {
    return this.prisma.class.findFirst({
      where: { id, teacherId, deletedAt: null },
      include: {
        _count: { select: { enrollments: true, sessions: true, assistants: true } },
      },
    });
  }

  update(id: string, teacherId: string, data: Prisma.ClassUpdateInput) {
    return this.prisma.class.updateMany({ where: { id, teacherId, deletedAt: null }, data });
  }

  softDelete(id: string, teacherId: string) {
    return this.prisma.class.updateMany({
      where: { id, teacherId, deletedAt: null },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // ----- Enrollments -----
  enrollStudent(classId: string, studentId: string) {
    return this.prisma.classEnrollment.upsert({
      where: { classId_studentId: { classId, studentId } },
      update: { status: 'ACTIVE' },
      create: { classId, studentId },
    });
  }

  removeEnrollment(classId: string, studentId: string) {
    return this.prisma.classEnrollment.deleteMany({ where: { classId, studentId } });
  }

  listEnrollments(classId: string) {
    return this.prisma.classEnrollment.findMany({
      where: { classId },
      include: {
        student: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });
  }

  // ----- Assistant assignment -----
  assignAssistant(classId: string, assistantId: string) {
    return this.prisma.classAssistant.upsert({
      where: { classId_assistantId: { classId, assistantId } },
      update: {},
      create: { classId, assistantId },
    });
  }

  removeAssistant(classId: string, assistantId: string) {
    return this.prisma.classAssistant.deleteMany({ where: { classId, assistantId } });
  }

  listAssistants(classId: string) {
    return this.prisma.classAssistant.findMany({
      where: { classId },
      include: {
        assistant: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });
  }

  // ----- Scoping helpers for assistant/student views -----
  findAssignedToAssistant(assistantId: string, skip: number, take: number) {
    const where: Prisma.ClassWhereInput = {
      deletedAt: null,
      assistants: { some: { assistantId } },
    };
    return this.prisma.$transaction([
      this.prisma.class.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.class.count({ where }),
    ]);
  }

  findEnrolledForStudent(studentId: string, skip: number, take: number) {
    const where: Prisma.ClassWhereInput = {
      deletedAt: null,
      enrollments: { some: { studentId } },
    };
    return this.prisma.$transaction([
      this.prisma.class.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.class.count({ where }),
    ]);
  }
}
