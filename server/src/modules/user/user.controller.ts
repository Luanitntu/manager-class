import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { UserService } from './user.service';
import {
  CreateMemberDto,
  ListUsersQueryDto,
  ResetUserPasswordDto,
  UpdateProfileDto,
} from './dto/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

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
  @Patch(':id/lock')
  lock(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.setStatus(id, UserStatus.LOCKED);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/unlock')
  unlock(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.setStatus(id, UserStatus.ACTIVE);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/reset-password')
  resetPassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResetUserPasswordDto) {
    return this.users.resetPassword(id, dto);
  }
}
