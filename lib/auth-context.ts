import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  userId: string;
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
  hasLearningPlan: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user: AuthUser, token: string) => {
        const normalizedUser: AuthUser = {
          ...user,
          hasLearningPlan: !!user.hasLearningPlan,
        };
        set({ user: normalizedUser, token, isAuthenticated: true });
      },
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user: AuthUser) =>
        set({
          user: {
            ...user,
            hasLearningPlan: !!user.hasLearningPlan,
          },
        }),
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    }
  )
);
