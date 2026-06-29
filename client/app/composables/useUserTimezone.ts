/**
 * The timezone to render and interpret times in for the current viewer.
 * Priority: user's saved IANA tz -> browser tz -> UTC.
 */
export function useUserTimezone() {
  const auth = useAuthStore();
  return computed(() => {
    if (auth.user?.timezone) return auth.user.timezone;
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  });
}

/** Detect the browser's IANA timezone (for defaults at register/profile). */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
