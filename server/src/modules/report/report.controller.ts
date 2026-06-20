import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ReportService } from './report.service';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@ApiTags('reports')
@ApiBearerAuth()
@Roles(Role.TEACHER)
@SkipTransform()
@Controller('reports')
export class ReportController {
  constructor(private readonly reports: ReportService) {}

  @Get('tuition.xlsx')
  @Header('Content-Type', XLSX_MIME)
  @Header('Content-Disposition', 'attachment; filename="tuition-report.xlsx"')
  async tuition(@CurrentUser() actor: AuthenticatedUser): Promise<Buffer> {
    return this.reports.tuitionReport(actor.tenantId ?? actor.id);
  }

  @Get('scores.xlsx')
  @Header('Content-Type', XLSX_MIME)
  @Header('Content-Disposition', 'attachment; filename="scores-report.xlsx"')
  async scores(
    @CurrentUser() actor: AuthenticatedUser,
    @Query('classId') classId: string | undefined,
  ): Promise<Buffer> {
    return this.reports.scoresReport(actor.tenantId ?? actor.id, classId);
  }
}
