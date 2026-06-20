import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SessionStatus } from '@prisma/client';

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateSessionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ example: '2026-07-15T19:30:00.000Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-07-15T21:00:00.000Z' })
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ example: 'Minna no Nihongo Lesson 1' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  lessonTopic?: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMaxSize(20)
  assistantIds?: string[];
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}

export class BulkCreateSessionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ example: '2026-07-01', description: 'First date (inclusive)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-09-30', description: 'Last date (inclusive)' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    type: [Number],
    example: [1, 4],
    description: 'Days of week (0=Sun .. 6=Sat)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @Type(() => Number)
  daysOfWeek!: number[];

  @ApiProperty({ example: '19:30' })
  @Matches(HHMM, { message: 'startTime must be HH:mm' })
  startTime!: string;

  @ApiProperty({ example: '21:00' })
  @Matches(HHMM, { message: 'endTime must be HH:mm' })
  endTime!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  lessonTopic?: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMaxSize(20)
  assistantIds?: string[];
}

export class SessionRangeQueryDto {
  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: '2026-07-31T23:59:59.000Z' })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  classId?: string;
}
