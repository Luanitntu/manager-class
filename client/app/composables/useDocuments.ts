import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';

export interface DocAssignment {
  id: string;
  targetType: 'CLASS' | 'STUDENT';
  classId?: string | null;
  class?: { id: string; name: string } | null;
  studentId?: string | null;
  student?: { id: string; fullName: string } | null;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  type: 'PDF' | 'MP3' | 'LINK';
  category?: string | null;
  url?: string | null;
  fileKey?: string | null;
  fileSize?: number | null;
  createdAt?: string;
  assignments?: DocAssignment[];
  _count?: { assignments: number };
}

interface DocFilters {
  category?: MaybeRefOrGetter<string | undefined>;
  scope?: MaybeRefOrGetter<string | undefined>;
  classId?: MaybeRefOrGetter<string | undefined>;
  search?: MaybeRefOrGetter<string | undefined>;
  page?: MaybeRefOrGetter<number>;
}

function isDocFilters(value: unknown): value is DocFilters {
  return typeof value === 'object' && value !== null && !('value' in value);
}

export function useDocuments(
  filters: DocFilters | MaybeRefOrGetter<string | undefined> = {},
  limit: MaybeRefOrGetter<number> = 12,
) {
  const f = isDocFilters(filters) ? filters : { category: filters };
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['documents', f.category, f.scope, f.classId, f.search, f.page, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(toValue(limit) ?? 12),
        page: String(toValue(f.page) ?? 1),
      });
      const cat = toValue(f.category);
      const scope = toValue(f.scope);
      const classId = toValue(f.classId);
      const search = toValue(f.search);
      if (cat) params.set('category', cat);
      if (scope) params.set('scope', scope);
      if (classId) params.set('classId', classId);
      if (search) params.set('search', search);
      return requestPaged<DocumentItem[]>(ApiEndpoints.documents.list(params));
    },
  });
}

export function useDocumentCategories() {
  const { request } = useApi();
  return useQuery({
    queryKey: ['document-categories'],
    queryFn: () => request<string[]>(ApiEndpoints.documents.categories),
  });
}

/** Opens a LINK in a new tab, or downloads a file with the auth token. */
export function useDocumentDownload() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  return async (doc: DocumentItem) => {
    if (doc.type === 'LINK') {
      if (doc.url) window.open(doc.url, '_blank', 'noopener');
      return;
    }
    const blob = await $fetch<Blob>(ApiEndpoints.documents.download(doc.id), {
      baseURL: config.public.apiBase,
      headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      responseType: 'blob',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.title;
    a.click();
    URL.revokeObjectURL(url);
  };
}

export function useDocumentMutations() {
  const { request } = useApi();
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['documents'] });
    qc.invalidateQueries({ queryKey: ['document-categories'] });
  };

  const createLink = useMutation({
    mutationFn: (body: { title: string; url: string; category?: string; description?: string }) =>
      request<DocumentItem>(ApiEndpoints.documents.create, { method: 'POST', body: { ...body, type: 'LINK' } }),
    onSuccess: invalidate,
  });

  const upload = useMutation({
    mutationFn: async (payload: { file: File; title: string; category?: string }) => {
      const fd = new FormData();
      fd.append('file', payload.file);
      fd.append('title', payload.title);
      if (payload.category) fd.append('category', payload.category);
      return $fetch(ApiEndpoints.documents.upload, {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: fd,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      });
    },
    onSuccess: invalidate,
  });

  const assign = useMutation({
    mutationFn: (payload:
      | { id: string; classId: string }
      | {
          id: string;
          body:
            | { targetType: 'CLASS'; classId: string }
            | { targetType: 'STUDENT'; studentId: string };
        }) =>
      request(ApiEndpoints.documents.assignments(payload.id), {
        method: 'POST',
        body:
          'body' in payload
            ? payload.body
            : { targetType: 'CLASS', classId: payload.classId },
      }),
    onSuccess: invalidate,
  });

  const unassign = useMutation({
    mutationFn: ({ id, assignmentId }: { id: string; assignmentId: string }) =>
      request(ApiEndpoints.documents.assignment(id, assignmentId), { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => request(ApiEndpoints.documents.detail(id), { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { createLink, upload, assign, unassign, remove };
}
