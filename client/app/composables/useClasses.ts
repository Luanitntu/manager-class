import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';

export interface ClassItem {
  id: string;
  name: string;
  description?: string | null;
  level?: string | null;
  color?: string | null;
  isActive: boolean;
  _count?: { enrollments: number; sessions: number; assistants?: number };
}

export function useClasses(search?: MaybeRefOrGetter<string | undefined>) {
  const { requestPaged } = useApi();

  return useQuery({
    queryKey: ['classes', search],
    queryFn: () => {
      const term = toValue(search);
      const qs = term ? `?search=${encodeURIComponent(term)}&limit=100` : '?limit=100';
      return requestPaged<ClassItem[]>(`/classes${qs}`);
    },
  });
}

export function useStudentClasses(search?: MaybeRefOrGetter<string | undefined>) {
  const { requestPaged } = useApi();

  return useQuery({
    queryKey: ['student-classes', search],
    queryFn: () => {
      const term = toValue(search);
      const qs = term ? `?search=${encodeURIComponent(term)}&limit=100` : '?limit=100';
      return requestPaged<ClassItem[]>(`/classes${qs}`);
    },
  });
}

export function useClassMutations() {
  const { request } = useApi();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['classes'] });

  const create = useMutation({
    mutationFn: (body: Partial<ClassItem>) =>
      request<ClassItem>('/classes', { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ClassItem> }) =>
      request<ClassItem>(`/classes/${id}`, { method: 'PATCH', body }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => request(`/classes/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
