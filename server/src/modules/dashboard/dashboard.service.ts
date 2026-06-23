import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(actor: AuthenticatedUser) {
    switch (actor.role) {
      case Role.SUPER_ADMIN:
        return this.superAdminStats();
      case Role.TEACHER:
        return this.teacherStats(actor.id);
      case Role.ASSISTANT:
        return this.assistantStats(actor.id);
      default:
        return this.studentStats(actor.id);
    }
  }

  private async superAdminStats() {
    const [totalTeachers, totalStudents, totalAssistants, totalClasses, totalUsers, tuitionAgg] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { role: Role.TEACHER, deletedAt: null } }),
        this.prisma.user.count({ where: { role: Role.STUDENT, deletedAt: null } }),
        this.prisma.user.count({ where: { role: Role.ASSISTANT, deletedAt: null } }),
        this.prisma.class.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.tuition.aggregate({ _sum: { totalAmount: true, paidAmount: true } }),
      ]);

    // Revenue per teacher (top earners by collected tuition).
    const grouped = await this.prisma.tuition.groupBy({
      by: ['teacherId'],
      _sum: { paidAmount: true, totalAmount: true },
      orderBy: { _sum: { paidAmount: 'desc' } },
      take: 5,
    });
    const teacherNames = grouped.length
      ? await this.prisma.user.findMany({
          where: { id: { in: grouped.map((g) => g.teacherId) } },
          select: { id: true, fullName: true },
        })
      : [];
    const nameById = new Map(teacherNames.map((t) => [t.id, t.fullName]));
    const revenueByTeacher = grouped.map((g) => ({
      teacherId: g.teacherId,
      teacherName: nameById.get(g.teacherId) ?? '—',
      collected: Number(g._sum.paidAmount ?? 0),
      total: Number(g._sum.totalAmount ?? 0),
    }));

    const collected = Number(tuitionAgg._sum.paidAmount ?? 0);
    const totalTuition = Number(tuitionAgg._sum.totalAmount ?? 0);

    // Platform subscription revenue (V2/billing). No billing yet → zero series,
    // but the shape is final so charts work once plans ship.
    const now = new Date();
    const months: string[] = [];
    const monthRanges: Array<{ gte: Date; lt: Date }> = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      months.push(`${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`);
      monthRanges.push({ gte: start, lt: end });
    }
    const zeros = () => months.map(() => 0);
    const subscriptionRevenue = {
      months,
      byPlan: { personal: zeros(), pro: zeros(), business: zeros() },
      total: zeros(),
      grandTotal: 0,
    };

    // Real usage metrics + signups per month.
    const [totalDocuments, totalSessions, ...signupCounts] = await this.prisma.$transaction([
      this.prisma.document.count({ where: { deletedAt: null } }),
      this.prisma.teachingSession.count({ where: { deletedAt: null } }),
      ...monthRanges.map((r) =>
        this.prisma.user.count({ where: { createdAt: { gte: r.gte, lt: r.lt } } }),
      ),
    ]);

    return {
      role: Role.SUPER_ADMIN,
      totalTeachers,
      totalStudents,
      totalAssistants,
      totalClasses,
      totalUsers,
      totalDocuments,
      totalSessions,
      revenueCollected: collected,
      revenueOutstanding: totalTuition - collected,
      revenueByTeacher,
      signups: { months, counts: signupCounts },
      // Subscription plans are a V2 feature; counts are placeholders for now
      // (every teacher is treated as "trial" until billing ships).
      plans: { trial: totalTeachers, personal: 0, pro: 0, business: 0 },
      subscriptionRevenue,
    };
  }

  private async teacherStats(teacherId: string) {
    const now = new Date();
    const [totalClasses, totalStudents, tuitionAgg, upcoming] = await this.prisma.$transaction([
      this.prisma.class.count({ where: { teacherId, deletedAt: null } }),
      this.prisma.user.count({
        where: { teacherId, role: Role.STUDENT, deletedAt: null },
      }),
      this.prisma.tuition.aggregate({
        where: { teacherId },
        _sum: { totalAmount: true, paidAmount: true },
      }),
      this.prisma.teachingSession.findMany({
        where: { teacherId, deletedAt: null, startTime: { gte: now }, status: 'SCHEDULED' },
        include: { class: { select: { name: true, color: true } } },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
    ]);

    const collected = Number(tuitionAgg._sum.paidAmount ?? 0);
    const total = Number(tuitionAgg._sum.totalAmount ?? 0);
    return {
      role: Role.TEACHER,
      totalClasses,
      totalStudents,
      tuitionCollected: collected,
      outstandingTuition: total - collected,
      upcomingSessions: upcoming,
    };
  }

  private async assistantStats(assistantId: string) {
    const now = new Date();
    const [assignedClasses, totalSessions, upcoming] = await this.prisma.$transaction([
      this.prisma.classAssistant.count({ where: { assistantId } }),
      this.prisma.teachingSession.count({
        where: { instructorId: assistantId, deletedAt: null },
      }),
      this.prisma.teachingSession.findMany({
        where: {
          deletedAt: null,
          startTime: { gte: now },
          status: 'SCHEDULED',
          instructorId: assistantId,
        },
        include: { class: { select: { name: true, color: true } } },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
    ]);
    return { role: Role.ASSISTANT, assignedClasses, totalSessions, upcomingSessions: upcoming };
  }

  private async studentStats(studentId: string) {
    const now = new Date();
    const [currentClasses, tuitionAgg, upcoming, scoreCount] = await this.prisma.$transaction([
      this.prisma.classEnrollment.count({
        where: { studentId, status: 'ACTIVE' },
      }),
      this.prisma.tuition.aggregate({
        where: { studentId },
        _sum: { totalAmount: true, paidAmount: true },
      }),
      this.prisma.teachingSession.findMany({
        where: {
          deletedAt: null,
          startTime: { gte: now },
          status: 'SCHEDULED',
          class: { enrollments: { some: { studentId } } },
        },
        include: { class: { select: { name: true, color: true } } },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
      this.prisma.score.count({ where: { studentId } }),
    ]);

    const remaining =
      Number(tuitionAgg._sum.totalAmount ?? 0) - Number(tuitionAgg._sum.paidAmount ?? 0);
    return {
      role: Role.STUDENT,
      currentClasses,
      remainingTuition: remaining,
      totalScores: scoreCount,
      upcomingSessions: upcoming,
    };
  }
}
