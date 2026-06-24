import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LocationType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ClassRepository } from './class.repository';
import { AuditService } from '../audit/audit.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';

@Injectable()
export class ClassService {
  constructor(
    private readonly repo: ClassRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  private tenantId(actor: AuthenticatedUser): string {
    if (!actor.tenantId) {
      throw new ForbiddenException('No tenant context');
    }
    return actor.tenantId;
  }

  // Keep location fields consistent: an online class has no room; an offline one
  // has no meeting link. Returns {} when locationType isn't being changed.
  private locationData(dto: CreateClassDto | UpdateClassDto) {
    if (dto.locationType === LocationType.ONLINE) {
      return {
        locationType: LocationType.ONLINE,
        room: null,
        meetingProvider: dto.meetingProvider ?? null,
        meetingUrl: dto.meetingUrl ?? null,
      };
    }
    if (dto.locationType === LocationType.OFFLINE) {
      return {
        locationType: LocationType.OFFLINE,
        room: dto.room ?? null,
        meetingProvider: null,
        meetingUrl: null,
      };
    }
    return {};
  }

  async create(actor: AuthenticatedUser, dto: CreateClassDto) {
    const teacherId = this.tenantId(actor);
    const klass = await this.repo.create({
      teacherId,
      name: dto.name,
      description: dto.description,
      level: dto.level,
      color: dto.color,
      totalSessions: dto.totalSessions,
      ...this.locationData(dto),
      createdBy: actor.id,
      updatedBy: actor.id,
    });
    await this.audit.log(actor, {
      action: 'CLASS_CREATED',
      entityType: 'Class',
      entityId: klass.id,
      newValue: { name: klass.name },
    });
    return klass;
  }

  async findAll(actor: AuthenticatedUser, query: PaginationQueryDto) {
    // Role-scoped listing per the permission matrix.
    if (actor.role === Role.ASSISTANT) {
      const [items, total] = await this.repo.findAssignedToAssistant(
        actor.id,
        query.skip,
        query.limit,
      );
      return new PaginatedResult(items, total, query.page, query.limit);
    }
    if (actor.role === Role.STUDENT) {
      const [items, total] = await this.repo.findEnrolledForStudent(
        actor.id,
        query.skip,
        query.limit,
      );
      return new PaginatedResult(items, total, query.page, query.limit);
    }

    const where: Prisma.ClassWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};
    const [items, total] = await this.repo.findManyByTeacher(
      this.tenantId(actor),
      where,
      query.skip,
      query.limit,
    );
    return new PaginatedResult(items, total, query.page, query.limit);
  }

  async findOne(actor: AuthenticatedUser, id: string) {
    const klass = await this.repo.findOneForTenant(id, this.tenantId(actor));
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
    if (actor.role === Role.ASSISTANT) {
      await this.assertAssistantAssigned(id, actor.id);
    } else if (actor.role === Role.STUDENT) {
      await this.assertStudentEnrolled(id, actor.id);
    }
    return klass;
  }

  async update(actor: AuthenticatedUser, id: string, dto: UpdateClassDto) {
    const teacherId = this.tenantId(actor);
    const result = await this.repo.update(id, teacherId, {
      ...dto,
      // Override raw location fields with a normalized set (clears the unused side).
      ...this.locationData(dto),
      updatedBy: actor.id,
    });
    if (result.count === 0) {
      throw new NotFoundException('Class not found');
    }
    await this.audit.log(actor, {
      action: 'CLASS_UPDATED',
      entityType: 'Class',
      entityId: id,
    });
    return this.repo.findOneForTenant(id, teacherId);
  }

