import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

export interface Branding {
  brandName?: string | null;
  address?: string | null;
  phone?: string | null;
  logoKey?: string | null;
}

export function useBranding() {
  const { request } = useApi();
  return useQuery({
    queryKey: ['branding'],
    queryFn: () => request<Branding>(ApiEndpoints.users.meBranding),
  });
}

export function brandLogoUrl(userId: string, version = 0): string {
  const config = useRuntimeConfig();
  return `${config.public.apiBase}${ApiEndpoints.users.brandLogo(userId)}?v=${version}`;
}

export function useBrandingMutations() {
  const { request } = useApi();
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['branding'] });

  const update = useMutation({
    mutationFn: (body: Partial<Branding>) =>
      request<Branding>(ApiEndpoints.users.meBranding, { method: 'PATCH', body }),
    onSuccess: invalidate,
  });

  const uploadLogo = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return $fetch(ApiEndpoints.users.meBrandLogo, {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: fd,
        headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
      });
    },
    onSuccess: invalidate,
  });

  return { update, uploadLogo };
}
