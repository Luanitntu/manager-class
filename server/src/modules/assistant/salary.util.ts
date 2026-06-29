import { SalaryMethod } from '@prisma/client';

export interface SalarySessionInput {
  classId: string;
  className: string;
  startTime: Date;
  endTime: Date;
}

export interface SalaryClassBreakdown {
  classId: string;
  className: string;
  sessionCount: number;
  hours: number;
  amount: number;
}

export interface SalaryResult {
  method: SalaryMethod;
  rate: number;
  totalSessions: number;
  totalHours: number;
  totalClasses: number;
  totalAmount: number;
  byClass: SalaryClassBreakdown[];
}

function hoursBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Computes assistant salary from assigned sessions per the configured method:
 *   - PER_SESSION: rate × number of sessions
 *   - PER_HOUR:    rate × total session hours
 *   - PER_CLASS:   rate × number of distinct classes
 */
export function calculateSalary(
  method: SalaryMethod,
  rate: number,
  sessions: SalarySessionInput[],
): SalaryResult {
  const groups = new Map<string, SalaryClassBreakdown>();

  for (const s of sessions) {
    const entry = groups.get(s.classId) ?? {
      classId: s.classId,
      className: s.className,
      sessionCount: 0,
      hours: 0,
      amount: 0,
    };
    entry.sessionCount += 1;
    entry.hours += hoursBetween(s.startTime, s.endTime);
    groups.set(s.classId, entry);
  }

  const byClass = [...groups.values()].map((g) => {
    let amount = 0;
    if (method === SalaryMethod.PER_SESSION) amount = rate * g.sessionCount;
    else if (method === SalaryMethod.PER_HOUR) amount = rate * g.hours;
    else if (method === SalaryMethod.PER_CLASS) amount = rate; // one unit per class
    return { ...g, hours: round2(g.hours), amount: round2(amount) };
  });

  const totalSessions = byClass.reduce((a, c) => a + c.sessionCount, 0);
  const totalHours = round2(byClass.reduce((a, c) => a + c.hours, 0));
  const totalClasses = byClass.length;
  const totalAmount = round2(byClass.reduce((a, c) => a + c.amount, 0));

  return { method, rate, totalSessions, totalHours, totalClasses, totalAmount, byClass };
}

export interface RatePeriod {
  method: SalaryMethod;
  rate: number;
  effectiveFrom: Date;
}

/**
 * History-aware salary: each session is paid at the rate effective on its date, so
 * changing the rate never rewrites the past. Method is taken from the latest period
 * (method changes are rare); rate is per-session-historical. Returns per-class
 * subtotals + grand total. The `rate` field is the current (latest) rate.
 */
export function calculateSalaryWithRates(
  sessions: SalarySessionInput[],
  periods: RatePeriod[],
): SalaryResult {
  const sorted = [...periods].sort((a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime());
  const current = sorted[sorted.length - 1] ?? {
    method: SalaryMethod.PER_SESSION,
    rate: 0,
    effectiveFrom: new Date(0),
  };
  const method = current.method;

  const rateAt = (t: Date): number => {
    let r = sorted[0]?.rate ?? 0;
    for (const p of sorted) {
      if (p.effectiveFrom <= t) r = p.rate;
      else break;
    }
    return r;
  };

  const groups = new Map<string, SalaryClassBreakdown & { earliest: Date }>();
  for (const s of sessions) {
    const entry = groups.get(s.classId) ?? {
      classId: s.classId,
      className: s.className,
      sessionCount: 0,
      hours: 0,
      amount: 0,
      earliest: s.startTime,
    };
    const h = hoursBetween(s.startTime, s.endTime);
    entry.sessionCount += 1;
    entry.hours += h;
    if (s.startTime < entry.earliest) entry.earliest = s.startTime;
    if (method === SalaryMethod.PER_SESSION) entry.amount += rateAt(s.startTime);
    else if (method === SalaryMethod.PER_HOUR) entry.amount += rateAt(s.startTime) * h;
    groups.set(s.classId, entry);
  }

  const byClass: SalaryClassBreakdown[] = [...groups.values()].map((g) => ({
    classId: g.classId,
    className: g.className,
    sessionCount: g.sessionCount,
    hours: round2(g.hours),
    // PER_CLASS: one charge per class, at the rate effective on its first session.
    amount: round2(method === SalaryMethod.PER_CLASS ? rateAt(g.earliest) : g.amount),
  }));

  const totalSessions = byClass.reduce((a, c) => a + c.sessionCount, 0);
  const totalHours = round2(byClass.reduce((a, c) => a + c.hours, 0));
  const totalAmount = round2(byClass.reduce((a, c) => a + c.amount, 0));

  return {
    method,
    rate: current.rate,
    totalSessions,
    totalHours,
    totalClasses: byClass.length,
    totalAmount,
    byClass,
  };
}
