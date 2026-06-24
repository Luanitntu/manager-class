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
import { StudentService } from './student.service';
import {
  CreateCommentDto,
  CreateScoreDto,
  ListStudentsQueryDto,
  UpdateScoreDto,
  UpdateStudentProfileDto,
} from './dto/student.dto';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentController {
  constructor(private readonly students: StudentService) {}

  @Roles(Role.TEACHER)
  @Get()
  list(@CurrentUser() actor: AuthenticatedUser, @Query() query: ListStudentsQueryDto) {
    return this.students.list(actor, query);
  }

  // Accessible to teacher (tenant), assigned assistant, or the student themselves.
  @Get(':id')
  getOne(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.students.getOne(actor, id);
  }

  // Teacher edits any tenant student; a student may edit their own profile.
  @Patch(':id/profile')
  updateProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.students.updateProfile(actor, id, dto);
  }

  // ----- Payments + Activity -----
  @Get(':id/payments')
  getPayments(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.students.getPayments(actor, id);
  }

  @Get(':id/activity')
  getActivity(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.students.getActivity(actor, id);
  }

  // ----- Scores -----
  @Get(':id/scores')
  listScores(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.students.listScores(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post(':id/scores')
  addScore(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateScoreDto,
  ) {
    return this.students.addScore(actor, id, dto);
  }

  @Roles(Role.TEACHER)
  @Patch('scores/:scoreId')
  updateScore(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('scoreId', ParseUUIDPipe) scoreId: string,
    @Body() dto: UpdateScoreDto,
  ) {
    return this.students.updateScore(actor, scoreId, dto);
  }

  @Roles(Role.TEACHER)
  @Delete('scores/:scoreId')
  deleteScore(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('scoreId', ParseUUIDPipe) scoreId: string,
  ) {
    return this.students.deleteScore(actor, scoreId);
  }

  // ----- Comments -----
  @Get(':id/comments')
  listComments(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.students.listComments(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post(':id/comments')
  addComment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.students.addComment(actor, id, dto);
  }

  @Roles(Role.TEACHER)
  @Delete('comments/:commentId')
  deleteComment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.students.deleteComment(actor, commentId);
  }
}
