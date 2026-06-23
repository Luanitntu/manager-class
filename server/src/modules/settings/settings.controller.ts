import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';
import { SettingsService } from './settings.service';
import { TestEmailDto, UpdateSettingsDto } from './dto/settings.dto';

const MAX_FAVICON_BYTES = 2 * 1024 * 1024; // 2 MB

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // Public so the login/register screens + <head> can read brand/SEO/maintenance.
  @Public()
  @Get()
  get() {
    return this.settings.getPublic();
  }

  // Public favicon stream (used by <link rel="icon">).
  @Public()
  @SkipTransform()
  @Get('favicon')
  async favicon(@Res() res: Response) {
    const fav = await this.settings.getFavicon();
    if (!fav) {
      throw new NotFoundException('No favicon set');
    }
    res.setHeader('Content-Type', fav.contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    fav.stream.pipe(res);
  }

  // Full settings incl. integration credentials — Super Admin only.
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Get('admin')
  getAdmin() {
    return this.settings.getAdmin();
  }

  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Post('test-email')
  testEmail(@Body() dto: TestEmailDto) {
    return this.settings.sendTestEmail(dto.to);
  }

  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Post('favicon')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FAVICON_BYTES } }))
  uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('File is required');
    }
    return this.settings.setFavicon(file);
  }
}
