import { DateTime } from 'luxon';

/**
 * Converts a wall-clock date + time entered in `zone` to a UTC ISO string.
 * e.g. ('2026-07-01', '07:00', 'America/New_York') -> the matching UTC instant.
 */
export function wallTimeToUtcISO(dateStr: string, timeStr: string, zone: string): string {
  const dt = DateTime.fromISO(`${dateStr}T${timeStr}`, { zone });
  return dt.toUTC().toISO() ?? new Date(`${dateStr}T${timeStr}`).toISOString();
}

/** Splits a UTC ISO instant into { date, time } as seen in `zone` (for form prefill). */
export function utcToWallParts(iso: string, zone: string): { date: string; time: string } {
  const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);
  return { date: dt.toFormat('yyyy-MM-dd'), time: dt.toFormat('HH:mm') };
}

/** Human-friendly formatting of a UTC instant in the given zone. */
export function formatInZone(iso: string, zone: string, locale = 'vi'): string {
  return DateTime.fromISO(iso, { zone: 'utc' })
    .setZone(zone)
    .setLocale(locale)
    .toFormat('ccc, dd LLL yyyy HH:mm');
}
