import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SalaryMethod } from '@prisma/client';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AssistantRepository } from './assistant.repository';
import { SalaryQueryDto, UpdateSalaryDto } from './dto/assistant.dto';
import { calculateSalary, calculateSalaryWithRates, RatePeriod, SalaryResult } from './salary.util';

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
    if (dto.phone !== undefined) {
      await this.repo.updatePhone(assistantId, dto.phone);
    }

    // Record a new rate-history entry only when the rate/method/date actually
    // changed (so profile-only edits don't spam the history).
    const effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();
    const latest = await this.repo.latestRate(assistantId);
    const changed =
      !latest ||
      latest.method !== dto.salaryMethod ||
      Number(latest.rate) !== dto.salaryRate ||
      latest.effectiveFrom.getTime() !== effectiveFrom.getTime();
    if (changed) {
      await this.repo.createRate({
        assistantId,
        method: dto.salaryMethod,
        rate: dto.salaryRate,
        effectiveFrom,
      });
    }

    return this.repo.upsertSalary(assistantId, {
      salaryMethod: dto.salaryMethod,
      salaryRate: dto.salaryRate,
      salaryEffectiveFrom: effectiveFrom,
      bio: dto.bio,
      level: dto.level,
      hometown: dto.hometown,
    });
  }

  // Salary summary: rate-history-aware. All-time (+ per-class subtotals) + this month
  // + last-6-month history + next payroll + the rate-change history.
  async getSalarySummary(actor: AuthenticatedUser, assistantId: string) {
    await this.assertAccess(actor, assistantId);

    const rateRows = await this.repo.listRates(assistantId);
    let periods: RatePeriod[] = rateRows.map((r) => ({
      method: r.method,
      rate: Number(r.rate),
      effectiveFrom: r.effectiveFrom,
    }));
    // Fallback for assistants without any rate history yet.
    if (!periods.length) {
      const profile = await this.repo.getProfile(assistantId);
      periods = [
        {
          method: profile?.salaryMethod ?? SalaryMethod.PER_SESSION,
          rate: profile ? Number(profile.salaryRate) : 0,
          effectiveFrom: profile?.salaryEffectiveFrom ?? new Date(0),
        },
      ];
    }

    const sessions = (await this.repo.findAssignedSessions(assistantId)).map((s) => ({
      classId: s.class.id,
      className: s.class.name,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const total = calculateSalaryWithRates(sessions, periods);

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const thisMonth = calculateSalaryWithRates(
      sessions.filter((s) => s.startTime >= monthStart),
      periods,
    );

    // Last 6 months (including current), newest first.
    const history: Array<{ month: string; amount: number; sessions: number; hours: number }> = [];
    for (let i = 0; i < 6; i++) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      const monthSessions = sessions.filter((s) => s.startTime >= start && s.startTime < end);
      if (i > 0 && monthSessions.length === 0) continue; // keep current month even if empty
      const r = calculateSalaryWithRates(monthSessions, periods);
      history.push({
        month: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
        amount: r.totalAmount,
        sessions: r.totalSessions,
        hours: r.totalHours,
      });
    }

    // Next payroll = last day of the current month.
    const nextPayroll = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

    return {
      method: total.method,
      rate: total.rate,
      effectiveFrom: rateRows[0]?.effectiveFrom ?? null,
      total: {
        totalAmount: total.totalAmount,
        totalSessions: total.totalSessions,
        totalHours: total.totalHours,
        totalClasses: total.totalClasses,
      },
      byClass: total.byClass,
      thisMonth: {
        totalAmount: thisMonth.totalAmount,
        totalSessions: thisMonth.totalSessions,
        totalHours: thisMonth.totalHours,
      },
      nextPayroll,
      history,
      rates: rateRows.map((r) => ({
        method: r.method,
        rate: Number(r.rate),
        effectiveFrom: r.effectiveFrom,
      })),
    };
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
