import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useAuthStore } from './auth.store';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    void initialize();
    const safetyTimer = window.setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.isLoading && !state.isAuthenticated) {
        useAuthStore.setState({ isLoading: false });
      }
    }, 5000);
    return () => window.clearTimeout(safetyTimer);
  }, [initialize]);

  if (isLoading) {
    return (
      <LoadingState
        title="Opening EngVox"
        description="Restoring your professional learning workspace."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
