import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const SESSION_INCLUDE = {
  class: { select: { id: true, name: true, color: true, level: true } },
  assistants: {
    include: {
      assistant: { select: { id: true, fullName: true, email: true } },
    },
  },
} satisfies Prisma.TeachingSessionInclude;

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOneForTenant(id: string, teacherId: string) {
    return this.prisma.teachingSession.findFirst({
      where: { id, teacherId, deletedAt: null },
      include: SESSION_INCLUDE,
    });
  }

  findInRange(where: Prisma.TeachingSessionWhereInput) {
    return this.prisma.teachingSession.findMany({
      where: { deletedAt: null, ...where },
      include: SESSION_INCLUDE,
      orderBy: { startTime: 'asc' },
    });
  }

  softDelete(id: string, teacherId: string) {
    return this.prisma.teachingSession.updateMany({
      where: { id, teacherId, deletedAt: null },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });
  }

  /**
   * Finds sessions for a teacher that overlap [start, end), optionally
   * excluding one session id (used on update). Cancelled sessions ignored.
   */
  findTeacherOverlaps(teacherId: string, start: Date, end: Date, excludeId?: string) {
    return this.prisma.teachingSession.findMany({
      where: {
        teacherId,
        deletedAt: null,
        status: { not: 'CANCELLED' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true, startTime: true, endTime: true },
    });
  }

  /**
   * Finds sessions where any of the given assistants is assigned and which
   * overlap [start, end).
   */
  findAssistantOverlaps(assistantIds: string[], start: Date, end: Date, excludeId?: string) {
    return this.prisma.teachingSession.findMany({
      where: {
        deletedAt: null,
        status: { not: 'CANCELLED' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startTime: { lt: end },
        endTime: { gt: start },
        assistants: { some: { assistantId: { in: assistantIds } } },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        assistants: { select: { assistantId: true } },
      },
    });
  }

  async createWithAssistants(
    data: Prisma.TeachingSessionUncheckedCreateInput,
    assistantIds: string[],
  ) {
    return this.prisma.teachingSession.create({
      data: {
        ...data,
        assistants: assistantIds.length
          ? { create: assistantIds.map((assistantId) => ({ assistantId })) }
          : undefined,
      },
      include: SESSION_INCLUDE,
    });
  }

  async createManyWithAssistants(
    rows: Prisma.TeachingSessionUncheckedCreateInput[],
    assistantIds: string[],
  ) {
    return this.prisma.$transaction(
      rows.map((row) =>
        this.prisma.teachingSession.create({
          data: {
            ...row,
            assistants: assistantIds.length
              ? { create: assistantIds.map((assistantId) => ({ assistantId })) }
              : undefined,
          },
        }),
      ),
    );
  }

  async updateWithAssistants(
    id: string,
    data: Prisma.TeachingSessionUpdateInput,
    assistantIds: string[] | undefined,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.teachingSession.update({ where: { id }, data });
      if (assistantIds) {
        await tx.sessionAssistant.deleteMany({ where: { sessionId: id } });
        if (assistantIds.length) {
          await tx.sessionAssistant.createMany({
            data: assistantIds.map((assistantId) => ({ sessionId: id, assistantId })),
          });
        }
      }
      return tx.teachingSession.findUniqueOrThrow({
        where: { id },
        include: SESSION_INCLUDE,
      });
    });
  }
}
