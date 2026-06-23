import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  // Teacher: own tenant. Super Admin: all. (Assistant/Student: forbidden.)
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  @Get()
  list(@CurrentUser() actor: AuthenticatedUser, @Query() query: AuditQueryDto) {
    return this.audit.list(actor, query);
  }
}
