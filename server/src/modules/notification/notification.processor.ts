import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  NOTIFICATION_QUEUE,
  NotificationJob,
  PaymentReminderPayload,
  SessionChangedPayload,
  SessionReminderPayload,
} from './notification.constants';

/**
 * Background worker that turns notification jobs into emails.
 * Recipients are resolved at processing time so they reflect current data.
 */
@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case NotificationJob.SessionChanged:
        return this.handleSessionChanged(job.data as SessionChangedPayload);
      case NotificationJob.SessionReminder:
        return this.handleSessionReminder(job.data as SessionReminderPayload);
      case NotificationJob.PaymentReminder:
        return this.handlePaymentReminder(job.data as PaymentReminderPayload);
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async sessionRecipients(sessionId: string) {
    const session = await this.prisma.teachingSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            enrollments: { include: { student: { select: { email: true, fullName: true } } } },
          },
        },
        assistants: { include: { assistant: { select: { email: true, fullName: true } } } },
      },
    });
    if (!session) return null;

    const recipients = [
      ...session.class.enrollments.map((e) => e.student),
      ...session.assistants.map((a) => a.assistant),
    ];
    return { session, recipients };
  }

  private async handleSessionChanged(payload: SessionChangedPayload): Promise<void> {
    const ctx = await this.sessionRecipients(payload.sessionId);
    if (!ctx) return;
    const { session, recipients } = ctx;
    const when = session.startTime.toISOString().replace('T', ' ').slice(0, 16);
    const verb =
      payload.changeType === 'cancelled'
        ? 'has been cancelled'
        : payload.changeType === 'created'
          ? 'has been scheduled'
          : 'has been updated';

    await Promise.all(
      recipients.map((r) =>
        this.mail.send({
          to: r.email,
          subject: `Session ${verb}: ${session.class.name}`,
          html: `<p>Hi ${r.fullName},</p><p>The session for <b>${session.class.name}</b> ${verb}.</p><p>When: ${when} UTC${session.lessonTopic ? `<br/>Topic: ${session.lessonTopic}` : ''}</p>`,
        }),
      ),
    );
  }

  private async handleSessionReminder(payload: SessionReminderPayload): Promise<void> {
    const ctx = await this.sessionRecipients(payload.sessionId);
    if (!ctx) return;
    const { session, recipients } = ctx;
    if (session.status === 'CANCELLED' || session.deletedAt) return;
    const when = session.startTime.toISOString().replace('T', ' ').slice(0, 16);

    await Promise.all(
      recipients.map((r) =>
        this.mail.send({
          to: r.email,
          subject: `Reminder: ${session.class.name} starts soon`,
          html: `<p>Hi ${r.fullName},</p><p>Your session for <b>${session.class.name}</b> starts at ${when} UTC.${session.lessonTopic ? `<br/>Topic: ${session.lessonTopic}` : ''}</p>`,
        }),
      ),
    );
  }

  private async handlePaymentReminder(payload: PaymentReminderPayload): Promise<void> {
    const tuition = await this.prisma.tuition.findUnique({
      where: { id: payload.tuitionId },
      include: {
        student: { select: { email: true, fullName: true } },
        class: { select: { name: true } },
      },
    });
    if (!tuition) return;
    const remaining = Number(tuition.totalAmount) - Number(tuition.paidAmount);

    await this.mail.send({
      to: tuition.student.email,
      subject: `Tuition reminder: ${tuition.class.name}`,
      html: `<p>Hi ${tuition.student.fullName},</p><p>This is a reminder that your tuition for <b>${tuition.class.name}</b> has an outstanding balance of <b>${remaining.toLocaleString()}</b>.</p>`,
    });
  }
}
