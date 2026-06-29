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

interface TuitionFilters {
  page?: MaybeRefOrGetter<number>;
  status?: MaybeRefOrGetter<string | undefined>;
  classId?: MaybeRefOrGetter<string | undefined>;
}

export function useTuitions(f: TuitionFilters = {}, limit: MaybeRefOrGetter<number> = 10) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['tuitions', f.page, f.status, f.classId, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(toValue(limit) ?? 10),
        page: String(toValue(f.page) ?? 1),
      });
      const status = toValue(f.status);
      const classId = toValue(f.classId);
      if (status) params.set('status', status);
      if (classId) params.set('classId', classId);
      return requestPaged<Tuition[]>(ApiEndpoints.payments.tuitions(params));
    },
  });
}

export function useTuitionDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['tuition', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<TuitionDetail>(ApiEndpoints.payments.tuition(id.value!)),
  });
}

export function usePaymentMutations() {
  const { request } = useApi();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tuitions'] });
    qc.invalidateQueries({ queryKey: ['tuition'] });
    // Student detail (Payments tab, debt badge, Activity) is derived from tuitions.
    qc.invalidateQueries({ queryKey: ['student-payments'] });
    qc.invalidateQueries({ queryKey: ['student-activity'] });
    qc.invalidateQueries({ queryKey: ['students'] });
    qc.invalidateQueries({ queryKey: ['class-students'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createTuition = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      request<Tuition>(ApiEndpoints.payments.tuitions(), { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const updateTuition = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request<Tuition>(ApiEndpoints.payments.tuition(id), { method: 'PATCH', body }),
    onSuccess: invalidate,
  });

  const recordPayment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(ApiEndpoints.payments.tuitionPayments(id), { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const deletePayment = useMutation({
    mutationFn: ({ tuitionId, paymentId }: { tuitionId: string; paymentId: string }) =>
      request(ApiEndpoints.payments.tuitionPayment(tuitionId, paymentId), { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const deleteTuition = useMutation({
    mutationFn: (id: string) => request(ApiEndpoints.payments.tuition(id), { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const sendReminder = useMutation({
    mutationFn: (id: string) =>
      request(ApiEndpoints.payments.remind(id), { method: 'POST' }),
  });

  return { createTuition, updateTuition, recordPayment, deletePayment, deleteTuition, sendReminder };
}

export const statusColor: Record<string, string> = {
  PAID: 'success',
  PARTIALLY_PAID: 'info',
  PENDING: 'warning',
  OVERDUE: 'error',
};

// Fixed payment-method options — shared everywhere a payment is recorded so
// reports/exports can aggregate by method reliably.
export const PAYMENT_METHODS = ['cash', 'transfer', 'card'] as const;
