export interface RecurringSlotInput {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysOfWeek: number[]; // 0=Sun .. 6=Sat
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

const MAX_SLOTS = 500; // guard against runaway ranges

/**
 * Expands a recurrence rule into concrete UTC time slots.
 * Dates are interpreted in UTC for deterministic generation; per-tenant
 * timezone support is future work.
 */
export function generateRecurringSlots(input: RecurringSlotInput): TimeSlot[] {
  const { startDate, endDate, daysOfWeek, startTime, endTime } = input;
  const days = new Set(daysOfWeek);

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const last = new Date(`${endDate}T00:00:00.000Z`);
  const slots: TimeSlot[] = [];

  while (cursor <= last) {
    if (days.has(cursor.getUTCDay())) {
      const start = new Date(cursor);
      start.setUTCHours(sh, sm, 0, 0);
      const end = new Date(cursor);
      end.setUTCHours(eh, em, 0, 0);
      slots.push({ start, end });

      if (slots.length > MAX_SLOTS) {
        throw new Error(`Recurrence would generate more than ${MAX_SLOTS} sessions`);
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return slots;
}
