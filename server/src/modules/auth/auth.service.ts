import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, TokenType, User, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { generateOpaqueToken, hashToken } from '../../common/utils/crypto.util';
import { AppConfig, JwtConfig } from '../../config/configuration';
import { JwtPayload } from '../../common/types/authenticated-user';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    avatarUrl: string | null;
  };
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly passwords: PasswordService,
    private readonly mail: MailService,
  ) {}

  // ----- Registration (self-signup creates a TEACHER tenant root) -----
  async register(dto: RegisterDto): Promise<AuthResult> {
    const username = dto.username?.toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          ...(username ? [{ username }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException('Email or username is already registered');
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username,
        passwordHash,
        fullName: dto.fullName,
        role: Role.TEACHER,
        status: UserStatus.ACTIVE,
      },
    });

    await this.dispatchVerificationEmail(user);
    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  // ----- Login (by email OR username) -----
  async login(dto: LoginDto): Promise<AuthResult> {
    const identifier = dto.identifier.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException('Account is locked');
    }

    const valid = await this.passwords.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  // ----- Refresh (with rotation) -----
  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (stored.user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException('Account is locked');
    }

    // Rotate: revoke the used token, issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(stored.user);
  }

  // ----- Logout -----
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ----- Forgot / reset password -----
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    // Always return success to avoid email enumeration.
    if (!user) {
      return;
    }

    const raw = generateOpaqueToken();
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    const link = `${this.appBaseUrl()}/reset-password?token=${raw}`;
    await this.mail.sendPasswordResetEmail(user.email, link);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = hashToken(dto.token);
    const token = await this.prisma.authToken.findFirst({
      where: { tokenHash, type: TokenType.PASSWORD_RESET, usedAt: null },
    });
    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwords.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      this.prisma.authToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all sessions on password change.
      this.prisma.refreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  // ----- Email verification -----
  async verifyEmail(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    const token = await this.prisma.authToken.findFirst({
      where: { tokenHash, type: TokenType.EMAIL_VERIFICATION, usedAt: null },
    });
    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { emailVerified: true },
      }),
      this.prisma.authToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  async me(userId: string): Promise<AuthResult['user']> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.toPublicUser(user);
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------

  private resolveTenantId(user: User): string | null {
    if (user.role === Role.SUPER_ADMIN) return null;
    if (user.role === Role.TEACHER) return user.id;
    return user.teacherId;
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const jwtConfig = this.config.getOrThrow<JwtConfig>('jwt');
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teacherId,
      tenantId: this.resolveTenantId(user),
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn as JwtSignOptions['expiresIn'],
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn as JwtSignOptions['expiresIn'],
      },
    );

    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(decoded.exp * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private async dispatchVerificationEmail(user: User): Promise<void> {
    const raw = generateOpaqueToken();
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFICATION,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
      },
    });
    const link = `${this.appBaseUrl()}/verify-email?token=${raw}`;
    await this.mail.sendVerificationEmail(user.email, link);
  }

  private appBaseUrl(): string {
    return this.config.getOrThrow<AppConfig>('app').corsOrigin.split(',')[0].trim();
  }

  private toPublicUser(user: User): AuthResult['user'] {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }
}
