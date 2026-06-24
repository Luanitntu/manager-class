import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AssistantService } from './assistant.service';
import { SalaryQueryDto, UpdateSalaryDto } from './dto/assistant.dto';

@ApiTags('assistants')
@ApiBearerAuth()
@Controller('assistants')
export class AssistantController {
  constructor(private readonly assistants: AssistantService) {}

  @Roles(Role.TEACHER)
  @Get()
  list(@CurrentUser() actor: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.assistants.list(actor, query);
  }

  // Own salary shortcut for assistants.
  @Roles(Role.ASSISTANT)
  @Get('me/salary')
  mySalary(@CurrentUser() actor: AuthenticatedUser, @Query() query: SalaryQueryDto) {
    return this.assistants.getSalary(actor, actor.id, query);
  }

  @Get(':id')
  getOne(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.assistants.getOne(actor, id);
  }

  @Roles(Role.TEACHER)
  @Patch(':id/salary')
  updateSalary(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryDto,
  ) {
    return this.assistants.updateSalary(actor, id, dto);
  }

  @Get(':id/salary')
  getSalary(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SalaryQueryDto,
  ) {
    return this.assistants.getSalary(actor, id, query);
  }

  @Get(':id/salary-summary')
  salarySummary(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.assistants.getSalarySummary(actor, id);
  }

  @Get(':id/sessions')
  listSessions(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.assistants.listSessions(actor, id);
  }
}
