import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const DOC_INCLUDE = {
  _count: { select: { assignments: true } },
} satisfies Prisma.DocumentInclude;

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentUncheckedCreateInput) {
    return this.prisma.document.create({ data });
  }

  findManyForTeacher(
    teacherId: string,
    filter: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
  ) {
    const where: Prisma.DocumentWhereInput = { teacherId, deletedAt: null, ...filter };
    return this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        include: DOC_INCLUDE,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);
  }

  /** Documents shared (assigned) to a specific student, directly or via class. */
  findSharedWithStudent(
    studentId: string,
    filter: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
  ) {
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      ...filter,
      assignments: {
        some: {
          OR: [{ studentId }, { class: { enrollments: { some: { studentId } } } }],
        },
      },
    };
    return this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);
  }

  /** Documents shared with classes an assistant is assigned to. */
  findSharedWithAssistant(
    assistantId: string,
    filter: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
  ) {
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      ...filter,
      assignments: {
        some: { class: { assistants: { some: { assistantId } } } },
      },
    };
    return this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);
  }

  findForTenant(id: string, teacherId: string) {
    return this.prisma.document.findFirst({
      where: { id, teacherId, deletedAt: null },
      include: DOC_INCLUDE,
    });
  }

  update(id: string, data: Prisma.DocumentUpdateInput) {
    return this.prisma.document.update({ where: { id }, data, include: DOC_INCLUDE });
  }

  softDelete(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ----- Assignments -----
  createAssignment(data: Prisma.DocumentAssignmentUncheckedCreateInput) {
    return this.prisma.documentAssignment.create({ data });
  }

  listAssignments(documentId: string) {
    return this.prisma.documentAssignment.findMany({
      where: { documentId },
      include: {
        class: { select: { id: true, name: true } },
        student: { select: { id: true, fullName: true } },
      },
    });
  }

  deleteAssignment(id: string, documentId: string) {
    return this.prisma.documentAssignment.deleteMany({ where: { id, documentId } });
  }
}
