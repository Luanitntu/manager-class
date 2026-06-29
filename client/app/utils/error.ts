interface FetchLikeError {
  statusCode?: number;
  status?: number;
  data?: { message?: string | string[]; errors?: unknown[] };
  message?: string;
}

const KNOWN_STATUS = [400, 401, 403, 404, 409, 413, 422, 429, 500];

/**
 * Turns any thrown request error into a friendly, localized message.
 * Priority: explicit server message -> status-based i18n -> network -> generic.
 * Uses the active i18n locale via the Nuxt app instance.
 */
export function extractApiError(err: unknown): string {
  const { $i18n } = useNuxtApp();
  const t = (key: string) => $i18n.t(key);

  if (typeof err !== 'object' || err === null) return t('errors.generic');

  const e = err as FetchLikeError;
  const status = e.statusCode ?? e.status;

  // 1) Prefer the server's own message (validation, business rules).
  const serverMsg = e.data?.message;
  if (Array.isArray(serverMsg) && serverMsg.length) return String(serverMsg[0]);
  if (typeof serverMsg === 'string' && serverMsg.trim()) return serverMsg;

  // 2) No status -> request never reached the server.
  const raw = e.message ?? '';
  if (!status && /failed to fetch|fetch failed|network|load failed|<no response>/i.test(raw)) {
    return t('errors.network');
  }

  // 3) Map by HTTP status.
  if (status && KNOWN_STATUS.includes(status)) return t(`errors.${status}`);
  if (status && status >= 500) return t('errors.500');

  // 4) Fallback.
  return raw || t('errors.generic');
}