  async remove(actor: AuthenticatedUser, id: string) {
    const teacherId = this.tenantId(actor);
    const klass = await this.repo.findActivityCounts(id, teacherId);
    if (!klass) {
      throw new NotFoundException('Class not found');
    }

    const c = klass._count;
    const dependentRows =
      c.enrollments + c.sessions + c.tuitions + c.scores + c.assistants + c.documentAssignments;

    // Empty class (nothing ever generated) → permanent delete, nothing to lose.
    if (dependentRows === 0) {
      await this.repo.hardDelete(id, teacherId);
      await this.audit.log(actor, {
        action: 'CLASS_DELETED',
        entityType: 'Class',
        entityId: id,
        newValue: { hard: true },
      });
      return { deleted: true, hard: true };
    }

    // Has students / sessions / tuition / scores → soft delete to keep history.
    const result = await this.repo.softDelete(id, teacherId);
    if (result.count === 0) {
      throw new NotFoundException('Class not found');
    }
    await this.audit.log(actor, {
      action: 'CLASS_DELETED',
      entityType: 'Class',
      entityId: id,
      newValue: { hard: false },
    });
    return { deleted: true, hard: false };
  }

  // ----- Enrollment -----
  async enrollStudent(actor: AuthenticatedUser, classId: string, studentId: string, note?: string) {
    const teacherId = this.tenantId(actor);
    await this.assertClassOwned(classId, teacherId);
    await this.assertMemberInTenant(studentId, teacherId, Role.STUDENT);
    const enrollment = await this.repo.enrollStudent(classId, studentId);

    // Optional note about the student — stored as a StudentComment so it shows
    // up in the student's profile (Students menu) as well.
    if (note && note.trim()) {
      await this.prisma.studentComment.create({
        data: {
          teacherId,
          studentId,
          authorId: actor.id,
          category: 'note',
          content: note.trim(),
        },
      });
    }
    return enrollment;
  }

  async unenrollStudent(actor: AuthenticatedUser, classId: string, studentId: string) {
    await this.assertClassOwned(classId, this.tenantId(actor));
    await this.repo.removeEnrollment(classId, studentId);
    return { removed: true };
  }

  async listEnrollments(actor: AuthenticatedUser, classId: string) {
    await this.findOne(actor, classId);
    return this.repo.listEnrollments(classId);
  }

  async listSessions(actor: AuthenticatedUser, classId: string) {
    await this.findOne(actor, classId);
    return this.repo.listSessions(classId, this.tenantId(actor));
  }

  // ----- Assistant assignment -----
  async assignAssistant(actor: AuthenticatedUser, classId: string, assistantId: string) {
    const teacherId = this.tenantId(actor);
    await this.assertClassOwned(classId, teacherId);
    await this.assertMemberInTenant(assistantId, teacherId, Role.ASSISTANT);
    return this.repo.assignAssistant(classId, assistantId);
  }

  async unassignAssistant(actor: AuthenticatedUser, classId: string, assistantId: string) {
    await this.assertClassOwned(classId, this.tenantId(actor));
    await this.repo.removeAssistant(classId, assistantId);
    return { removed: true };
  }

  async listAssistants(actor: AuthenticatedUser, classId: string) {
    await this.findOne(actor, classId);
    return this.repo.listAssistants(classId);
  }

  // ----------------------------------------------------------------
  // Guards / invariants
  // ----------------------------------------------------------------

  private async assertClassOwned(classId: string, teacherId: string): Promise<void> {
    const klass = await this.repo.findOneForTenant(classId, teacherId);
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
  }

  private async assertMemberInTenant(userId: string, teacherId: string, role: Role): Promise<void> {
    const member = await this.prisma.user.findFirst({
      where: { id: userId, teacherId, role, deletedAt: null },
    });
    if (!member) {
      throw new NotFoundException(`${role.toLowerCase()} not found in your tenant`);
    }
  }

  private async assertAssistantAssigned(classId: string, assistantId: string): Promise<void> {
    const assigned = await this.prisma.classAssistant.findUnique({
      where: { classId_assistantId: { classId, assistantId } },
    });
    if (!assigned) {
      throw new ForbiddenException('Not assigned to this class');
    }
  }

  private async assertStudentEnrolled(classId: string, studentId: string): Promise<void> {
    const enrolled = await this.prisma.classEnrollment.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });
    if (!enrolled) {
      throw new ForbiddenException('Not enrolled in this class');
    }
  }
}
