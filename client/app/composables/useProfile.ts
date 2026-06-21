import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

export interface UserProfile {
  fullName: string;
  phone?: string | null;
}

export function useProfile() {
  const { request } = useApi();

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => request<UserProfile>('/users/me/profile'),
  });
}

export function useProfileMutations() {
  const { request } = useApi();
  const qc = useQueryClient();
  const auth = useAuthStore();

  const update = useMutation({
    mutationFn: (body: Partial<UserProfile>) =>
      request<UserProfile>('/users/me/profile', {
        method: 'PATCH',
        body,
      }),
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data);
      if (auth.user) {
        auth.user.fullName = data.fullName;
      }
    },
  });

  return { update };
}
