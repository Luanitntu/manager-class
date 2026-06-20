import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import {
  CreateMemberDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateProfileDto,
} from './dto/user.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  phone: true,
  avatarUrl: true,
  emailVerified: true,
  teacherId: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
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
          : { studentProfile: { create: {} } }),
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

  // ----- Super Admin: lock / unlock -----
  async setStatus(userId: string, status: UserStatus) {
    await this.ensureUserExists(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: PUBLIC_USER_SELECT,
    });
  }

  // ----- Super Admin: reset a user's password -----
  async resetPassword(userId: string, dto: ResetUserPasswordDto) {
    await this.ensureUserExists(userId);
    const passwordHash = await this.passwords.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
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
