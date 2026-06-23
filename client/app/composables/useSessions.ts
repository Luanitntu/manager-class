import { useMutation, useQueryClient } from '@tanstack/vue-query';

export interface InstructorRef {
  id: string;
  fullName: string;
  email: string;
}

export interface TeachingSession {
  id: string;
  classId: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  lessonTopic?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  class: { id: string; name: string; color?: string | null; level?: string | null };
  instructor?: InstructorRef | null;
}

export interface CreateSessionPayload {
  classId: string;
  startTime: string;
  endTime: string;
  lessonTopic?: string;
  instructorId?: string;
}

export interface BulkSessionPayload {
  classId: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  lessonTopic?: string;
  instructorId?: string;
  timeZone?: string;
  tzOffset?: number;
}

/** Fetches sessions overlapping [from, to] — the calendar's primary feed. */
export function fetchSessionRange(from: string, to: string) {
  const { request } = useApi();
  return request<TeachingSession[]>(
    `/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
}

export function useSessionMutations() {
  const { request } = useApi();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['sessions'] });
    // Session changes (esp. status → COMPLETED) affect class progress.
    qc.invalidateQueries({ queryKey: ['classes'] });
    qc.invalidateQueries({ queryKey: ['class-sessions'] });
    qc.invalidateQueries({ queryKey: ['class'] });
  };

  const create = useMutation({
    mutationFn: (body: CreateSessionPayload) =>
      request<TeachingSession>('/sessions', { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const bulkCreate = useMutation({
    mutationFn: (body: BulkSessionPayload) =>
      request<{ recurrenceGroupId: string; count: number }>('/sessions/bulk', {
        method: 'POST',
        body,
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateSessionPayload> & { status?: string } }) =>
      request<TeachingSession>(`/sessions/${id}`, { method: 'PATCH', body }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => request(`/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return { create, bulkCreate, update, remove };
}
