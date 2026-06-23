import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';

export interface AdminUser {
  id: string;
  email: string;
  username?: string | null;
  fullName: string;
  role: 'SUPER_ADMIN' | 'TEACHER' | 'ASSISTANT' | 'STUDENT';
  status: 'PENDING' | 'ACTIVE' | 'LOCKED';
  emailVerified: boolean;
  createdAt: string;
  avatarKey?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  loginCount?: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  createdAt: string;
  ipAddress?: string | null;
  actor?: { id: string; fullName: string } | null;
  newValue?: unknown;
}

interface UsersFilters {
  role?: MaybeRefOrGetter<string | undefined>;
  search?: MaybeRefOrGetter<string | undefined>;
  status?: MaybeRefOrGetter<string | undefined>;
  page?: MaybeRefOrGetter<number>;
}

export function useAdminUsers(f: UsersFilters = {}) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['admin-users', f.role, f.search, f.status, f.page],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '20', page: String(toValue(f.page) ?? 1) });
      const r = toValue(f.role);
      const s = toValue(f.search);
      const st = toValue(f.status);
      if (r) params.set('role', r);
      if (s) params.set('search', s);
      if (st) params.set('status', st);
      return requestPaged<AdminUser[]>(`/users/admin/all?${params.toString()}`);
    },
  });
}

export function useAdminUserMutations() {
  const { request } = useApi();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      request('/users/admin', { method: 'POST', body }),
    onSuccess: invalidate,
  });

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      request(`/users/admin/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['admin-user'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => request(`/users/admin/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const lock = useMutation({
    mutationFn: (id: string) => request(`/users/${id}/lock`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });
  const unlock = useMutation({
    mutationFn: (id: string) => request(`/users/${id}/unlock`, { method: 'PATCH' }),
    onSuccess: invalidate,
  });
  const resetPassword = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      request(`/users/${id}/reset-password`, { method: 'POST', body: { password } }),
  });

  return { create, updateUser, deleteUser, lock, unlock, resetPassword };
}

export interface AdminUserDetail extends AdminUser {
  subscription: { plan: string; startedAt: string; expiresAt: string | null };
  statusHistory: AuditEntry[];
  stats: {
    classes: number;
    students: number;
    assistants: number;
    revenueCollected: number;
    revenueOutstanding: number;
  } | null;
}

export function useAdminUserDetail(id: Ref<string | null>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['admin-user', id],
    enabled: computed(() => !!id.value),
    queryFn: () => request<AdminUserDetail>(`/users/admin/${id.value}`),
  });
}

export interface SystemSettings {
  platformName: string;
  supportEmail?: string | null;
  allowRegistration: boolean;
  defaultTimezone: string;
  maintenanceMode?: boolean;
  storageDriver?: string;
  healthRefreshSeconds?: number;
  announcement?: string | null;
  announcementActive?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  faviconKey?: string | null;
  // integrations (only present on the admin endpoint)
  resendApiKey?: string | null;
  emailFrom?: string | null;
  r2AccountId?: string | null;
  r2AccessKeyId?: string | null;
  r2SecretAccessKey?: string | null;
  r2Bucket?: string | null;
  r2PublicUrl?: string | null;
}

/** Full settings incl. integration credentials (Super Admin). */
export function useAdminSettings() {
  const { request } = useApi();
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => request<SystemSettings>('/settings/admin'),
  });
}

export function useSettingsMutation() {
  const { request } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SystemSettings>) =>
      request<SystemSettings>('/settings', { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}

export function useFaviconUpload() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return $fetch('/settings/favicon', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: fd,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}

interface HealthCheck {
  ok: boolean;
  latencyMs?: number;
  message?: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  env?: string;
  versions: { node: string; nestjs: string; prisma: string };
  database: HealthCheck & { provider: string };
  redis: HealthCheck;
  system: {
    platform: string;
    arch: string;
    hostname: string;
    cpuModel: string;
    cpuCores: number;
    loadAvg1m: number;
    memTotalMb: number;
    memUsedMb: number;
    memUsedPct: number;
  };
  process: { rssMb: number; heapUsedMb: number };
}

export function useSystemHealth(intervalMs: Ref<number>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => request<SystemHealth>('/health/system'),
    refetchInterval: () => intervalMs.value, // configurable in Settings
  });
}

export interface QueueStats {
  enabled: boolean;
  counts?: Record<string, number>;
}

export function useQueueStats(intervalMs: Ref<number>) {
  const { request } = useApi();
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => request<QueueStats>('/health/queue'),
    refetchInterval: () => intervalMs.value,
  });
}

export function useTestEmail() {
  const { request } = useApi();
  return useMutation({
    mutationFn: (to?: string) =>
      request<{ sent: boolean; to: string }>('/settings/test-email', {
        method: 'POST',
        body: { to },
      }),
  });
}
