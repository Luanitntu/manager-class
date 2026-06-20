import type { FetchOptions } from 'ofetch';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Central HTTP client. Components must NOT call APIs directly — they use
 * feature composables (e.g. useClasses) which build on this.
 *
 * - Prefixes the configured API base URL.
 * - Attaches the access token from the auth store.
 * - Unwraps the standard { success, data } envelope.
 */
export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  async function request<T>(
    path: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (auth.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    const res = await $fetch<ApiSuccess<T>>(path, {
      baseURL: config.public.apiBase,
      ...options,
      headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return res.data;
  }

  /** Variant that returns the full envelope, exposing pagination meta. */
  async function requestPaged<T>(
    path: string,
    options: FetchOptions = {},
  ): Promise<ApiSuccess<T>> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (auth.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    return await $fetch<ApiSuccess<T>>(path, {
      baseURL: config.public.apiBase,
      ...options,
      headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return { request, requestPaged };
}
