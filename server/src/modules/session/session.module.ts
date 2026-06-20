import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { SessionConflictService } from './session-conflict.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, SessionConflictService],
  exports: [SessionService, SessionRepository],
})
export class SessionModule {}
