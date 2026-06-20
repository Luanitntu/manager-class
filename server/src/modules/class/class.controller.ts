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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ClassService } from './class.service';
import {
  AssignAssistantDto,
  CreateClassDto,
  EnrollStudentDto,
  UpdateClassDto,
} from './dto/class.dto';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassController {
  constructor(private readonly classes: ClassService) {}

  @Roles(Role.TEACHER)
  @Post()
  create(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateClassDto) {
    return this.classes.create(actor, dto);
  }

  // View: Teacher (all), Assistant/Student (assigned only) — scoped in service.
  @Get()
  findAll(@CurrentUser() actor: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.classes.findAll(actor, query);
  }

  @Get(':id')
  findOne(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.classes.findOne(actor, id);
  }

  @Roles(Role.TEACHER)
  @Patch(':id')
  update(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classes.update(actor, id, dto);
  }

  @Roles(Role.TEACHER)
  @Delete(':id')
  remove(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.classes.remove(actor, id);
  }

  // ----- Enrollment -----
  @Get(':id/students')
  listStudents(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.classes.listEnrollments(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post(':id/students')
  enroll(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.classes.enrollStudent(actor, id, dto.studentId);
  }

  @Roles(Role.TEACHER)
  @Delete(':id/students/:studentId')
  unenroll(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.classes.unenrollStudent(actor, id, studentId);
  }

  // ----- Assistant assignment -----
  @Get(':id/assistants')
  listAssistants(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.classes.listAssistants(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post(':id/assistants')
  assign(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAssistantDto,
  ) {
    return this.classes.assignAssistant(actor, id, dto.assistantId);
  }

  @Roles(Role.TEACHER)
  @Delete(':id/assistants/:assistantId')
  unassign(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assistantId', ParseUUIDPipe) assistantId: string,
  ) {
    return this.classes.unassignAssistant(actor, id, assistantId);
  }
}
