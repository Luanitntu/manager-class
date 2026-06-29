import { Module } from '@nestjs/common';
import { StorageModule } from '../../infra/storage/storage.module';
import { PasswordService } from '../../common/security/password.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule],
  controllers: [UserController],
  providers: [UserService, PasswordService],
  exports: [UserService],
})
export class UserModule {}
