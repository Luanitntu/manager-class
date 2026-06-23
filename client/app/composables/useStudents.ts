import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

export type StudyStatus = 'STUDYING' | 'RESERVED' | 'GRADUATED';

export interface StudentProfile {
  code?: string | null;
  studyStatus?: StudyStatus;
  address?: string | null;
  dateOfBirth?: string | null;
  occupation?: string | null;
  educationLevel?: string | null;
  learningGoal?: string | null;
}

export interface Student {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarKey?: string | null;
  studentProfile?: StudentProfile | null;
  enrollments?: { class: { id: string; name: string } }[];
  _count?: { enrollments: number };
}

export interface Score {
  id: string;
  classId: string;
  type: string;
  label?: string | null;
  value: string;
  maxValue: string;
  class?: { id: string; name: string };
  createdAt: string;
}

export interface StudentComment {
  id: string;
  category?: string | null;
  content: string;
  author?: { id: string; fullName: string };
  createdAt: string;
}

export function useStudents(
  search?: MaybeRefOrGetter<string | undefined>,
  status?: MaybeRefOrGetter<string | undefined>,
  page?: MaybeRefOrGetter<number>,
  limit = 10,
) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['students', search, status, page, limit],
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(limit), page: String(toValue(page) ?? 1) });
      const term = toValue(search);
      const st = toValue(status);
      if (term) params.set('search', term);
      if (st) params.set('status', st);
      return requestPaged<Student[]>(`/students?${params.toString()}`);
    },
  });
}

export function useStudentDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<Student>(`/students/${id.value}`),
  });
}

export function useStudentScores(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student-scores', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<Score[]>(`/students/${id.value}/scores`),
  });
}

export function useStudentComments(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student-comments', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<StudentComment[]>(`/students/${id.value}/comments`),
  });
}

export function useStudentMutations() {
  const { request } = useApi();
  const qc = useQueryClient();

  const createStudent = useMutation({
    mutationFn: (body: { email: string; password: string; fullName: string; phone?: string }) =>
      request('/users', { method: 'POST', body: { ...body, role: 'STUDENT' } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StudyStatus }) =>
      request(`/students/${id}/profile`, { method: 'PATCH', body: { studyStatus: status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student'] });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });

  const updateProfile = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/students/${id}/profile`, { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student'] }),
  });

  const addScore = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/students/${id}/scores`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-scores'] }),
  });

  const deleteScore = useMutation({
    mutationFn: (scoreId: string) => request(`/students/scores/${scoreId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-scores'] }),
  });

  const addComment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/students/${id}/comments`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-comments'] }),
  });

  return { createStudent, setStatus, deleteStudent, updateProfile, addScore, deleteScore, addComment };
}
