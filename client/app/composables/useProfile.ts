import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

export interface ActiveSession {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export interface UserProfile {
  fullName: string;
  phone?: string | null;
  timezone?: string | null;
  avatarKey?: string | null;
}

export function useMyProfile() {
  const { request } = useApi();
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => request<UserProfile>(ApiEndpoints.users.meProfile),
  });
}

export function useActiveSessions() {
  const { request } = useApi();
  const auth = useAuthStore();
  return useQuery({
    queryKey: ['my-sessions'],
    queryFn: () =>
      request<ActiveSession[]>(ApiEndpoints.users.meSessions, {
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
      return $fetch<{ data: { avatarKey: string } }>(ApiEndpoints.users.meAvatar, {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: fd,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      });
    },
  });

  const changePassword = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      request(ApiEndpoints.users.changePassword, { method: 'POST', body }),
  });

  const updateProfile = useMutation({
    mutationFn: (body: Partial<UserProfile>) =>
      request<UserProfile>(ApiEndpoints.users.meProfile, { method: 'PATCH', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
  });

  const revokeSession = useMutation({
    mutationFn: (id: string) => request(ApiEndpoints.users.meSession(id), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-sessions'] }),
  });

  return { uploadAvatar, changePassword, updateProfile, revokeSession };
}

/** Builds an avatar image URL for a user id (cache-busted by version). */
export function avatarUrl(userId: string, version = 0): string {
  const config = useRuntimeConfig();
  return `${config.public.apiBase}${ApiEndpoints.users.avatar(userId)}?v=${version}`;
}

/**
 * Returns a helper that maps a user-like object to its avatar URL (or null when
 * no avatar). Use in lists: `const avatar = useAvatar(); avatar(u)`.
 */
export function useAvatar() {
  const config = useRuntimeConfig();
  return (u?: { id: string; avatarKey?: string | null } | null): string | null =>
    u?.avatarKey ? `${config.public.apiBase}${ApiEndpoints.users.avatar(u.id)}` : null;
}
