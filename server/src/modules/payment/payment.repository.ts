import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const TUITION_INCLUDE = {
  student: { select: { id: true, fullName: true, email: true } },
  class: { select: { id: true, name: true } },
} satisfies Prisma.TuitionInclude;

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TuitionUncheckedCreateInput) {
    return this.prisma.tuition.create({ data, include: TUITION_INCLUDE });
  }

  findManyForTeacher(
    teacherId: string,
    filter: Prisma.TuitionWhereInput,
    skip: number,
    take: number,
  ) {
    const where: Prisma.TuitionWhereInput = { teacherId, ...filter };
    return this.prisma.$transaction([
      this.prisma.tuition.findMany({
        where,
        include: TUITION_INCLUDE,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tuition.count({ where }),
    ]);
  }

  findManyForStudent(
    studentId: string,
    filter: Prisma.TuitionWhereInput,
    skip: number,
    take: number,
  ) {
    const where: Prisma.TuitionWhereInput = { studentId, ...filter };
    return this.prisma.$transaction([
      this.prisma.tuition.findMany({
        where,
        include: TUITION_INCLUDE,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tuition.count({ where }),
    ]);
  }

  findDetail(id: string, where: Prisma.TuitionWhereInput) {
    return this.prisma.tuition.findFirst({
      where: { id, ...where },
      include: {
        ...TUITION_INCLUDE,
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
  }

  findForTenant(id: string, teacherId: string) {
    return this.prisma.tuition.findFirst({ where: { id, teacherId } });
  }

  update(id: string, data: Prisma.TuitionUpdateInput) {
    return this.prisma.tuition.update({ where: { id }, data, include: TUITION_INCLUDE });
  }

  findReceipt(receiptNumber: string, teacherId: string) {
    return this.prisma.paymentRecord.findFirst({
      where: { receiptNumber, tuition: { teacherId } },
      include: {
        tuition: { include: TUITION_INCLUDE },
      },
    });
  }

  /**
   * Records a payment, bumps paidAmount and recomputes status atomically.
   */
  recordPayment(
    tuitionId: string,
    paymentData: Omit<Prisma.PaymentRecordUncheckedCreateInput, 'tuitionId'>,
    newPaidAmount: number,
    newStatus: Prisma.TuitionUpdateInput['status'],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.paymentRecord.create({
        data: { ...paymentData, tuitionId },
      });
      const tuition = await tx.tuition.update({
        where: { id: tuitionId },
        data: { paidAmount: newPaidAmount, status: newStatus },
        include: TUITION_INCLUDE,
      });
      return { payment, tuition };
    });
  }
}
