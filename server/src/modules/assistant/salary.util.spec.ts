import { SalaryMethod } from '@prisma/client';
import { calculateSalary } from './salary.util';

const session = (classId: string, className: string, start: string, end: string) => ({
  classId,
  className,
  startTime: new Date(start),
  endTime: new Date(end),
});

const sessions = [
  session('c1', 'N5', '2026-07-01T10:00:00Z', '2026-07-01T11:30:00Z'), // 1.5h
  session('c1', 'N5', '2026-07-03T10:00:00Z', '2026-07-03T12:00:00Z'), // 2h
  session('c2', 'N4', '2026-07-02T10:00:00Z', '2026-07-02T11:00:00Z'), // 1h
];

describe('calculateSalary', () => {
  it('PER_SESSION pays per session', () => {
    const r = calculateSalary(SalaryMethod.PER_SESSION, 100, sessions);
    expect(r.totalSessions).toBe(3);
    expect(r.totalAmount).toBe(300);
    expect(r.byClass.find((c) => c.classId === 'c1')?.amount).toBe(200);
  });

  it('PER_HOUR pays per hour', () => {
    const r = calculateSalary(SalaryMethod.PER_HOUR, 100, sessions);
    expect(r.totalHours).toBe(4.5);
    expect(r.totalAmount).toBe(450);
  });

  it('PER_CLASS pays per distinct class', () => {
    const r = calculateSalary(SalaryMethod.PER_CLASS, 1000, sessions);
    expect(r.totalClasses).toBe(2);
    expect(r.totalAmount).toBe(2000);
  });

  it('handles no sessions', () => {
    const r = calculateSalary(SalaryMethod.PER_SESSION, 100, []);
    expect(r.totalAmount).toBe(0);
    expect(r.byClass).toHaveLength(0);
  });
});
