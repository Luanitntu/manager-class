import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { StudentRepository } from './student.repository';
import {
  CreateCommentDto,
  CreateScoreDto,
  UpdateScoreDto,
  UpdateStudentProfileDto,
} from './dto/student.dto';

@Injectable()
export class StudentService {
  constructor(
    private readonly repo: StudentRepository,
    private readonly prisma: PrismaService,
  ) {}

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

  async getOne(actor: AuthenticatedUser, studentId: string) {
    await this.assertCanAccessStudent(actor, studentId);
    const teacherId = this.teacherScope(actor);
    const student = await this.repo.findStudentForTenant(studentId, teacherId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async updateProfile(actor: AuthenticatedUser, studentId: string, dto: UpdateStudentProfileDto) {
    await this.assertCanEditStudent(actor, studentId);
    const { fullName, phone, ...profile } = dto;
    const profileData = {
      ...(profile.address !== undefined ? { address: profile.address } : {}),
      ...(profile.dateOfBirth ? { dateOfBirth: new Date(profile.dateOfBirth) } : {}),
      ...(profile.occupation !== undefined ? { occupation: profile.occupation } : {}),
      ...(profile.educationLevel !== undefined ? { educationLevel: profile.educationLevel } : {}),
      ...(profile.learningGoal !== undefined ? { learningGoal: profile.learningGoal } : {}),
    };
    return this.repo.updateProfile(
      studentId,
      {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      profileData,
    );
  }

  // ----- Scores (teacher-managed, student read) -----
  async addScore(actor: AuthenticatedUser, studentId: string, dto: CreateScoreDto) {
    const teacherId = this.teacherScope(actor);
    await this.assertStudentInTenant(studentId, teacherId);
    await this.assertClassOwned(dto.classId, teacherId);
    return this.repo.createScore({
      teacherId,
      studentId,
      classId: dto.classId,
      type: dto.type,
      label: dto.label,
      value: dto.value,
      maxValue: dto.maxValue ?? 10,
      createdBy: actor.id,
    });
  }

  async listScores(actor: AuthenticatedUser, studentId: string) {
    await this.assertCanAccessStudent(actor, studentId);
    const teacherId = this.teacherScope(actor);
    return this.repo.listScores(studentId, teacherId);
  }

  async updateScore(actor: AuthenticatedUser, scoreId: string, dto: UpdateScoreDto) {
    const teacherId = this.teacherScope(actor);
    const result = await this.repo.updateScore(scoreId, teacherId, {
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.label !== undefined ? { label: dto.label } : {}),
      ...(dto.value !== undefined ? { value: dto.value } : {}),
      ...(dto.maxValue !== undefined ? { maxValue: dto.maxValue } : {}),
    });
    if (result.count === 0) {
      throw new NotFoundException('Score not found');
    }
    return this.repo.findScore(scoreId, teacherId);
  }

  async deleteScore(actor: AuthenticatedUser, scoreId: string) {
    const teacherId = this.teacherScope(actor);
    const result = await this.repo.deleteScore(scoreId, teacherId);
    if (result.count === 0) {
      throw new NotFoundException('Score not found');
    }
    return { deleted: true };
  }

  // ----- Comments -----
  async addComment(actor: AuthenticatedUser, studentId: string, dto: CreateCommentDto) {
    const teacherId = this.teacherScope(actor);
    await this.assertStudentInTenant(studentId, teacherId);
    return this.repo.createComment({
      teacherId,
      studentId,
      authorId: actor.id,
      category: dto.category,
      content: dto.content,
    });
  }

  async listComments(actor: AuthenticatedUser, studentId: string) {
    await this.assertCanAccessStudent(actor, studentId);
    const teacherId = this.teacherScope(actor);
    return this.repo.listComments(studentId, teacherId);
  }

  async deleteComment(actor: AuthenticatedUser, commentId: string) {
    const teacherId = this.teacherScope(actor);
    const result = await this.repo.deleteComment(commentId, teacherId);
    if (result.count === 0) {
      throw new NotFoundException('Comment not found');
    }
    return { deleted: true };
  }

  // ----------------------------------------------------------------
  // Access control
  // ----------------------------------------------------------------

  private async assertCanAccessStudent(actor: AuthenticatedUser, studentId: string): Promise<void> {
    if (actor.role === Role.STUDENT) {
      if (actor.id !== studentId) {
        throw new ForbiddenException('Cannot access another student');
      }
      return;
    }
    if (actor.role === Role.ASSISTANT) {
      await this.assertAssistantSharesClass(actor.id, studentId);
      return;
    }
    await this.assertStudentInTenant(studentId, this.teacherScope(actor));
  }

  private async assertCanEditStudent(actor: AuthenticatedUser, studentId: string): Promise<void> {
    if (actor.role === Role.STUDENT) {
      if (actor.id !== studentId) {
        throw new ForbiddenException('Cannot edit another student');
      }
      return;
    }
    if (actor.role === Role.TEACHER) {
      await this.assertStudentInTenant(studentId, this.teacherScope(actor));
      return;
    }
    throw new ForbiddenException('Insufficient permissions');
  }

  private async assertStudentInTenant(studentId: string, teacherId: string): Promise<void> {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId, role: Role.STUDENT, deletedAt: null },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  }

  private async assertClassOwned(classId: string, teacherId: string): Promise<void> {
    const klass = await this.prisma.class.findFirst({
      where: { id: classId, teacherId, deletedAt: null },
      select: { id: true },
    });
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
  }

  private async assertAssistantSharesClass(assistantId: string, studentId: string): Promise<void> {
    const shared = await this.prisma.classAssistant.findFirst({
      where: {
        assistantId,
        class: { enrollments: { some: { studentId } } },
      },
      select: { id: true },
    });
    if (!shared) {
      throw new ForbiddenException('Student is not in your assigned classes');
    }
  }
}
