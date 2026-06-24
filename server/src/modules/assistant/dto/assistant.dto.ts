import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalaryMethod } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSalaryDto {
  @ApiProperty({ enum: SalaryMethod })
  @IsEnum(SalaryMethod)
  salaryMethod!: SalaryMethod;

  @ApiProperty({ example: 150000, description: 'Rate per session/hour/class' })
  @IsNumber()
  @Min(0)
  @Max(100_000_000)
  salaryRate!: number;

  @ApiPropertyOptional({ description: 'When this rate takes effect (ISO date).' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  // ----- Personal info -----
  @ApiPropertyOptional({ example: '0909123456' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'N2 Japanese' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  level?: string;

  @ApiPropertyOptional({ example: 'Đà Nẵng' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  hometown?: string;
}

export class SalaryQueryDto {
  @ApiPropertyOptional({ description: 'Range start (ISO)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Range end (ISO)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
