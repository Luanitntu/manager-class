import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { MailService } from '../mail/mail.service';
import { UpdateSettingsDto } from './dto/settings.dto';

const SINGLETON_ID = 'singleton';

// Fields safe to expose publicly (no secrets).
const PUBLIC_SELECT = {
  platformName: true,
  supportEmail: true,
  allowRegistration: true,
  defaultTimezone: true,
  maintenanceMode: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  faviconKey: true,
  announcement: true,
  announcementActive: true,
} satisfies Prisma.SystemSettingSelect;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly mail: MailService,
  ) {}

  async sendTestEmail(to?: string) {
    const target = to || (await this.ensure()).supportEmail;
    if (!target) {
      throw new BadRequestException('No recipient (provide an email or set a support email)');
    }
    await this.mail.send({
      to: target,
      subject: 'Schedule Teacher — test email',
      html: '<p>This is a test email from Schedule Teacher. If you received it, email delivery works.</p>',
    });
    return { sent: true, to: target };
  }

  private ensure() {
    return this.prisma.systemSetting.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  }

  /** Public, non-secret settings (for login/register screens). */
  async getPublic() {
    await this.ensure();
    return this.prisma.systemSetting.findUniqueOrThrow({
      where: { id: SINGLETON_ID },
      select: PUBLIC_SELECT,
    });
  }

  /** Full settings incl. integration credentials — Super Admin only. */
  async getAdmin() {
    return this.ensure();
  }

  update(dto: UpdateSettingsDto) {
    // Ignore empty strings so blank fields don't wipe existing secrets.
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== '') {
        data[key] = value;
      }
    }
    return this.prisma.systemSetting.upsert({
      where: { id: SINGLETON_ID },
      update: data as Prisma.SystemSettingUpdateInput,
      create: { id: SINGLETON_ID, ...data } as Prisma.SystemSettingUncheckedCreateInput,
    });
  }

  async setFavicon(file: { buffer: Buffer; originalname: string }) {
    const stored = await this.storage.putObject(file.buffer, file.originalname);
    await this.ensure();
    await this.prisma.systemSetting.update({
      where: { id: SINGLETON_ID },
      data: { faviconKey: stored.key },
    });
    return { faviconKey: stored.key };
  }

  async getFavicon() {
    const s = await this.prisma.systemSetting.findUnique({ where: { id: SINGLETON_ID } });
    if (!s?.faviconKey) return null;
    const ext = s.faviconKey.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'ico'
        ? 'image/x-icon'
        : ext === 'svg'
          ? 'image/svg+xml'
          : ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : 'image/png';
    return { stream: await this.storage.getObjectStream(s.faviconKey), contentType };
  }
}
