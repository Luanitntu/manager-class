import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ReportService, ReportQuery, ReportType, Lang } from './report.service';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@ApiTags('reports')
@ApiBearerAuth()
@Roles(Role.TEACHER)
@SkipTransform()
@Controller('reports')
export class ReportController {
  constructor(private readonly reports: ReportService) {}

  // type = tuition | scores | students | classes; format = xlsx (default) | pdf
  @Get(':type')
  async report(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('type') type: string,
    @Query() q: ReportQuery & { format?: string; lang?: string },
    @Res() res: Response,
  ): Promise<void> {
    const teacherId = actor.tenantId ?? actor.id;
    const format = q.format === 'pdf' ? 'pdf' : 'xlsx';
    const lang: Lang = q.lang === 'en' ? 'en' : 'vi';
    const table = await this.reports.build(teacherId, type as ReportType, q, lang);
    const buf =
      format === 'pdf' ? await this.reports.toPdf(table) : await this.reports.toExcel(table);

    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : XLSX_MIME);
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.${format}"`);
    res.end(buf);
  }
}
