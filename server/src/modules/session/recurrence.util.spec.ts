import { generateRecurringSlots } from './recurrence.util';

describe('generateRecurringSlots', () => {
  it('generates sessions on the requested weekdays within range', () => {
    // 2026-07-01 is a Wednesday. Mondays(1) and Thursdays(4) in July 2026.
    const slots = generateRecurringSlots({
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      daysOfWeek: [1, 4], // Mon, Thu
      startTime: '19:30',
      endTime: '21:00',
    });

    // Thu Jul 2, Mon Jul 6, Thu Jul 9, Mon Jul 13. (Thu Jul 16 is out of range)
    expect(slots).toHaveLength(4);
    for (const slot of slots) {
      expect([1, 4]).toContain(slot.start.getUTCDay());
      expect(slot.start.getUTCHours()).toBe(19);
      expect(slot.start.getUTCMinutes()).toBe(30);
      expect(slot.end.getUTCHours()).toBe(21);
      expect(slot.end > slot.start).toBe(true);
    }
  });

  it('returns empty when no weekday matches', () => {
    const slots = generateRecurringSlots({
      startDate: '2026-07-01',
      endDate: '2026-07-01', // a single Wednesday
      daysOfWeek: [0], // Sunday
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(slots).toHaveLength(0);
  });

  it('throws when the range would exceed the safety cap', () => {
    expect(() =>
      generateRecurringSlots({
        startDate: '2000-01-01',
        endDate: '2030-01-01',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '08:00',
        endTime: '09:00',
      }),
    ).toThrow(/more than/);
  });
});
