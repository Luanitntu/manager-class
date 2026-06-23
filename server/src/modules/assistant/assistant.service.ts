import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SalaryMethod } from '@prisma/client';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AssistantRepository } from './assistant.repository';
import { SalaryQueryDto, UpdateSalaryDto } from './dto/assistant.dto';
import { calculateSalary, SalaryResult } from './salary.util';

@Injectable()
export class AssistantService {
  constructor(private readonly repo: AssistantRepository) {}

  private teacherScope(actor: AuthenticatedUser): string {
    if (!actor.tenantId) {
      throw new ForbiddenException('No tenant context');
    }
    return actor.tenantId;
  }

  async list(actor: AuthenticatedUser, query: PaginationQueryDto) {
    const teacherId = this.teacherScope(actor);
    const [items, total] = await this.repo.listByTeacher(
      teacherId,
      query.search,
      query.skip,
      query.limit,
    );
    return new PaginatedResult(items, total, query.page, query.limit);
  }

  async getOne(actor: AuthenticatedUser, assistantId: string) {
    await this.assertAccess(actor, assistantId);
    const teacherId = this.teacherScope(actor);
    const assistant = await this.repo.findForTenant(assistantId, teacherId);
    if (!assistant) {
      throw new NotFoundException('Assistant not found');
    }
    return assistant;
  }

  async updateSalary(actor: AuthenticatedUser, assistantId: string, dto: UpdateSalaryDto) {
    const teacherId = this.teacherScope(actor);
    const exists = await this.repo.exists(assistantId, teacherId);
    if (!exists) {
      throw new NotFoundException('Assistant not found');
    }
    return this.repo.upsertSalary(assistantId, {
      salaryMethod: dto.salaryMethod,
      salaryRate: dto.salaryRate,
      bio: dto.bio,
    });
  }

  async getSalary(
    actor: AuthenticatedUser,
    assistantId: string,
    query: SalaryQueryDto,
  ): Promise<SalaryResult> {
    await this.assertAccess(actor, assistantId);

    const profile = await this.repo.getProfile(assistantId);
    const method = profile?.salaryMethod ?? SalaryMethod.PER_SESSION;
    const rate = profile ? Number(profile.salaryRate) : 0;

    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const sessions = await this.repo.findAssignedSessions(assistantId, from, to);

    return calculateSalary(
      method,
      rate,
      sessions.map((s) => ({
        classId: s.class.id,
        className: s.class.name,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    );
  }

  async listSessions(actor: AuthenticatedUser, assistantId: string) {
    await this.assertAccess(actor, assistantId);
    return this.repo.listInstructedSessions(assistantId, this.teacherScope(actor));
  }

  // Assistant may view their own record; teacher views any in their tenant.
  private async assertAccess(actor: AuthenticatedUser, assistantId: string): Promise<void> {
    if (actor.role === Role.ASSISTANT) {
      if (actor.id !== assistantId) {
        throw new ForbiddenException('Cannot access another assistant');
      }
      return;
    }
    const teacherId = this.teacherScope(actor);
    const exists = await this.repo.exists(assistantId, teacherId);
    if (!exists) {
      throw new NotFoundException('Assistant not found');
    }
  }
}
