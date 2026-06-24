import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PaymentRepository } from './payment.repository';
import { NotificationService } from '../notification/notification.service';
import { AuditService } from '../audit/audit.service';
import { computePaymentStatus, generateReceiptNumber } from './payment-status.util';
import {
  CreateTuitionDto,
  ListTuitionQueryDto,
  RecordPaymentDto,
  UpdateTuitionDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly repo: PaymentRepository,
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

  async createTuition(actor: AuthenticatedUser, dto: CreateTuitionDto) {
    const teacherId = this.tenantId(actor);
    await this.assertStudentInTenant(dto.studentId, teacherId);
    await this.assertClassInTenant(dto.classId, teacherId);

    // One tuition per enrollment (student + class).
    const existing = await this.prisma.tuition.findFirst({
      where: { teacherId, studentId: dto.studentId, classId: dto.classId },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A tuition for this student in this class already exists');
    }

    const status = computePaymentStatus(
      dto.totalAmount,
      0,
      dto.dueDate ? new Date(dto.dueDate) : null,
      new Date(),
    );

    return this.repo.create({
      teacherId,
      studentId: dto.studentId,
      classId: dto.classId,
      totalAmount: dto.totalAmount,
      paidAmount: 0,
      status,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      notes: dto.notes,
      createdBy: actor.id,
      updatedBy: actor.id,
    });
  }

  async list(actor: AuthenticatedUser, query: ListTuitionQueryDto & PaginationQueryDto) {
    const filter: Prisma.TuitionWhereInput = {
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    if (actor.role === Role.STUDENT) {
      const [items, total] = await this.repo.findManyForStudent(
        actor.id,
        filter,
        query.skip,
        query.limit,
      );
      return new PaginatedResult(items, total, query.page, query.limit);
    }

    if (query.studentId) filter.studentId = query.studentId;
    const [items, total] = await this.repo.findManyForTeacher(
      this.tenantId(actor),
      filter,
      query.skip,
      query.limit,
    );
    return new PaginatedResult(items, total, query.page, query.limit);
  }

  async getOne(actor: AuthenticatedUser, id: string) {
    const where: Prisma.TuitionWhereInput =
      actor.role === Role.STUDENT ? { studentId: actor.id } : { teacherId: this.tenantId(actor) };
    const tuition = await this.repo.findDetail(id, where);
    if (!tuition) {
      throw new NotFoundException('Tuition not found');
    }
    return tuition;
  }

  async updateTuition(actor: AuthenticatedUser, id: string, dto: UpdateTuitionDto) {
    const teacherId = this.tenantId(actor);
    const tuition = await this.repo.findForTenant(id, teacherId);
    if (!tuition) {
      throw new NotFoundException('Tuition not found');
    }

    const total = dto.totalAmount ?? Number(tuition.totalAmount);
    const dueDate = dto.dueDate !== undefined ? new Date(dto.dueDate) : tuition.dueDate;
    const status = computePaymentStatus(total, Number(tuition.paidAmount), dueDate, new Date());

    return this.repo.update(id, {
      ...(dto.totalAmount !== undefined ? { totalAmount: dto.totalAmount } : {}),
      ...(dto.dueDate !== undefined ? { dueDate } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      status,
      updatedBy: actor.id,
    });
  }

  async recordPayment(actor: AuthenticatedUser, tuitionId: string, dto: RecordPaymentDto) {
    const teacherId = this.tenantId(actor);
    const tuition = await this.repo.findForTenant(tuitionId, teacherId);
    if (!tuition) {
      throw new NotFoundException('Tuition not found');
    }

    const newPaid = Number(tuition.paidAmount) + dto.amount;
    const status = computePaymentStatus(
      Number(tuition.totalAmount),
      newPaid,
      tuition.dueDate,
      new Date(),
    );
    const receiptNumber = generateReceiptNumber(new Date(), randomBytes(4).toString('hex'));

    const result = await this.repo.recordPayment(
      tuitionId,
      {
        amount: dto.amount,
        method: dto.method,
        note: dto.note,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        receiptNumber,
        createdBy: actor.id,
      },
      newPaid,
      status,
    );
    await this.audit.log(actor, {
      action: 'PAYMENT_RECORDED',
      entityType: 'Tuition',
      entityId: tuitionId,
      newValue: { amount: dto.amount, receiptNumber, status },
    });
    return result;
  }

  async sendReminder(actor: AuthenticatedUser, tuitionId: string) {
    const teacherId = this.tenantId(actor);
    const tuition = await this.repo.findForTenant(tuitionId, teacherId);
    if (!tuition) {
      throw new NotFoundException('Tuition not found');
    }
    await this.notifications.sendPaymentReminder(tuitionId);
    return { queued: true };
  }

  async getReceipt(actor: AuthenticatedUser, receiptNumber: string) {
    const teacherId = this.tenantId(actor);
    const receipt = await this.repo.findReceipt(receiptNumber, teacherId);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }
    return receipt;
  }

  // ----------------------------------------------------------------

  private async assertStudentInTenant(studentId: string, teacherId: string): Promise<void> {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId, role: Role.STUDENT, deletedAt: null },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');
  }

  private async assertClassInTenant(classId: string, teacherId: string): Promise<void> {
    const klass = await this.prisma.class.findFirst({
      where: { id: classId, teacherId, deletedAt: null },
      select: { id: true },
    });
    if (!klass) throw new NotFoundException('Class not found');
  }
}
