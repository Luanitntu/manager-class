import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const SESSION_INCLUDE = {
  class: {
    select: {
      id: true,
      name: true,
      color: true,
      level: true,
      locationType: true,
      room: true,
      meetingProvider: true,
      meetingUrl: true,
    },
  },
  instructor: { select: { id: true, fullName: true, email: true } },
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
      // Also exclude sessions whose class was soft-deleted (guards against any
      // orphaned sessions left behind by a class delete).
      where: { deletedAt: null, class: { deletedAt: null }, ...where },
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
   * Sessions for a given instructor that overlap [start, end), optionally
   * excluding one id (used on update). Cancelled sessions are ignored.
   */
  findInstructorOverlaps(instructorId: string, start: Date, end: Date, excludeId?: string) {
    return this.prisma.teachingSession.findMany({
      where: {
        instructorId,
        deletedAt: null,
        status: { not: 'CANCELLED' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true, startTime: true, endTime: true },
    });
  }

  create(data: Prisma.TeachingSessionUncheckedCreateInput) {
    return this.prisma.teachingSession.create({ data, include: SESSION_INCLUDE });
  }

  createMany(rows: Prisma.TeachingSessionUncheckedCreateInput[]) {
    return this.prisma.$transaction(
      rows.map((data) => this.prisma.teachingSession.create({ data })),
    );
  }

  update(id: string, data: Prisma.TeachingSessionUpdateInput) {
    return this.prisma.teachingSession.update({
      where: { id },
      data,
      include: SESSION_INCLUDE,
    });
  }
}
