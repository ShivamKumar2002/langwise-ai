'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { syncAuthState } from "@/lib/auth-context";
import { createSupabaseClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Hydrate auth store on mount
    useAuth.persist.rehydrate();

    // Sync auth state with Supabase
    syncAuthState();

    // Listen for auth state changes
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event);

      if (event === "SIGNED_IN" && session?.user) {
        const { getCurrentUser } = await import("@/lib/auth-actions");
        const user = await getCurrentUser();
        if (user) {
          useAuth.getState().setAuth(user, session);
        }
      } else if (event === "SIGNED_OUT") {
        useAuth.getState().clearAuth();
      } else if (event === "TOKEN_REFRESHED" && session) {
        const { getCurrentUser } = await import("@/lib/auth-actions");
        const user = await getCurrentUser();
        if (user) {
          useAuth.getState().setAuth(user, session);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
