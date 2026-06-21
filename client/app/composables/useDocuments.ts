import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  type: 'PDF' | 'MP3' | 'LINK';
  category?: string | null;
  url?: string | null;
  fileKey?: string | null;
  _count?: { assignments: number };
}

export function useDocuments(
  category?: MaybeRefOrGetter<string | undefined>,
  options: { enabled?: MaybeRefOrGetter<boolean> } = {},
) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['documents', category],
    enabled: computed(() => toValue(options.enabled) !== false),
    queryFn: () => {
      const cat = toValue(category);
      const qs = cat ? `?category=${encodeURIComponent(cat)}&limit=100` : '?limit=100';
      return requestPaged<DocumentItem[]>(`/documents${qs}`);
    },
  });
}

export function useDocumentMutations() {
  const { request } = useApi();
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['documents'] });

  const createLink = useMutation({
    mutationFn: (body: { title: string; url: string; category?: string; description?: string }) =>
      request<DocumentItem>('/documents', { method: 'POST', body: { ...body, type: 'LINK' } }),
    onSuccess: invalidate,
  });

  const upload = useMutation({
    mutationFn: async (payload: { file: File; title: string; category?: string }) => {
      const fd = new FormData();
      fd.append('file', payload.file);
      fd.append('title', payload.title);
      if (payload.category) fd.append('category', payload.category);
      // FormData must bypass JSON serialization; call $fetch directly.
      return $fetch('/documents/upload', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: fd,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      });
    },
    onSuccess: invalidate,
  });

  const assign = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/documents/${id}/assignments`, { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => request(`/documents/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { createLink, upload, assign, remove };
}
