/**
 * Pulls the human-readable message out of our standard error envelope
 * ({ success:false, message, errors }) surfaced by ofetch's FetchError.
 */
export function extractApiError(err: unknown): string | null {
  if (typeof err === 'object' && err !== null) {
    const e = err as { data?: { message?: string }; message?: string };
    if (e.data?.message) return e.data.message;
    if (e.message) return e.message;
  }
  return null;
}
