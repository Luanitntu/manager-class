import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { NOTIFICATION_QUEUE } from './notification.constants';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';

/**
 * Global so any module can inject NotificationService without importing this.
 * The BullMQ queue + worker are only wired when QUEUE_ENABLED !== 'false', so
 * the app runs cleanly with no Redis in dev (notifications become no-ops).
 */
@Global()
@Module({})
export class NotificationModule {
  static register(): DynamicModule {
    const enabled = process.env.QUEUE_ENABLED !== 'false';
    return {
      module: NotificationModule,
      imports: enabled ? [BullModule.registerQueue({ name: NOTIFICATION_QUEUE })] : [],
      providers: enabled ? [NotificationService, NotificationProcessor] : [NotificationService],
      exports: [NotificationService],
    };
  }
}
