import { createHash, randomBytes } from 'crypto';

/** Generates a high-entropy URL-safe token (returned to the user once). */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Deterministic hash stored in the DB so raw tokens are never persisted. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
