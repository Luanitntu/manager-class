import { PaymentStatus } from '@prisma/client';
import { computePaymentStatus, generateReceiptNumber } from './payment-status.util';

describe('computePaymentStatus', () => {
  const now = new Date('2026-07-15T00:00:00Z');

  it('is PAID when fully paid', () => {
    expect(computePaymentStatus(1000, 1000, null, now)).toBe(PaymentStatus.PAID);
    expect(computePaymentStatus(1000, 1200, null, now)).toBe(PaymentStatus.PAID);
  });

  it('is PARTIALLY_PAID when some paid', () => {
    expect(computePaymentStatus(1000, 400, null, now)).toBe(PaymentStatus.PARTIALLY_PAID);
  });

  it('is OVERDUE when nothing paid and past due', () => {
    expect(computePaymentStatus(1000, 0, new Date('2026-07-01T00:00:00Z'), now)).toBe(
      PaymentStatus.OVERDUE,
    );
  });

  it('is PENDING when nothing paid and not yet due', () => {
    expect(computePaymentStatus(1000, 0, new Date('2026-08-01T00:00:00Z'), now)).toBe(
      PaymentStatus.PENDING,
    );
    expect(computePaymentStatus(1000, 0, null, now)).toBe(PaymentStatus.PENDING);
  });
});

describe('generateReceiptNumber', () => {
  it('formats with year-month prefix', () => {
    const r = generateReceiptNumber(new Date('2026-07-15T00:00:00Z'), 'ab12cd');
    expect(r).toBe('RCPT-202607-AB12CD');
  });
});
