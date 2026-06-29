import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { PasswordService } from '../../common/security/password.service';
import { hashToken } from '../../common/utils/crypto.util';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AuditService } from '../audit/audit.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangePasswordDto,
  CreateMemberDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateProfileDto,
} from './dto/user.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  role: true,
  status: true,
  phone: true,
  avatarUrl: true,
  avatarKey: true,
  timezone: true,
  emailVerified: true,
  teacherId: true,
  createdAt: true,
  lastLoginAt: true,
  lastLoginIp: true,
  loginCount: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
  ) {}

  // ----- Own profile (any role) -----
  async getMyProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        ...PUBLIC_USER_SELECT,
        assistantProfile: true,
        studentProfile: true,
      },
    });
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: PUBLIC_USER_SELECT,
    });
  }

  // ----- Avatar (any role) -----
  async updateAvatar(userId: string, file: { buffer: Buffer; originalname: string }) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const stored = await this.storage.putObject(file.buffer, file.originalname);
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarKey: stored.key },
    });
    return { avatarKey: stored.key };
  }

  async getAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });
    if (!user?.avatarKey) return null;
    const ext = user.avatarKey.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'svg'
            ? 'image/svg+xml'
            : 'image/jpeg';
    return { stream: await this.storage.getObjectStream(user.avatarKey), contentType };
  }

  // ----- Branding (teacher) -----
  async getBranding(userId: string) {
    const p = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    return {
      brandName: p?.brandName ?? null,
      address: p?.address ?? null,
      phone: p?.phone ?? null,
      logoKey: p?.logoKey ?? null,
    };
  }

  async updateBranding(
    userId: string,
    dto: { brandName?: string; address?: string; phone?: string },
  ) {
    await this.prisma.teacherProfile.upsert({
      where: { userId },
      update: { brandName: dto.brandName, address: dto.address, phone: dto.phone },
      create: { userId, brandName: dto.brandName, address: dto.address, phone: dto.phone },
    });
    return this.getBranding(userId);
  }

  async setBrandLogo(userId: string, file: { buffer: Buffer; originalname: string }) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const stored = await this.storage.putObject(file.buffer, file.originalname);
    await this.prisma.teacherProfile.upsert({
      where: { userId },
      update: { logoKey: stored.key },
      create: { userId, logoKey: stored.key },
    });
    return { logoKey: stored.key };
  }

  async getBrandLogo(userId: string) {
    const p = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      select: { logoKey: true },
    });
    if (!p?.logoKey) return null;
    const ext = p.logoKey.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return { stream: await this.storage.getObjectStream(p.logoKey), contentType };
  }

  // ----- Change own password (any authenticated user) -----
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await this.passwords.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await this.passwords.hash(dto.newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      // Sign out all other sessions on password change.
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { changed: true };
  }

  // ----- Active sessions (any role) -----
  async listSessions(userId: string, currentRawToken?: string) {
    const currentHash = currentRawToken ? hashToken(currentRawToken) : null;
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
        tokenHash: true,
      },
    });
    return sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      current: !!currentHash && s.tokenHash === currentHash,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.refreshToken.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      throw new NotFoundException('Session not found');
    }
    return { revoked: true };
  }

  // ----- Teacher: create members (assistant / student) within own tenant -----
  async createMember(teacherId: string, dto: CreateMemberDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const role = dto.role as unknown as Role;

    // Per-teacher display code for students (STU0001, STU0002, …).
    let studentCode: string | undefined;
    if (role === Role.STUDENT) {
      const existing = await this.prisma.user.count({
        where: { teacherId, role: Role.STUDENT },
      });
      studentCode = `STU${String(existing + 1).padStart(4, '0')}`;
    }

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role,
        teacherId,
        status: UserStatus.ACTIVE,
        emailVerified: true, // created by a trusted teacher
        ...(role === Role.ASSISTANT
          ? { assistantProfile: { create: {} } }
          : { studentProfile: { create: { code: studentCode } } }),
      },
      select: PUBLIC_USER_SELECT,
    });
  }

  // ----- Teacher: list own members -----
  async listMyMembers(teacherId: string, query: ListUsersQueryDto & PaginationQueryDto) {
    const where: Prisma.UserWhereInput = {
      teacherId,
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: PUBLIC_USER_SELECT,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResult(items, total, query.page, query.limit);
  }

  // ----- Super Admin: list all users -----
  async listAllUsers(query: ListUsersQueryDto & PaginationQueryDto) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: PUBLIC_USER_SELECT,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResult(items, total, query.page, query.limit);
  }

  // ----- Super Admin: user detail with tenant stats -----
  async adminUserDetail(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Account status history (lock/unlock + other user-targeted audit entries).
    const statusHistory = await this.prisma.auditLog.findMany({
      where: { entityType: 'User', entityId: userId },
      include: { actor: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Subscription is a V2 feature — placeholder until billing ships.
    const subscription = {
      plan: 'trial',
      startedAt: user.createdAt,
      expiresAt: null as Date | null,
    };

    // For teachers, surface their tenant footprint + revenue.
    if (user.role === Role.TEACHER) {
      const [classes, students, assistants, tuition] = await this.prisma.$transaction([
        this.prisma.class.count({ where: { teacherId: userId, deletedAt: null } }),
        this.prisma.user.count({
          where: { teacherId: userId, role: Role.STUDENT, deletedAt: null },
        }),
        this.prisma.user.count({
          where: { teacherId: userId, role: Role.ASSISTANT, deletedAt: null },
        }),
        this.prisma.tuition.aggregate({
          where: { teacherId: userId },
          _sum: { totalAmount: true, paidAmount: true },
        }),
      ]);
      const collected = Number(tuition._sum.paidAmount ?? 0);
      const total = Number(tuition._sum.totalAmount ?? 0);
      return {
        ...user,
        subscription,
        statusHistory,
        stats: {
          classes,
          students,
          assistants,
          revenueCollected: collected,
          revenueOutstanding: total - collected,
        },
      };
    }

    return { ...user, subscription, statusHistory, stats: null };
  }

  // ----- Super Admin: create a tenant-root user (super admin / teacher) -----
  async adminCreateUser(actor: AuthenticatedUser, dto: AdminCreateUserDto) {
    const username = dto.username?.toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, ...(username ? [{ username }] : [])],
      },
    });
    if (existing) {
      throw new ConflictException('Email or username already in use');
    }
    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role as unknown as Role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
      select: PUBLIC_USER_SELECT,
    });
    await this.audit.log(actor, {
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      newValue: { role: user.role, email: user.email },
    });
    return user;
  }

  // ----- Super Admin: edit a user's basic fields -----
  async adminUpdateUser(actor: AuthenticatedUser, userId: string, dto: AdminUpdateUserDto) {
    await this.ensureUserExists(userId);
    const username = dto.username?.toLowerCase();
    if (username) {
      const taken = await this.prisma.user.findFirst({
        where: { username, id: { not: userId } },
        select: { id: true },
      });
      if (taken) {
        throw new ConflictException('Username already in use');
      }
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(dto.role ? { role: dto.role } : {}),
      },
      select: PUBLIC_USER_SELECT,
    });
    await this.audit.log(actor, {
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: userId,
    });
    return updated;
  }

  // ----- Super Admin: soft-delete (deactivate) a user -----
  async adminDeleteUser(actor: AuthenticatedUser, userId: string) {
    if (userId === actor.id) {
      throw new ConflictException('You cannot delete your own account');
    }
    await this.ensureUserExists(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), status: UserStatus.LOCKED },
    });
    await this.audit.log(actor, {
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: userId,
    });
    return { deleted: true };
  }

  // ----- Super Admin: lock / unlock -----
  async setStatus(actor: AuthenticatedUser, userId: string, status: UserStatus) {
    await this.ensureUserExists(userId);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: PUBLIC_USER_SELECT,
    });
    await this.audit.log(actor, {
      action: status === UserStatus.LOCKED ? 'USER_LOCKED' : 'USER_UNLOCKED',
      entityType: 'User',
      entityId: userId,
      newValue: { status },
    });
    return updated;
  }

  // ----- Super Admin: reset a user's password -----
  async resetPassword(actor: AuthenticatedUser, userId: string, dto: ResetUserPasswordDto) {
    await this.ensureUserExists(userId);
    const passwordHash = await this.passwords.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    await this.audit.log(actor, {
      action: 'USER_PASSWORD_RESET',
      entityType: 'User',
      entityId: userId,
    });
  }

  // ----- Teacher: soft-delete a member they own -----
  async deleteMyMember(actor: AuthenticatedUser, memberId: string) {
    const member = await this.prisma.user.findFirst({
      where: { id: memberId, teacherId: actor.tenantId ?? undefined, deletedAt: null },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return this.prisma.user.update({
      where: { id: memberId },
      data: { deletedAt: new Date(), status: UserStatus.LOCKED },
      select: PUBLIC_USER_SELECT,
    });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) {
      throw new NotFoundException('User not found');
    }
  }
}
