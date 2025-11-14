'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useAuthHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useAuth();

  useEffect(() => {
    // Hydrate the store from localStorage
    useAuth.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  return { isHydrated, ...store };
}
