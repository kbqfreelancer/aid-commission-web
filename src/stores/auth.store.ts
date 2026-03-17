'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setAuth: (user) => {
        set({ user });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      },
      isAuthenticated: () => !!get().user,
    }),
    { name: 'nhidrs-auth', partialize: (s) => ({ user: s.user }) }
  )
);
