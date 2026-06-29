import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { UserService } from './user.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangePasswordDto,
  CreateMemberDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateBrandingDto,
  UpdateProfileDto,
} from './dto/user.dto';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  // ----- Avatar (all roles) -----
  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_AVATAR_BYTES } }))
  uploadAvatar(@CurrentUser() actor: AuthenticatedUser, @UploadedFile() file: Express.Multer.File) {
    return this.users.updateAvatar(actor.id, file);
  }

  @Public()
  @SkipTransform()
  @Get(':id/avatar')
  async avatar(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const av = await this.users.getAvatar(id);
    if (!av) {
      throw new NotFoundException('No avatar');
    }
    res.setHeader('Content-Type', av.contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    av.stream.pipe(res);
  }

  // ----- Branding (teacher) -----
  @Roles(Role.TEACHER)
  @Get('me/branding')
  getBranding(@CurrentUser() actor: AuthenticatedUser) {
    return this.users.getBranding(actor.id);
  }

  @Roles(Role.TEACHER)
  @Patch('me/branding')
  updateBranding(@CurrentUser() actor: AuthenticatedUser, @Body() dto: UpdateBrandingDto) {
    return this.users.updateBranding(actor.id, dto);
  }

  @Roles(Role.TEACHER)
  @Post('me/brand-logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_AVATAR_BYTES } }))
  uploadBrandLogo(
    @CurrentUser() actor: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.users.setBrandLogo(actor.id, file);
  }

  @Public()
  @SkipTransform()
  @Get(':id/brand-logo')
  async brandLogo(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const logo = await this.users.getBrandLogo(id);
    if (!logo) {
      throw new NotFoundException('No logo');
    }
    res.setHeader('Content-Type', logo.contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    logo.stream.pipe(res);
  }

  // ----- Change own password -----
  @Post('me/change-password')
  changePassword(@CurrentUser() actor: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(actor.id, dto);
  }

  // ----- Active sessions -----
  @Get('me/sessions')
  sessions(
    @CurrentUser() actor: AuthenticatedUser,
    @Headers('x-refresh-token') currentToken: string,
  ) {
    return this.users.listSessions(actor.id, currentToken);
  }

  @Delete('me/sessions/:id')
  revokeSession(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.revokeSession(actor.id, id);
  }

  // ----- Own profile (all roles) -----
  @Get('me/profile')
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.users.getMyProfile(userId);
  }

  @Patch('me/profile')
  updateMyProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateMyProfile(userId, dto);
  }

  // ----- Teacher: members -----
  @Roles(Role.TEACHER)
  @Post()
  createMember(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateMemberDto) {
    return this.users.createMember(actor.tenantId ?? actor.id, dto);
  }

  @Roles(Role.TEACHER)
  @Get()
  listMyMembers(@CurrentUser() actor: AuthenticatedUser, @Query() query: ListUsersQueryDto) {
    return this.users.listMyMembers(actor.tenantId ?? actor.id, query);
  }

  @Roles(Role.TEACHER)
  @Delete(':id')
  deleteMember(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.deleteMyMember(actor, id);
  }

  // ----- Super Admin -----
  @Roles(Role.SUPER_ADMIN)
  @Get('admin/all')
  listAll(@Query() query: ListUsersQueryDto) {
    return this.users.listAllUsers(query);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('admin')
  adminCreate(@CurrentUser() actor: AuthenticatedUser, @Body() dto: AdminCreateUserDto) {
    return this.users.adminCreateUser(actor, dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('admin/:id')
  adminDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.adminUserDetail(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('admin/:id')
  adminUpdate(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.users.adminUpdateUser(actor, id, dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete('admin/:id')
  adminDelete(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.adminDeleteUser(actor, id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/lock')
  lock(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.setStatus(actor, id, UserStatus.LOCKED);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/unlock')
  unlock(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.setStatus(actor, id, UserStatus.ACTIVE);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/reset-password')
  resetPassword(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    return this.users.resetPassword(actor, id, dto);
  }
}
