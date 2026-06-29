import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentTargetType, DocumentType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { DocumentRepository } from './document.repository';
import {
  AssignDocumentDto,
  CreateDocumentDto,
  ListDocumentsQueryDto,
  UpdateDocumentDto,
  UploadDocumentDto,
} from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  private tenantId(actor: AuthenticatedUser): string {
    if (!actor.tenantId) {
      throw new ForbiddenException('No tenant context');
    }
    return actor.tenantId;
  }

  // ----- Create (LINK or metadata) -----
  async create(actor: AuthenticatedUser, dto: CreateDocumentDto) {
    if (dto.type === DocumentType.LINK && !dto.url) {
      throw new BadRequestException('url is required for LINK documents');
    }
    return this.repo.create({
      teacherId: this.tenantId(actor),
      ownerId: actor.id,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      category: dto.category,
      url: dto.type === DocumentType.LINK ? dto.url : undefined,
      createdBy: actor.id,
      updatedBy: actor.id,
    });
  }

  // ----- Upload (PDF / MP3) -----
  async upload(
    actor: AuthenticatedUser,
    dto: UploadDocumentDto,
    file: { buffer: Buffer; originalname: string; mimetype: string; size?: number },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const type = file.mimetype.includes('audio') ? DocumentType.MP3 : DocumentType.PDF;
    const stored = await this.storage.putObject(file.buffer, file.originalname);
    return this.repo.create({
      teacherId: this.tenantId(actor),
      ownerId: actor.id,
      title: dto.title,
      description: dto.description,
      type,
      category: dto.category,
      fileKey: stored.key,
      fileSize: file.size ?? file.buffer.length,
      createdBy: actor.id,
      updatedBy: actor.id,
    });
  }

  // ----- Categories (distinct, for filter chips) -----
  getCategories(actor: AuthenticatedUser) {
    return this.repo.distinctCategories(this.tenantId(actor));
  }

  // ----- List (role-scoped) -----
  async list(actor: AuthenticatedUser, query: ListDocumentsQueryDto & PaginationQueryDto) {
    const filter: Prisma.DocumentWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    // Library scope (teacher view): shared = no class assignment; class = assigned.
    if (query.classId) {
      filter.assignments = { some: { classId: query.classId } };
    } else if (query.scope === 'CLASS') {
      filter.assignments = { some: { targetType: DocumentTargetType.CLASS } };
    } else if (query.scope === 'SHARED') {
      filter.assignments = { none: { targetType: DocumentTargetType.CLASS } };
    }

    let result: [unknown[], number];
    if (actor.role === Role.STUDENT) {
      result = await this.repo.findSharedWithStudent(actor.id, filter, query.skip, query.limit);
    } else if (actor.role === Role.ASSISTANT) {
      result = await this.repo.findSharedWithAssistant(actor.id, filter, query.skip, query.limit);
    } else {
      result = await this.repo.findManyForTeacher(
        this.tenantId(actor),
        filter,
        query.skip,
        query.limit,
      );
    }
    return new PaginatedResult(result[0], result[1], query.page, query.limit);
  }

  async findOne(actor: AuthenticatedUser, id: string) {
    return this.assertCanView(actor, id);
  }

  async update(actor: AuthenticatedUser, id: string, dto: UpdateDocumentDto) {
    await this.assertOwner(actor, id);
    return this.repo.update(id, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.category !== undefined ? { category: dto.category } : {}),
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      updatedBy: actor.id,
    });
  }

  async remove(actor: AuthenticatedUser, id: string) {
    const doc = await this.assertOwner(actor, id);
    if (doc.fileKey) {
      await this.storage.deleteObject(doc.fileKey);
    }
    await this.repo.softDelete(id);
    return { deleted: true };
  }

  // ----- Download -----
  async getDownload(actor: AuthenticatedUser, id: string) {
    const doc = await this.assertCanView(actor, id);
    if (!doc.fileKey) {
      throw new BadRequestException('Document has no downloadable file');
    }
    return { stream: await this.storage.getObjectStream(doc.fileKey), title: doc.title };
  }

  // ----- Assignments -----
  async assign(actor: AuthenticatedUser, documentId: string, dto: AssignDocumentDto) {
    const doc = await this.assertOwnerOrTeacher(actor, documentId);
    const teacherId = doc.teacherId;

    if (dto.targetType === DocumentTargetType.CLASS) {
      if (!dto.classId) throw new BadRequestException('classId required');
      await this.assertClassInTenant(dto.classId, teacherId);
      return this.repo.createAssignment({
        documentId,
        targetType: DocumentTargetType.CLASS,
        classId: dto.classId,
      });
    }

    if (!dto.studentId) throw new BadRequestException('studentId required');
    await this.assertStudentInTenant(dto.studentId, teacherId);
    return this.repo.createAssignment({
      documentId,
      targetType: DocumentTargetType.STUDENT,
      studentId: dto.studentId,
    });
  }

  async listAssignments(actor: AuthenticatedUser, documentId: string) {
    await this.assertCanView(actor, documentId);
    return this.repo.listAssignments(documentId);
  }

  async removeAssignment(actor: AuthenticatedUser, documentId: string, assignmentId: string) {
    await this.assertOwnerOrTeacher(actor, documentId);
    const result = await this.repo.deleteAssignment(assignmentId, documentId);
    if (result.count === 0) {
      throw new NotFoundException('Assignment not found');
    }
    return { removed: true };
  }

  // ----------------------------------------------------------------
  // Access control
  // ----------------------------------------------------------------

  private async assertCanView(actor: AuthenticatedUser, id: string) {
    const teacherId = this.tenantId(actor);
    const doc = await this.repo.findForTenant(id, teacherId);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (actor.role === Role.TEACHER) return doc;

    // Assistant/Student: must be shared with them.
    const shared = await this.prisma.documentAssignment.findFirst({
      where: {
        documentId: id,
        OR:
          actor.role === Role.STUDENT
            ? [
                { studentId: actor.id },
                { class: { enrollments: { some: { studentId: actor.id } } } },
              ]
            : [{ class: { assistants: { some: { assistantId: actor.id } } } }],
      },
      select: { id: true },
    });
    if (!shared) {
      throw new ForbiddenException('Document not shared with you');
    }
    return doc;
  }

  private async assertOwner(actor: AuthenticatedUser, id: string) {
    const teacherId = this.tenantId(actor);
    const doc = await this.repo.findForTenant(id, teacherId);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (doc.ownerId !== actor.id) {
      throw new ForbiddenException('Only the owner can modify this document');
    }
    return doc;
  }

  private async assertOwnerOrTeacher(actor: AuthenticatedUser, id: string) {
    const teacherId = this.tenantId(actor);
    const doc = await this.repo.findForTenant(id, teacherId);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (actor.role !== Role.TEACHER && doc.ownerId !== actor.id) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return doc;
  }

  private async assertClassInTenant(classId: string, teacherId: string): Promise<void> {
    const klass = await this.prisma.class.findFirst({
      where: { id: classId, teacherId, deletedAt: null },
      select: { id: true },
    });
    if (!klass) throw new NotFoundException('Class not found');
  }

  private async assertStudentInTenant(studentId: string, teacherId: string): Promise<void> {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId, role: Role.STUDENT, deletedAt: null },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');
  }
}
