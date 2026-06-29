export interface PublicSettings {
  platformName?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  faviconKey?: string | null;
  announcement?: string | null;
  announcementActive?: boolean;
}

/**
 * Public branding / SEO / announcement settings (no auth required).
 * Shares the `public-settings` useAsyncData cache with app.vue so the
 * endpoint is only hit once per navigation.
 */
export function usePublicSettings() {
  const config = useRuntimeConfig();
  return useAsyncData('public-settings', () =>
    $fetch<{ data: PublicSettings }>(ApiEndpoints.settings.public, { baseURL: config.public.apiBase })
      .then((r) => r.data)
      .catch(() => null),
  );
}
