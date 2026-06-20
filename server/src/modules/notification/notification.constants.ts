export const NOTIFICATION_QUEUE = 'notifications';

export enum NotificationJob {
  SessionChanged = 'session-changed',
  SessionReminder = 'session-reminder',
  PaymentReminder = 'payment-reminder',
}

export type SessionChangeType = 'created' | 'updated' | 'cancelled';

export interface SessionChangedPayload {
  sessionId: string;
  changeType: SessionChangeType;
}

export interface SessionReminderPayload {
  sessionId: string;
}

export interface PaymentReminderPayload {
  tuitionId: string;
}

export const REMINDER_LEAD_MS = 30 * 60 * 1000; // 30 minutes before start
