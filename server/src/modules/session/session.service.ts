import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { SessionRepository } from './session.repository';
import { SessionConflictService } from './session-conflict.service';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';
import { generateRecurringSlots } from './recurrence.util';
import {
  BulkCreateSessionDto,
  CreateSessionDto,
  SessionRangeQueryDto,
  UpdateSessionDto,
} from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(
    private readonly repo: SessionRepository,
    private readonly conflicts: SessionConflictService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  private tenantId(actor: AuthenticatedUser): string {
    if (!actor.tenantId) {
      throw new ForbiddenException('No tenant context');
    }
    return actor.tenantId;
  }

  // ----- Calendar range query (primary read path) -----
  async findInRange(actor: AuthenticatedUser, query: SessionRangeQueryDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);
    const base: Prisma.TeachingSessionWhereInput = {
      startTime: { lt: to },
      endTime: { gt: from },
      ...(query.classId ? { classId: query.classId } : {}),
    };

    if (actor.role === Role.ASSISTANT) {
      // Assistants see the sessions they are assigned to teach.
      return this.repo.findInRange({ ...base, instructorId: actor.id });
    }
    if (actor.role === Role.STUDENT) {
      return this.repo.findInRange({
        ...base,
        class: { enrollments: { some: { studentId: actor.id } } },
      });
    }
    return this.repo.findInRange({ ...base, teacherId: this.tenantId(actor) });
  }

  async findOne(actor: AuthenticatedUser, id: string) {
    const session = await this.repo.findOneForTenant(id, this.tenantId(actor));
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  // ----- Create single session -----
  async create(actor: AuthenticatedUser, dto: CreateSessionDto) {
    const teacherId = this.tenantId(actor);
    await this.assertClassOwned(dto.classId, teacherId);
    const instructorId = await this.resolveInstructor(dto.instructorId, teacherId);

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    await this.conflicts.assertNoConflicts({ instructorId, start, end });

    const session = await this.repo.create({
      teacherId,
      instructorId,
      classId: dto.classId,
      startTime: start,
      endTime: end,
      lessonTopic: dto.lessonTopic,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    await this.notifications.scheduleSessionReminder(session.id, session.startTime);
    await this.audit.log(actor, {
      action: 'SESSION_CREATED',
      entityType: 'TeachingSession',
      entityId: session.id,
    });
    return session;
  }

  // ----- Bulk / recurring generation -----
  async bulkCreate(actor: AuthenticatedUser, dto: BulkCreateSessionDto) {
    const teacherId = this.tenantId(actor);
    await this.assertClassOwned(dto.classId, teacherId);
    const instructorId = await this.resolveInstructor(dto.instructorId, teacherId);

    let slots;
    try {
      slots = generateRecurringSlots({
        startDate: dto.startDate,
        endDate: dto.endDate,
        daysOfWeek: dto.daysOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        timeZone: dto.timeZone,
        tzOffsetMinutes: dto.tzOffset,
      });
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }

    if (slots.length === 0) {
      throw new BadRequestException('No sessions match the given recurrence');
    }

    await this.conflicts.assertNoConflictsBatch(instructorId, slots);

    const recurrenceGroupId = randomUUID();
    const rows = slots.map((slot) => ({
      teacherId,
      instructorId,
      classId: dto.classId,
      startTime: slot.start,
      endTime: slot.end,
      lessonTopic: dto.lessonTopic,
      recurrenceGroupId,
      createdBy: actor.id,
      updatedBy: actor.id,
    }));

    const created = await this.repo.createMany(rows);
    await Promise.all(
      created.map((s) => this.notifications.scheduleSessionReminder(s.id, s.startTime)),
    );
    return { recurrenceGroupId, count: created.length };
  }

  // ----- Update / reschedule (drag, resize, edit) -----
  async update(actor: AuthenticatedUser, id: string, dto: UpdateSessionDto) {
    const teacherId = this.tenantId(actor);
    const existing = await this.repo.findOneForTenant(id, teacherId);
    if (!existing) {
      throw new NotFoundException('Session not found');
    }

    if (dto.classId && dto.classId !== existing.classId) {
      await this.assertClassOwned(dto.classId, teacherId);
    }

    const instructorId =
      dto.instructorId !== undefined
        ? await this.resolveInstructor(dto.instructorId, teacherId)
        : existing.instructorId;

    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime;

    // Re-check conflicts when timing or instructor changes.
    const timingChanged = !!dto.startTime || !!dto.endTime;
    const instructorChanged = instructorId !== existing.instructorId;
    if (timingChanged || instructorChanged) {
      await this.conflicts.assertNoConflicts({ instructorId, start, end, excludeId: id });
    }

    const data: Prisma.TeachingSessionUpdateInput = {
      ...(dto.startTime ? { startTime: start } : {}),
      ...(dto.endTime ? { endTime: end } : {}),
      ...(dto.classId ? { class: { connect: { id: dto.classId } } } : {}),
      ...(instructorChanged ? { instructor: { connect: { id: instructorId } } } : {}),
      ...(dto.lessonTopic !== undefined ? { lessonTopic: dto.lessonTopic } : {}),
      ...(dto.status ? { status: dto.status } : {}),
      updatedBy: actor.id,
    };

    const updated = await this.repo.update(id, data);

    await this.notifications.notifySessionChanged(id, 'updated');
    if (timingChanged) {
      await this.notifications.scheduleSessionReminder(id, updated.startTime);
    }
    await this.audit.log(actor, {
      action: 'SESSION_UPDATED',
      entityType: 'TeachingSession',
      entityId: id,
    });
    return updated;
  }

  async remove(actor: AuthenticatedUser, id: string) {
    const result = await this.repo.softDelete(id, this.tenantId(actor));
    if (result.count === 0) {
      throw new NotFoundException('Session not found');
    }
    await this.notifications.notifySessionChanged(id, 'cancelled');
    await this.audit.log(actor, {
      action: 'SESSION_DELETED',
      entityType: 'TeachingSession',
      entityId: id,
    });
    return { deleted: true };
  }

  // ----------------------------------------------------------------
  // Invariants
  // ----------------------------------------------------------------

  private async assertClassOwned(classId: string, teacherId: string): Promise<void> {
    const klass = await this.prisma.class.findFirst({
      where: { id: classId, teacherId, deletedAt: null },
      select: { id: true },
    });
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
  }

  /**
   * The instructor must be the owning teacher or one of their assistants.
   * Defaults to the teacher when not specified.
   */
  private async resolveInstructor(
    instructorId: string | undefined,
    teacherId: string,
  ): Promise<string> {
    if (!instructorId || instructorId === teacherId) {
      return teacherId;
    }
    const assistant = await this.prisma.user.findFirst({
      where: { id: instructorId, teacherId, role: Role.ASSISTANT, deletedAt: null },
      select: { id: true },
    });
    if (!assistant) {
      throw new NotFoundException('Instructor must be you or one of your assistants');
    }
    return instructorId;
  }
}
