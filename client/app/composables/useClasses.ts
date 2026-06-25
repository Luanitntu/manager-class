import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

export interface ClassStudentRef {
  id: string;
  fullName: string;
  avatarKey?: string | null;
}

export type LocationType = 'OFFLINE' | 'ONLINE';
export type MeetingProvider = 'GOOGLE_MEET' | 'ZOOM' | 'OTHER';

/** Location fields shared by anything that carries a class (cards, sessions…). */
export interface ClassLocationInfo {
  locationType?: LocationType | null;
  room?: string | null;
  meetingProvider?: MeetingProvider | null;
  meetingUrl?: string | null;
}

export interface ClassItem extends ClassLocationInfo {
  id: string;
  name: string;
  description?: string | null;
  level?: string | null;
  color?: string | null;
  isActive: boolean;
  totalSessions?: number | null;
  completedSessions?: number;
  tuitionFee?: number | null;
  students?: ClassStudentRef[];
  _count?: { enrollments: number; sessions: number; assistants?: number };
}

export interface EnrollmentTuition {
  id: string;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  dueDate?: string | null;
}

export interface ClassSession {
  id: string;
  startTime: string;
  endTime: string;
  lessonTopic?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  instructor?: { id: string; fullName: string } | null;
}

export interface ClassEnrollment {
  id: string;
  status: string;
  enrolledAt: string;
  student: { id: string; fullName: string; email: string; avatarUrl?: string | null; avatarKey?: string | null };
  tuition?: EnrollmentTuition | null;
}

export function useClasses(
  search?: MaybeRefOrGetter<string | undefined>,
  page?: MaybeRefOrGetter<number>,
  limit: MaybeRefOrGetter<number> = 10,
) {
  const { requestPaged } = useApi();

  return useQuery({
    queryKey: ['classes', search, page, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(toValue(limit) ?? 10),
        page: String(toValue(page) ?? 1),
      });
      const term = toValue(search);
      if (term) params.set('search', term);
      return requestPaged<ClassItem[]>(`/classes?${params.toString()}`);
    },
  });
}

export function useClassDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['class', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<ClassItem>(`/classes/${id.value}`),
  });
}

export function useClassSessions(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['class-sessions', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<ClassSession[]>(`/classes/${id.value}/sessions`),
  });
}

export function useClassStudents(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['class-students', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<ClassEnrollment[]>(`/classes/${id.value}/students`),
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

  // Enrolling/unenrolling changes the class roster AND the student's class list.
  const invalidateEnrollment = () => {
    qc.invalidateQueries({ queryKey: ['class-students'] });
    qc.invalidateQueries({ queryKey: ['class'] });
    qc.invalidateQueries({ queryKey: ['classes'] });
    qc.invalidateQueries({ queryKey: ['student'] });
    qc.invalidateQueries({ queryKey: ['students'] });
  };

  const enrollStudent = useMutation({
    mutationFn: ({ classId, studentId, note }: { classId: string; studentId: string; note?: string }) =>
      request(`/classes/${classId}/students`, { method: 'POST', body: { studentId, note } }),
    onSuccess: invalidateEnrollment,
  });

  const unenrollStudent = useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      request(`/classes/${classId}/students/${studentId}`, { method: 'DELETE' }),
    onSuccess: invalidateEnrollment,
  });

  return { create, update, remove, enrollStudent, unenrollStudent };
}
