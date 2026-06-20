import { PaymentStatus } from '@prisma/client';

/**
 * Derives the tuition status from amounts and due date.
 *   paid >= total            -> PAID
 *   0 < paid < total         -> PARTIALLY_PAID
 *   paid == 0 & past due     -> OVERDUE
 *   paid == 0 & not past due -> PENDING
 */
export function computePaymentStatus(
  total: number,
  paid: number,
  dueDate: Date | null,
  now: Date,
): PaymentStatus {
  if (paid >= total && total > 0) return PaymentStatus.PAID;
  if (paid > 0) return PaymentStatus.PARTIALLY_PAID;
  if (dueDate && dueDate < now) return PaymentStatus.OVERDUE;
  return PaymentStatus.PENDING;
}

/** Generates a human-readable, reasonably unique receipt number. */
export function generateReceiptNumber(now: Date, random: string): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `RCPT-${y}${m}-${random.toUpperCase()}`;
}
