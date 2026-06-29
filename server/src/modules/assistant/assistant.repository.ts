import { Injectable } from '@nestjs/common';
import { Prisma, Role, SalaryMethod } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const ASSISTANT_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  avatarKey: true,
  status: true,
  createdAt: true,
  assistantProfile: true,
  _count: { select: { classAssignments: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AssistantRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByTeacher(teacherId: string, search: string | undefined, skip: number, take: number) {
    const where: Prisma.UserWhereInput = {
      teacherId,
      role: Role.ASSISTANT,
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
        select: ASSISTANT_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  findForTenant(assistantId: string, teacherId: string) {
    return this.prisma.user.findFirst({
      where: { id: assistantId, teacherId, role: Role.ASSISTANT, deletedAt: null },
      select: {
        ...ASSISTANT_SELECT,
        classAssignments: {
          include: { class: { select: { id: true, name: true, level: true } } },
        },
      },
    });
  }

  exists(assistantId: string, teacherId: string) {
    return this.prisma.user.findFirst({
      where: { id: assistantId, teacherId, role: Role.ASSISTANT, deletedAt: null },
      select: { id: true },
    });
  }

  upsertSalary(assistantId: string, data: Prisma.AssistantProfileCreateWithoutUserInput) {
    return this.prisma.assistantProfile.upsert({
      where: { userId: assistantId },
      create: { ...data, user: { connect: { id: assistantId } } },
      update: data,
    });
  }

  updatePhone(assistantId: string, phone: string) {
    return this.prisma.user.update({ where: { id: assistantId }, data: { phone } });
  }

  getProfile(assistantId: string) {
    return this.prisma.assistantProfile.findUnique({ where: { userId: assistantId } });
  }

  // ----- Salary rate history -----
  listRates(assistantId: string) {
    return this.prisma.assistantSalaryRate.findMany({
      where: { assistantId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  latestRate(assistantId: string) {
    return this.prisma.assistantSalaryRate.findFirst({
      where: { assistantId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  createRate(data: {
    assistantId: string;
    method: SalaryMethod;
    rate: number;
    effectiveFrom: Date;
  }) {
    return this.prisma.assistantSalaryRate.create({ data });
  }

  /**
   * Sessions the assistant is assigned to (non-cancelled), grouped per class,
   * for salary calculation. Optionally bounded by a date range.
   */
  /** Full session detail for an assistant's teaching schedule (tenant-scoped). */
  listInstructedSessions(assistantId: string, teacherId: string) {
    return this.prisma.teachingSession.findMany({
      where: { instructorId: assistantId, teacherId, deletedAt: null },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        lessonTopic: true,
        status: true,
        class: { select: { id: true, name: true, level: true, color: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  findAssignedSessions(assistantId: string, from?: Date, to?: Date) {
    return this.prisma.teachingSession.findMany({
      where: {
        deletedAt: null,
        status: { not: 'CANCELLED' },
        instructorId: assistantId,
        ...(from || to
          ? { startTime: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
          : {}),
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        class: { select: { id: true, name: true } },
      },
    });
  }
}
