import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DocumentTargetType, DocumentType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiPropertyOptional({ example: 'A1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  // Required when type === LINK.
  @ApiPropertyOptional()
  @ValidateIf((o: CreateDocumentDto) => o.type === DocumentType.LINK)
  @IsUrl()
  url?: string;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}

export class UploadDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'A1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}

export class AssignDocumentDto {
  @ApiProperty({ enum: DocumentTargetType })
  @IsEnum(DocumentTargetType)
  targetType!: DocumentTargetType;

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((o: AssignDocumentDto) => o.targetType === DocumentTargetType.CLASS)
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((o: AssignDocumentDto) => o.targetType === DocumentTargetType.STUDENT)
  @IsUUID()
  studentId?: string;
}

export class ListDocumentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  // SHARED = not assigned to any class (library); CLASS = assigned to a class.
  @ApiPropertyOptional({ enum: ['SHARED', 'CLASS'] })
  @IsOptional()
  @IsIn(['SHARED', 'CLASS'])
  scope?: 'SHARED' | 'CLASS';

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  classId?: string;
}
