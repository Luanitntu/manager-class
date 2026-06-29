import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  NOTIFICATION_QUEUE,
  NotificationJob,
  REMINDER_LEAD_MS,
  SessionChangeType,
} from './notification.constants';

/**
 * Enqueues email-notification jobs. Background processing happens in
 * NotificationProcessor. Enqueue failures (e.g. Redis unavailable) are logged
 * but never break the originating request.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Optional: when the queue is disabled (no Redis), this is undefined and
  // enqueue calls become safe no-ops.
  constructor(@Optional() @InjectQueue(NOTIFICATION_QUEUE) private readonly queue?: Queue) {}

  /** Queue health for the admin console. */
  async getStats(): Promise<{ enabled: boolean; counts?: Record<string, number> }> {
    if (!this.queue) return { enabled: false };
    try {
      const counts = await this.queue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed',
      );
      return { enabled: true, counts };
    } catch {
      return { enabled: false };
    }
  }

  async notifySessionChanged(sessionId: string, changeType: SessionChangeType): Promise<void> {
    await this.safeAdd(NotificationJob.SessionChanged, { sessionId, changeType });
  }

  /** Schedules a reminder to fire 30 minutes before the session start. */
  async scheduleSessionReminder(sessionId: string, startTime: Date): Promise<void> {
    const delay = startTime.getTime() - REMINDER_LEAD_MS - Date.now();
    if (delay <= 0) return; // too late to remind
    await this.safeAdd(
      NotificationJob.SessionReminder,
      { sessionId },
      { delay, jobId: `reminder-${sessionId}` },
    );
  }

  async sendPaymentReminder(tuitionId: string): Promise<void> {
    await this.safeAdd(NotificationJob.PaymentReminder, { tuitionId });
  }

  private async safeAdd(
    name: NotificationJob,
    data: Record<string, unknown>,
    opts?: { delay?: number; jobId?: string },
  ): Promise<void> {
    if (!this.queue) return; // queue disabled (no Redis)
    try {
      await this.queue.add(name, data, {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        ...opts,
      });
    } catch (err) {
      this.logger.error(`Failed to enqueue ${name}: ${(err as Error).message}`);
    }
  }
}
