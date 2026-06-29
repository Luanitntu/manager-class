const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/maintenance',
];

// Routes still reachable while maintenance is ON (so an admin can sign in).
const MAINTENANCE_ALLOWED = [
  '/',
  '/maintenance',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const config = useRuntimeConfig();

  // --- Maintenance gate (Super Admin bypasses) ---
  if (auth.role !== 'SUPER_ADMIN') {
    const maintenance = useState<boolean | null>('maintenanceMode', () => null);
    if (maintenance.value === null) {
      try {
        const res = await $fetch<{ data: { maintenanceMode?: boolean } }>('/settings', {
          baseURL: config.public.apiBase,
        });
        maintenance.value = !!res.data?.maintenanceMode;
      } catch {
        maintenance.value = false;
      }
    }
    if (maintenance.value && !MAINTENANCE_ALLOWED.includes(to.path)) {
      return navigateTo('/maintenance');
    }
    if (!maintenance.value && to.path === '/maintenance') {
      return navigateTo('/');
    }
  }

  // --- Auth gate ---
  const isPublic = PUBLIC_ROUTES.includes(to.path);
  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }
  if (auth.isAuthenticated && (to.path === '/' || to.path === '/login' || to.path === '/register')) {
    return navigateTo(roleHome(auth.role));
  }
});
