import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LocationType, MeetingProvider } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Japanese N5' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'N5' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({ example: '#5D87FF' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ example: 24, description: 'Planned course length (number of sessions).' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  totalSessions?: number;

  @ApiPropertyOptional({ example: 4000000, description: 'Default course tuition fee.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  tuitionFee?: number;

  @ApiPropertyOptional({ enum: LocationType })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional({ example: 'P.201', description: 'Room number for offline classes.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  room?: string;

  @ApiPropertyOptional({ enum: MeetingProvider })
  @IsOptional()
  @IsEnum(MeetingProvider)
  meetingProvider?: MeetingProvider;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  meetingUrl?: string;
}

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class EnrollStudentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({
    description: 'Optional note about the student (synced to the student profile).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class AssignAssistantDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  assistantId!: string;
}
