import type { UserRole } from '~/stores/auth';

export function roleHome(role?: UserRole | null) {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'TEACHER':
    case 'ASSISTANT':
    case 'STUDENT':
      return '/dashboard';
    default:
      return '/login';
  }
}
