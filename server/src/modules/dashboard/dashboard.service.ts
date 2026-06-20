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
    const [totalTeachers, totalStudents, totalClasses, totalUsers] = await this.prisma.$transaction(
      [
        this.prisma.user.count({ where: { role: Role.TEACHER, deletedAt: null } }),
        this.prisma.user.count({ where: { role: Role.STUDENT, deletedAt: null } }),
        this.prisma.class.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { deletedAt: null } }),
      ],
    );
    return { role: Role.SUPER_ADMIN, totalTeachers, totalStudents, totalClasses, totalUsers };
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
      this.prisma.sessionAssistant.count({ where: { assistantId } }),
      this.prisma.teachingSession.findMany({
        where: {
          deletedAt: null,
          startTime: { gte: now },
          status: 'SCHEDULED',
          assistants: { some: { assistantId } },
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
