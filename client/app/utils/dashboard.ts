import { DateTime } from 'luxon';
import type { UpcomingSession } from '~/composables/useDashboard';

export type DashboardLocale = string | { value: string };

export function dashboardLocale(locale: DashboardLocale) {
  return typeof locale === 'string' ? locale : locale.value;
}

export function localeCode(locale: DashboardLocale) {
  return dashboardLocale(locale) === 'vi' ? 'vi-VN' : 'en-US';
}

export function formatDashboardNumber(value?: number, locale: DashboardLocale = 'vi') {
  return (value ?? 0).toLocaleString(localeCode(locale));
}

export function formatDashboardMoney(value?: number, locale: DashboardLocale = 'vi') {
  return formatDashboardNumber(value, locale);
}

export function formatDashboardMoneyShort(value?: number, locale: DashboardLocale = 'vi') {
  const amount = value ?? 0;
  if (amount >= 1_000_000) return `${trimDecimal(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `${trimDecimal(amount / 1_000)}K`;
  return amount.toLocaleString(localeCode(locale));
}

export function trimDecimal(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

export function sessionTimeRange(session: Pick<UpcomingSession, 'startTime' | 'endTime'>, zone: string) {
  const start = DateTime.fromISO(session.startTime, { zone: 'utc' }).setZone(zone);
  const end = DateTime.fromISO(session.endTime, { zone: 'utc' }).setZone(zone);
  return `${start.toFormat('HH:mm')} - ${end.toFormat('HH:mm')}`;
}

export function sessionDayLabel(
  session: Pick<UpcomingSession, 'startTime'>,
  zone: string,
  locale: DashboardLocale,
  today = DateTime.now().setZone(zone),
) {
  const date = DateTime.fromISO(session.startTime, { zone: 'utc' }).setZone(zone).startOf('day');
  const dayDiff = Math.round(date.diff(today.startOf('day'), 'days').days);
  if (dayDiff === 0) return dashboardLocale(locale) === 'vi' ? 'Hôm nay' : 'Today';
  if (dayDiff === 1) return dashboardLocale(locale) === 'vi' ? 'Ngày mai' : 'Tomorrow';
  return date.setLocale(dashboardLocale(locale)).toFormat('dd/LL');
}

export function monthDashboardLabel(month: DateTime, locale: DashboardLocale) {
  return dashboardLocale(locale) === 'vi'
    ? `Tháng ${month.month}, ${month.year}`
    : month.setLocale('en').toFormat('LLLL yyyy');
}

export function calendarMonthCells(cursor: DateTime, markedDays: Set<number>, today: DateTime) {
  const count = cursor.daysInMonth ?? 30;
  const leadingEmptyDays = cursor.startOf('month').weekday - 1;
  const days = [
    ...Array.from({ length: leadingEmptyDays }, (_, index) => 0 - index).reverse(),
    ...Array.from({ length: count }, (_, index) => index + 1),
  ];

  return days.map((day) => ({
    day,
    active: day > 0 && day === today.day && cursor.month === today.month && cursor.year === today.year,
    marked: day > 0 && markedDays.has(day),
  }));
}

export function dashboardDotColor(index: number) {
  return ['#0d7df2', '#635bff', '#10b981', '#ff6b00'][index % 4];
}
