import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

export interface Tuition {
  id: string;
  totalAmount: string;
  paidAmount: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  dueDate?: string | null;
  notes?: string | null;
  student?: { id: string; fullName: string; email: string };
  class?: { id: string; name: string };
}

export interface PaymentRecord {
  id: string;
  amount: string;
  method?: string | null;
  paidAt: string;
  receiptNumber: string;
  note?: string | null;
}

export interface TuitionDetail extends Tuition {
  payments: PaymentRecord[];
}

export function useTuitions(options: { enabled?: MaybeRefOrGetter<boolean> } = {}) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['tuitions'],
    enabled: computed(() => toValue(options.enabled) !== false),
    queryFn: () => requestPaged<Tuition[]>('/payments/tuitions?limit=100'),
  });
}

export function useTuitionDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['tuition', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<TuitionDetail>(`/payments/tuitions/${id.value}`),
  });
}

export function usePaymentMutations() {
  const { request } = useApi();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tuitions'] });
    qc.invalidateQueries({ queryKey: ['tuition'] });
  };

  const createTuition = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      request<Tuition>('/payments/tuitions', { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const recordPayment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/payments/tuitions/${id}/payments`, { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const sendReminder = useMutation({
    mutationFn: (id: string) =>
      request(`/payments/tuitions/${id}/remind`, { method: 'POST' }),
  });

  return { createTuition, recordPayment, sendReminder };
}

export const statusColor: Record<string, string> = {
  PAID: 'success',
  PARTIALLY_PAID: 'info',
  PENDING: 'warning',
  OVERDUE: 'error',
};
