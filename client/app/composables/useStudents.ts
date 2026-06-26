import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

export interface StudentProfile {
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
  studentProfile?: StudentProfile | null;
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

export function useStudents(search?: MaybeRefOrGetter<string | undefined>) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['students', search],
    queryFn: () => {
      const term = toValue(search);
      const qs = term ? `?search=${encodeURIComponent(term)}&limit=100` : '?limit=100';
      return requestPaged<Student[]>(`/students${qs}`);
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

export function useStudentTestScores() {
  const { request } = useApi();
  const auth = useAuthStore();
  const studentId = computed(() => auth.user?.id ?? null);

  return useQuery({
    queryKey: ['student-test-scores', studentId],
    enabled: computed(() => auth.role === 'STUDENT' && !!studentId.value),
    queryFn: () => request<Score[]>(`/students/${studentId.value}/scores`),
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

  const updateProfile = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/students/${id}/profile`, { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student'] }),
  });

  const addScore = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/students/${id}/scores`, { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-scores'] });
      qc.invalidateQueries({ queryKey: ['student-test-scores'] });
    },
  });

  const deleteScore = useMutation({
    mutationFn: (scoreId: string) => request(`/students/scores/${scoreId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-scores'] });
      qc.invalidateQueries({ queryKey: ['student-test-scores'] });
    },
  });

  const addComment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/students/${id}/comments`, { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-comments'] }),
  });

  return { createStudent, updateProfile, addScore, deleteScore, addComment };
}
