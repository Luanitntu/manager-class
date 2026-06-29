import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

export interface ActiveSession {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export function useActiveSessions() {
  const { request } = useApi();
  const auth = useAuthStore();
  return useQuery({
    queryKey: ['my-sessions'],
    queryFn: () =>
      request<ActiveSession[]>('/users/me/sessions', {
        headers: auth.refreshToken ? { 'x-refresh-token': auth.refreshToken } : {},
      }),
  });
}

export function useProfileMutations() {
  const { request } = useApi();
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const qc = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return $fetch<{ data: { avatarKey: string } }>('/users/me/avatar', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: fd,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      });
    },
  });

  const changePassword = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      request('/users/me/change-password', { method: 'POST', body }),
  });

  const revokeSession = useMutation({
    mutationFn: (id: string) => request(`/users/me/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-sessions'] }),
  });

  return { uploadAvatar, changePassword, revokeSession };
}

/** Builds an avatar image URL for a user id (cache-busted by version). */
export function avatarUrl(userId: string, version = 0): string {
  const config = useRuntimeConfig();
  return `${config.public.apiBase}/users/${userId}/avatar?v=${version}`;
}

/**
 * Returns a helper that maps a user-like object to its avatar URL (or null when
 * no avatar). Use in lists: `const avatar = useAvatar(); avatar(u)`.
 */
export function useAvatar() {
  const config = useRuntimeConfig();
  return (u?: { id: string; avatarKey?: string | null } | null): string | null =>
    u?.avatarKey ? `${config.public.apiBase}/users/${u.id}/avatar` : null;
}
