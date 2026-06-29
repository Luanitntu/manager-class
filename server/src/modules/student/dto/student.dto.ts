import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ScoreType, StudyStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListStudentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: StudyStatus })
  @IsOptional()
  @IsEnum(StudyStatus)
  status?: StudyStatus;
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ enum: StudyStatus })
  @IsOptional()
  @IsEnum(StudyStatus)
  studyStatus?: StudyStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: '1998-05-20' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  educationLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  learningGoal?: string;
}

export class CreateScoreDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ enum: ScoreType })
  @IsEnum(ScoreType)
  type!: ScoreType;

  @ApiPropertyOptional({ description: 'Label for CUSTOM scores' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0)
  @Max(1000)
  value!: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxValue?: number;

  @ApiPropertyOptional({ example: '2026-06-20', description: 'Date the score was achieved.' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateScoreDto extends PartialType(CreateScoreDto) {}

export class CreateCommentDto {
  @ApiPropertyOptional({ description: 'attitude | strengths | weaknesses | progress' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
