import { Role } from '@prisma/client';

/**
 * Shape of the authenticated principal attached to each request by the
 * JWT strategy. `tenantId` is the resolved tenant key used for isolation:
 *   - TEACHER:    their own user id
 *   - ASSISTANT:  their owning teacher's id
 *   - STUDENT:    their owning teacher's id
 *   - SUPER_ADMIN: null (operates on the platform, not a tenant)
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  teacherId: string | null;
  tenantId: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  teacherId: string | null;
  tenantId: string | null;
}
