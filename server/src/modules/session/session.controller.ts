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
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { SessionService } from './session.service';
import {
  BulkCreateSessionDto,
  CreateSessionDto,
  SessionRangeQueryDto,
  UpdateSessionDto,
} from './dto/session.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  // Calendar feed (month/week/day) — scoped by role in the service.
  @Get()
  findInRange(@CurrentUser() actor: AuthenticatedUser, @Query() query: SessionRangeQueryDto) {
    return this.sessions.findInRange(actor, query);
  }

  @Get(':id')
  findOne(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessions.findOne(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post()
  create(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateSessionDto) {
    return this.sessions.create(actor, dto);
  }

  @Roles(Role.TEACHER)
  @Post('bulk')
  bulkCreate(@CurrentUser() actor: AuthenticatedUser, @Body() dto: BulkCreateSessionDto) {
    return this.sessions.bulkCreate(actor, dto);
  }

  @Roles(Role.TEACHER)
  @Patch(':id')
  update(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessions.update(actor, id, dto);
  }

  @Roles(Role.TEACHER)
  @Delete(':id')
  remove(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessions.remove(actor, id);
  }
}
