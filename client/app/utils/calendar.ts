import type { TeachingSession } from '~/composables/useSessions';

export type CalendarViewMode = 'month' | 'week';

export interface CalendarCell {
  key: string;
  date: Date;
  inMonth: boolean;
}

export const calendarWeekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const fallbackColors = ['#0D6EFD', '#7367F0', '#00B894', '#FF6B00'];
const defaultCalendarColor = '#0D6EFD';
const onlineProviderLabels: Record<string, string> = {
  GOOGLE_MEET: 'Google Meet',
  ZOOM: 'Zoom',
  OTHER: 'Online',
};

export function buildCalendarCells(date: Date, mode: CalendarViewMode): CalendarCell[] {
  if (mode === 'week') {
    const weekStart = startOfWeek(date);
    return Array.from({ length: 7 }, (_, index) => {
      const cellDate = addDays(weekStart, index);
      return {
        key: toDateKey(cellDate),
        date: cellDate,
        inMonth: cellDate.getMonth() === date.getMonth(),
      };
    });
  }

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const totalDays = differenceInDays(gridStart, gridEnd) + 1;

  return Array.from({ length: totalDays }, (_, index) => {
    const cellDate = addDays(gridStart, index);
    return {
      key: toDateKey(cellDate),
      date: cellDate,
      inMonth: cellDate.getMonth() === date.getMonth(),
    };
  });
}

export function groupSessionsByDay(sessions: TeachingSession[]) {
  return sessions.reduce<Record<string, TeachingSession[]>>((days, session) => {
    const key = toDateKey(new Date(session.startTime));
    days[key] ??= [];
    days[key].push(session);
    days[key].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return days;
  }, {});
}

export function sessionEventColor(session: TeachingSession) {
  if (session.status === 'CANCELLED') return '#94A3B8';
  return session.class.color || colorForId(session.classId);
}

export function sessionEventLabel(session: TeachingSession) {
  return `${formatTime(session.startTime)} ${session.lessonTopic || session.class.name}`;
}

export function sessionDetailRange(session: TeachingSession) {
  return `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`;
}

export function isSessionOnline(session: TeachingSession) {
  return session.class.locationType === 'ONLINE';
}

export function sessionLocationLabel(session: TeachingSession) {
  if (isSessionOnline(session)) {
    return onlineProviderLabels[session.class.meetingProvider ?? 'OTHER'] ?? 'Online';
  }

  return session.class.room || 'Phòng học';
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function formatMonthSubtitle(date: Date) {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

export function formatShortDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function formatShortDatePadded(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCalendarToolbarTitle(date: Date, mode: CalendarViewMode) {
  if (mode === 'week') {
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }

  return `Tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
}

export function isToday(date: Date) {
  return toDateKey(date) === toDateKey(new Date());
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

export function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

export function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function differenceInDays(start: Date, end: Date) {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000);
}

export function withTime(date: Date, hour: number, minute: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
}

export function colorForId(id: string) {
  const total = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackColors[total % fallbackColors.length] ?? defaultCalendarColor;
}

export function normalizeHexColor(hex?: string | null) {
  return hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : defaultCalendarColor;
}

export function softHexColor(hex: string, alpha: number) {
  const normalized = normalizeHexColor(hex).replace('#', '');
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
