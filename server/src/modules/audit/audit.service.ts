import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AuditQueryDto } from './dto/audit-query.dto';

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an auditable action. Best-effort: a logging failure must never
   * break the business operation that triggered it.
   */
  async log(actor: AuthenticatedUser, entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          teacherId: actor.tenantId,
          actorId: actor.id,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          ipAddress: entry.ipAddress,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${(err as Error).message}`);
    }
  }

  async list(actor: AuthenticatedUser, query: AuditQueryDto) {
    // Super admin sees everything; a teacher sees only their tenant.
    const where: Prisma.AuditLogWhereInput = {
      ...(actor.role === Role.SUPER_ADMIN ? {} : { teacherId: actor.tenantId }),
      ...(query.action ? { action: { contains: query.action, mode: 'insensitive' } } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, fullName: true, role: true } } },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResult(items, total, query.page, query.limit);
  }
}
