import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSupabaseClient } from "./supabase/client";

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
  session: any | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, session: any) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      setAuth: (user: AuthUser, session: any) => {
        const normalizedUser: AuthUser = {
          ...user,
          hasLearningPlan: !!user.hasLearningPlan,
        };
        set({ user: normalizedUser, session, isAuthenticated: true });
      },
      clearAuth: () =>
        set({ user: null, session: null, isAuthenticated: false }),
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

// Helper to sync auth state with Supabase
export async function syncAuthState() {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    // Fetch user profile
    const { getCurrentUser } = await import("./auth-actions");
    const user = await getCurrentUser();

    if (user) {
      useAuth.getState().setAuth(user, session);
    } else {
      useAuth.getState().clearAuth();
    }
  } else {
    useAuth.getState().clearAuth();
  }
}
