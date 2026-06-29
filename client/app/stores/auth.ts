import { defineStore } from 'pinia';

export type UserRole = 'SUPER_ADMIN' | 'TEACHER' | 'ASSISTANT' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  avatarKey?: string | null;
  timezone?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  // "Ghi nhớ đăng nhập": true → persist in localStorage (survives browser close);
  // false → sessionStorage (cleared when the browser/tab closes).
  rememberMe: boolean;
}

/**
 * Routes persistence to localStorage (remember) or sessionStorage (session-only)
 * based on the `rememberMe` flag inside the serialized state.
 */
const rememberAwareStorage = {
  getItem(key: string): string | null {
    if (import.meta.server) return null;
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    if (import.meta.server) return;
    let remember = true;
    try {
      remember = JSON.parse(value)?.rememberMe ?? true;
    } catch {
      /* keep default */
    }
    if (remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem(key: string): void {
    if (import.meta.server) return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    rememberMe: true,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken && !!state.user,
    role: (state): UserRole | null => state.user?.role ?? null,
  },
  actions: {
    setSession(payload: {
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
      rememberMe?: boolean;
    }) {
      if (payload.rememberMe !== undefined) this.rememberMe = payload.rememberMe;
      this.user = payload.user;
      this.accessToken = payload.accessToken;
      this.refreshToken = payload.refreshToken;
    },
    clear() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
    },
  },
  persist: { storage: rememberAwareStorage },
});
