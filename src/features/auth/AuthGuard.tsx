import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth.store';
import { LoadingState } from '@/shared/components/LoadingState';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <LoadingState
        title="Opening EngineerOS"
        description="Restoring your professional learning workspace."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
