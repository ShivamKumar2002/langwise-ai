'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Hydrate auth store on mount
    useAuth.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
