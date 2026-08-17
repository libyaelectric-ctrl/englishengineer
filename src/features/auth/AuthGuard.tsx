import { useAuth } from '@clerk/clerk-react';

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
  // Clerk runs alongside the app's own auth store. When a Clerk session is
  // active the store is seeded by <ClerkBridge> a moment later, so the guard
  // must not redirect to /login in the meantime.
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const hasClerkSession = clerkLoaded && clerkSignedIn;

  useEffect(() => {
    if (!currentUser && !isAuthenticated && !hasClerkSession) {
      void initialize();
    }
  }, [initialize, currentUser, isAuthenticated, hasClerkSession]);

  const hasSession = isAuthenticated || Boolean(currentUser) || hasClerkSession;

  if (!hasSession) {
    if (isLoading) {
      return (
        <LoadingState
          title="Opening EngVox"
          description="Restoring your professional learning workspace."
        />
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Clerk session is active but the bridge has not seeded the store yet.
  if (hasClerkSession && !currentUser && !isAuthenticated) {
    return (
      <LoadingState
        title="Opening EngVox"
        description="Restoring your professional learning workspace."
      />
    );
  }

  return <>{children}</>;
};
