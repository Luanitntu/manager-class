import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionRepository } from './session.repository';
import { SessionConflictService } from './session-conflict.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, SessionConflictService],
  exports: [SessionService, SessionRepository],
})
export class SessionModule {}
