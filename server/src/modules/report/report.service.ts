import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Generates Excel exports. PDF export (Puppeteer per the tech stack) is a
 * planned follow-up; the data-gathering here is reusable by a future PDF
 * renderer.
 */
@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async tuitionReport(teacherId: string): Promise<Buffer> {
    const tuitions = await this.prisma.tuition.findMany({
      where: { teacherId },
      include: {
        student: { select: { fullName: true, email: true } },
        class: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Tuition Status');
    ws.columns = [
      { header: 'Student', key: 'student', width: 28 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Class', key: 'class', width: 22 },
      { header: 'Total', key: 'total', width: 14 },
      { header: 'Paid', key: 'paid', width: 14 },
      { header: 'Remaining', key: 'remaining', width: 14 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Due Date', key: 'dueDate', width: 16 },
    ];
    ws.getRow(1).font = { bold: true };

    for (const t of tuitions) {
      const total = Number(t.totalAmount);
      const paid = Number(t.paidAmount);
      ws.addRow({
        student: t.student.fullName,
        email: t.student.email,
        class: t.class.name,
        total,
        paid,
        remaining: total - paid,
        status: t.status,
        dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : '',
      });
    }

    return this.toBuffer(wb);
  }

  async scoresReport(teacherId: string, classId?: string): Promise<Buffer> {
    const scores = await this.prisma.score.findMany({
      where: { teacherId, ...(classId ? { classId } : {}) },
      include: {
        student: { select: { fullName: true } },
        class: { select: { name: true } },
      },
      orderBy: [{ classId: 'asc' }, { studentId: 'asc' }],
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Scores');
    ws.columns = [
      { header: 'Class', key: 'class', width: 22 },
      { header: 'Student', key: 'student', width: 28 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Label', key: 'label', width: 18 },
      { header: 'Score', key: 'value', width: 10 },
      { header: 'Max', key: 'max', width: 10 },
    ];
    ws.getRow(1).font = { bold: true };

    for (const s of scores) {
      ws.addRow({
        class: s.class.name,
        student: s.student.fullName,
        type: s.type,
        label: s.label ?? '',
        value: Number(s.value),
        max: Number(s.maxValue),
      });
    }

    return this.toBuffer(wb);
  }

  private async toBuffer(wb: ExcelJS.Workbook): Promise<Buffer> {
    const data = await wb.xlsx.writeBuffer();
    return Buffer.from(data);
  }
}
