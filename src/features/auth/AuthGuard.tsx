import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useAuthStore } from './auth.store';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, initialize, currentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser && !isAuthenticated) {
      void initialize();
    }
  }, [initialize, currentUser, isAuthenticated]);

  if (isLoading && !currentUser && !isAuthenticated) {
    return (
      <LoadingState
        title="Opening EngVox"
        description="Restoring your professional learning workspace."
      />
    );
  }

  if (!isAuthenticated && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
