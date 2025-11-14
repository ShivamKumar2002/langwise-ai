'use client';

import { ReactNode } from 'react';
import { useAuthHydration } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { Spinner } from './ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isHydrated, isAuthenticated } = useAuthHydration();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/');
  }

  return <>{children}</>;
}
