import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

export interface AssistantProfile {
  salaryMethod: 'PER_SESSION' | 'PER_HOUR' | 'PER_CLASS';
  salaryRate: string;
  bio?: string | null;
}

export interface Assistant {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarKey?: string | null;
  assistantProfile?: AssistantProfile | null;
  _count?: { classAssignments: number };
  classAssignments?: { class: { id: string; name: string; level?: string | null } }[];
}

export interface SalaryClassBreakdown {
  classId: string;
  className: string;
  sessionCount: number;
  hours: number;
  amount: number;
}

export interface SalaryResult {
  method: string;
  rate: number;
  totalSessions: number;
  totalHours: number;
  totalClasses: number;
  totalAmount: number;
  byClass: SalaryClassBreakdown[];
}

export function useAssistants(search?: MaybeRefOrGetter<string | undefined>) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['assistants', search],
    queryFn: () => {
      const term = toValue(search);
      const qs = term ? `?search=${encodeURIComponent(term)}&limit=100` : '?limit=100';
      return requestPaged<Assistant[]>(`/assistants${qs}`);
    },
  });
}

export function useAssistantDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['assistant', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<Assistant>(`/assistants/${id.value}`),
  });
}

export function useAssistantSalary(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['assistant-salary', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<SalaryResult>(`/assistants/${id.value}/salary`),
  });
}

export interface AssistantSession {
  id: string;
  startTime: string;
  endTime: string;
  lessonTopic?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  class: { id: string; name: string; level?: string | null; color?: string | null };
}

export function useAssistantSessions(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['assistant-sessions', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<AssistantSession[]>(`/assistants/${id.value}/sessions`),
  });
}

export function useAssistantMutations() {
  const { request } = useApi();
  const qc = useQueryClient();

  const createAssistant = useMutation({
    mutationFn: (body: { email: string; password: string; fullName: string; phone?: string }) =>
      request('/users', { method: 'POST', body: { ...body, role: 'ASSISTANT' } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assistants'] }),
  });

  const updateSalary = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/assistants/${id}/salary`, { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant'] });
      qc.invalidateQueries({ queryKey: ['assistant-salary'] });
    },
  });

  return { createAssistant, updateSalary };
}
