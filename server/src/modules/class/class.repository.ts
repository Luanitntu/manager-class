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

  async findManyByTeacher(
    teacherId: string,
    where: Prisma.ClassWhereInput,
    skip: number,
    take: number,
  ) {
    const fullWhere: Prisma.ClassWhereInput = { teacherId, deletedAt: null, ...where };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where: fullWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          // "sessions" count excludes cancelled/soft-deleted so it reflects the
          // real course length and drives an accurate progress denominator.
          _count: {
            select: {
              enrollments: true,
              sessions: { where: { status: { not: 'CANCELLED' }, deletedAt: null } },
            },
          },
          // First few active students for the card avatar stack.
          enrollments: {
            where: { status: 'ACTIVE' },
            take: 3,
            orderBy: { enrolledAt: 'asc' },
            select: { student: { select: { id: true, fullName: true, avatarKey: true } } },
          },
        },
      }),
      this.prisma.class.count({ where: fullWhere }),
    ]);

    // Completed-session counts per class (drives the progress bar). One grouped
    // query instead of N per-class counts.
    const ids = items.map((c) => c.id);
    const completedGroups = ids.length
      ? await this.prisma.teachingSession.groupBy({
          by: ['classId'],
          where: { classId: { in: ids }, status: 'COMPLETED', deletedAt: null },
          _count: { _all: true },
        })
      : [];
    const completedById = new Map(completedGroups.map((g) => [g.classId, g._count._all]));

    const mapped = items.map(({ enrollments, ...c }) => ({
      ...c,
      completedSessions: completedById.get(c.id) ?? 0,
      students: enrollments.map((e) => e.student),
    }));

    return [mapped, total] as const;
  }

  findOneForTenant(id: string, teacherId: string) {
    return this.prisma.class.findFirst({
      where: { id, teacherId, deletedAt: null },
      include: {
        _count: {
          select: {
            enrollments: true,
            sessions: { where: { status: { not: 'CANCELLED' }, deletedAt: null } },
            assistants: true,
          },
        },
      },
    });
  }

  update(id: string, teacherId: string, data: Prisma.ClassUpdateInput) {
    return this.prisma.class.updateMany({ where: { id, teacherId, deletedAt: null }, data });
  }

  // Counts of everything that references the class — used to decide whether a
  // delete can be permanent (hard) or must be soft (to preserve history).
  findActivityCounts(id: string, teacherId: string) {
    return this.prisma.class.findFirst({
      where: { id, teacherId, deletedAt: null },
      select: {
        id: true,
        _count: {
          select: {
            enrollments: true,
            sessions: true,
            tuitions: true,
            scores: true,
            assistants: true,
            documentAssignments: true,
          },
        },
      },
    });
  }

  hardDelete(id: string, teacherId: string) {
    return this.prisma.class.deleteMany({ where: { id, teacherId } });
  }

  async softDelete(id: string, teacherId: string) {
    const now = new Date();
    // Cascade: soft-delete the class AND its sessions so they disappear from the
    // calendar, dashboards, and conflict detection. Tuition/score history is kept.
    const [classResult] = await this.prisma.$transaction([
      this.prisma.class.updateMany({
        where: { id, teacherId, deletedAt: null },
        data: { deletedAt: now, isActive: false },
      }),
      this.prisma.teachingSession.updateMany({
        where: { classId: id, teacherId, deletedAt: null },
        data: { deletedAt: now, status: 'CANCELLED' },
      }),
    ]);
    return classResult;
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
        student: {
          select: { id: true, fullName: true, email: true, avatarUrl: true, avatarKey: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  listSessions(classId: string, teacherId: string) {
    return this.prisma.teachingSession.findMany({
      where: { classId, teacherId, deletedAt: null },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        lessonTopic: true,
        status: true,
        instructor: { select: { id: true, fullName: true } },
      },
      orderBy: { startTime: 'desc' },
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
        assistant: {
          select: { id: true, fullName: true, email: true, avatarUrl: true, avatarKey: true },
        },
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
