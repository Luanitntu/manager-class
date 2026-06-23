export interface RecurringSlotInput {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysOfWeek: number[]; // 0=Sun .. 6=Sat
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  /** IANA timezone the wall-clock times are expressed in (e.g. "Asia/Ho_Chi_Minh"). */
  timeZone?: string;
  /**
   * Fallback: client tz offset in minutes (Date.getTimezoneOffset, UTC+7 = -420).
   * Used only when `timeZone` is not provided. Defaults to 0 (UTC).
   */
  tzOffsetMinutes?: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

const MAX_SLOTS = 500; // guard against runaway ranges

/**
 * Returns the offset (minutes) of `timeZone` at the given UTC instant,
 * where local = UTC + offset. DST-aware via Intl.
 */
function tzOffsetAt(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asIfUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return (asIfUtc - utcMs) / 60_000;
}

/**
 * Converts a wall-clock time in `timeZone` to the corresponding UTC Date.
 * Two-pass to settle DST boundaries.
 */
function zonedWallTimeToUtc(
  y: number,
  mon: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(y, mon, d, hh, mm);
  let offset = tzOffsetAt(guess, timeZone);
  let utc = guess - offset * 60_000;
  // Re-evaluate offset at the computed instant (handles DST transitions).
  const offset2 = tzOffsetAt(utc, timeZone);
  if (offset2 !== offset) {
    offset = offset2;
    utc = guess - offset * 60_000;
  }
  return new Date(utc);
}

/**
 * Expands a recurrence rule into concrete UTC time slots. `HH:mm` are
 * interpreted as wall-clock times in the user's timezone so they match how
 * single sessions are created and display correctly for every viewer.
 */
export function generateRecurringSlots(input: RecurringSlotInput): TimeSlot[] {
  const { startDate, endDate, daysOfWeek, startTime, endTime, timeZone } = input;
  const offsetMin = input.tzOffsetMinutes ?? 0;
  const days = new Set(daysOfWeek);

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const last = new Date(`${endDate}T00:00:00.000Z`);
  const slots: TimeSlot[] = [];

  const toUtc = (y: number, mon: number, d: number, h: number, mi: number): Date =>
    timeZone
      ? zonedWallTimeToUtc(y, mon, d, h, mi, timeZone)
      : new Date(Date.UTC(y, mon, d, h, mi) + offsetMin * 60_000);

  while (cursor <= last) {
    if (days.has(cursor.getUTCDay())) {
      const y = cursor.getUTCFullYear();
      const mon = cursor.getUTCMonth();
      const d = cursor.getUTCDate();
      slots.push({ start: toUtc(y, mon, d, sh, sm), end: toUtc(y, mon, d, eh, em) });

      if (slots.length > MAX_SLOTS) {
        throw new Error(`Recurrence would generate more than ${MAX_SLOTS} sessions`);
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return slots;
}
