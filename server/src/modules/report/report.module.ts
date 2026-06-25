import { Module } from '@nestjs/common';
import { StorageModule } from '../../infra/storage/storage.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [StorageModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
