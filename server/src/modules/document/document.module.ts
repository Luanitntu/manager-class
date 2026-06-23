import { Module } from '@nestjs/common';
import { StorageModule } from '../../infra/storage/storage.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentRepository } from './document.repository';

@Module({
  imports: [StorageModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository],
  exports: [DocumentService],
})
export class DocumentModule {}
