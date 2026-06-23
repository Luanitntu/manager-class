import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  platformName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowRegistration?: boolean;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  defaultTimezone?: string;

  // ----- Integrations (applied by services in a later phase) -----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  resendApiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  emailFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  r2AccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  r2AccessKeyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  r2SecretAccessKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  r2Bucket?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  r2PublicUrl?: string;

  // ----- Operational toggles -----
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ enum: ['local', 'r2'] })
  @IsOptional()
  @IsIn(['local', 'r2'])
  storageDriver?: string;

  @ApiPropertyOptional({ minimum: 30, maximum: 86400 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  @Max(86400)
  healthRefreshSeconds?: number;

  // ----- Branding & SEO -----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoKeywords?: string;

  // ----- Announcement banner -----
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  announcement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  announcementActive?: boolean;
}

export class TestEmailDto {
  @ApiPropertyOptional({ example: 'you@example.com' })
  @IsOptional()
  @IsEmail()
  to?: string;
}
