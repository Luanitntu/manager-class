import type { AuthUser } from '~/stores/auth';

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * Authentication actions. Components call these — never $fetch directly.
 */
export function useAuth() {
  const { request } = useApi();
  const auth = useAuthStore();

  async function login(identifier: string, password: string, rememberMe = true) {
    const res = await request<AuthResult>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });
    auth.setSession({ ...res, rememberMe });
    return res;
  }

  async function register(payload: {
    email: string;
    password: string;
    fullName: string;
  }) {
    const res = await request<AuthResult>('/auth/register', {
      method: 'POST',
      // Capture the browser timezone so the calendar is correct from day one.
      body: { ...payload, timezone: detectBrowserTimezone() },
    });
    auth.setSession(res);
    return res;
  }

  async function logout() {
    try {
      if (auth.refreshToken) {
        await request('/auth/logout', {
          method: 'POST',
          body: { refreshToken: auth.refreshToken },
        });
      }
    } finally {
      auth.clear();
      await navigateTo('/login');
    }
  }

  async function fetchMe() {
    const user = await request<AuthUser>('/auth/me');
    if (auth.accessToken) {
      auth.user = user;
    }
    return user;
  }

  function forgotPassword(email: string) {
    return request('/auth/forgot-password', { method: 'POST', body: { email } });
  }

  function resetPassword(token: string, password: string) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  }

  function verifyEmail(token: string) {
    return request('/auth/verify-email', { method: 'POST', body: { token } });
  }

  return { login, register, logout, fetchMe, forgotPassword, resetPassword, verifyEmail };
}
