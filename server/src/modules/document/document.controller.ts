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
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { DocumentService } from './document.service';
import {
  AssignDocumentDto,
  CreateDocumentDto,
  ListDocumentsQueryDto,
  UpdateDocumentDto,
  UploadDocumentDto,
} from './dto/document.dto';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  constructor(private readonly documents: DocumentService) {}

  // Create a LINK or metadata-only document (Teacher or Assistant).
  @Roles(Role.TEACHER, Role.ASSISTANT)
  @Post()
  create(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateDocumentDto) {
    return this.documents.create(actor, dto);
  }

  // Upload a PDF/MP3 file (separate from business endpoints, per API guidelines).
  @Roles(Role.TEACHER, Role.ASSISTANT)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  upload(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documents.upload(actor, dto, file);
  }

  @Get()
  list(@CurrentUser() actor: AuthenticatedUser, @Query() query: ListDocumentsQueryDto) {
    return this.documents.list(actor, query);
  }

  @Roles(Role.TEACHER, Role.ASSISTANT)
  @Get('categories')
  categories(@CurrentUser() actor: AuthenticatedUser) {
    return this.documents.getCategories(actor);
  }

  @Get(':id')
  findOne(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.documents.findOne(actor, id);
  }

  @Get(':id/download')
  async download(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    const { stream } = await this.documents.getDownload(actor, id);
    return new StreamableFile(stream);
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(actor, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.documents.remove(actor, id);
  }

  // ----- Assignments -----
  @Get(':id/assignments')
  listAssignments(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.documents.listAssignments(actor, id);
  }

  @Roles(Role.TEACHER, Role.ASSISTANT)
  @Post(':id/assignments')
  assign(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignDocumentDto,
  ) {
    return this.documents.assign(actor, id, dto);
  }

  @Roles(Role.TEACHER, Role.ASSISTANT)
  @Delete(':id/assignments/:assignmentId')
  removeAssignment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    return this.documents.removeAssignment(actor, id, assignmentId);
  }
}
