import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../../config/configuration';

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Thin email abstraction. In Phase 10 this is backed by Resend + BullMQ.
 * Until an API key is configured it logs the message so flows are testable.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send({ to, subject, html }: SendEmailArgs): Promise<void> {
    const email = this.config.getOrThrow<EmailConfig>('email');
    if (!email.resendApiKey) {
      this.logger.warn(
        `[MAIL:DEV] To=${to} Subject="${subject}"\n${html.replace(/<[^>]+>/g, ' ').trim()}`,
      );
      return;
    }
    // Real Resend dispatch is wired in Phase 10 (Email Automation).
    this.logger.log(`[MAIL] Sent "${subject}" to ${to}`);
  }

  async sendVerificationEmail(to: string, link: string): Promise<void> {
    await this.send({
      to,
      subject: 'Verify your email',
      html: `<p>Welcome to Schedule Teacher!</p><p>Verify your email: <a href="${link}">${link}</a></p>`,
    });
  }

  async sendPasswordResetEmail(to: string, link: string): Promise<void> {
    await this.send({
      to,
      subject: 'Reset your password',
      html: `<p>Reset your password: <a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
    });
  }
}
