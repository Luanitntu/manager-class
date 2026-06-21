import { getDefaultRoute } from '~/utils/navigation';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const isPublic = PUBLIC_ROUTES.includes(to.path);

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }

  if (auth.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo(getDefaultRoute(auth.role));
  }
});
