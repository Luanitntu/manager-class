import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type { ClassLocationInfo } from './useClasses';

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
  enrollments?: {
    class: { id: string; name: string; level?: string | null; isActive?: boolean } & ClassLocationInfo;
  }[];
  teacher?: { id: string; fullName: string } | null;
  createdAt?: string;
  _count?: { enrollments: number };
}

export interface StudentPayments {
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  tuitions: {
    id: string;
    classId: string;
    className: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    dueDate?: string | null;
    payments: {
      id: string;
      amount: number;
      paidAt: string;
      method?: string | null;
      note?: string | null;
      receiptNumber: string;
    }[];
  }[];
  records: {
    id: string;
    amount: number;
    paidAt: string;
    method?: string | null;
    note?: string | null;
    receiptNumber: string;
    className: string;
  }[];
}

export interface ActivityItem {
  type: 'JOINED_CLASS' | 'SCORE_ADDED' | 'COMMENT_ADDED' | 'PAYMENT_RECORDED';
  title: string;
  detail: string;
  date: string;
}

export interface Score {
  id: string;
  classId: string;
  type: string;
  label?: string | null;
  value: string;
  maxValue: string;
  class?: { id: string; name: string };
  scoredAt: string;
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
  limit: MaybeRefOrGetter<number> = 10,
) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['students', search, status, page, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(toValue(limit) ?? 10),
        page: String(toValue(page) ?? 1),
      });
      const term = toValue(search);
      const st = toValue(status);
      if (term) params.set('search', term);
      if (st) params.set('status', st);
      return requestPaged<Student[]>(ApiEndpoints.students.list(params));
    },
  });
}

export function useStudentDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<Student>(ApiEndpoints.students.detail(id.value!)),
  });
}

export function useStudentScores(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student-scores', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<Score[]>(ApiEndpoints.students.scores(id.value!)),
  });
}

export function useStudentTestScores() {
  const { request } = useApi();
  const auth = useAuthStore();
  const studentId = computed(() => auth.user?.id ?? null);

  return useQuery({
    queryKey: ['student-test-scores', studentId],
    enabled: computed(() => auth.role === 'STUDENT' && !!studentId.value),
    queryFn: () => request<Score[]>(ApiEndpoints.students.scores(studentId.value!)),
  });
}

export function useStudentPayments(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student-payments', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<StudentPayments>(ApiEndpoints.students.payments(id.value!)),
  });
}

export function useStudentActivity(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student-activity', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<ActivityItem[]>(ApiEndpoints.students.activity(id.value!)),
  });
}

export function useStudentComments(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['student-comments', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<StudentComment[]>(ApiEndpoints.students.comments(id.value!)),
  });
}

export function useStudentMutations() {
  const { request } = useApi();
  const qc = useQueryClient();

  const createStudent = useMutation({
    mutationFn: (body: { email: string; password: string; fullName: string; phone?: string }) =>
      request(ApiEndpoints.users.create, { method: 'POST', body: { ...body, role: 'STUDENT' } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StudyStatus }) =>
      request(ApiEndpoints.students.profile(id), { method: 'PATCH', body: { studyStatus: status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student'] });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id: string) => request(ApiEndpoints.users.detail(id), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });

  const updateProfile = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(ApiEndpoints.students.profile(id), { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student'] }),
  });

  const addScore = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(ApiEndpoints.students.scores(id), { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-scores'] });
      qc.invalidateQueries({ queryKey: ['student-test-scores'] });
    },
  });

  const deleteScore = useMutation({
    mutationFn: (scoreId: string) => request(ApiEndpoints.students.score(scoreId), { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-scores'] });
      qc.invalidateQueries({ queryKey: ['student-test-scores'] });
    },
  });

  const addComment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(ApiEndpoints.students.comments(id), { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-comments'] }),
  });

  return { createStudent, setStatus, deleteStudent, updateProfile, addScore, deleteScore, addComment };
}
