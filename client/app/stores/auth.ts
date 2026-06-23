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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
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
    }) {
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
  persist: true,
});
