import { useAuth } from '@clerk/clerk-react';

import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useAuthStore } from './auth.store';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Clerk-aware guard. Rendered only inside <ClerkProvider> (Clerk is the single
 * auth of record), so the unconditional useAuth() call below is always safe.
 * The app's own zustand store is seeded by <ClerkBridge> when a Clerk session
 * is active, so the guard must not redirect to /login in the meantime.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, currentUser } = useAuthStore();
  const location = useLocation();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const hasClerkSession = clerkLoaded && clerkSignedIn;

  const hasSession = isAuthenticated || Boolean(currentUser) || hasClerkSession;

  // While Clerk is still loading we cannot know whether the user is signed
  // in. Redirecting to /login in this window races Clerk's session restore:
  // /login sees the signed-in session and bounces back to /dashboard, which
  // bounces to /login again — an infinite reload loop. Wait for Clerk before
  // ever deciding the user is signed out.
  if (!clerkLoaded) {
    return (
      <LoadingState
        title="Opening EngVox"
        description="Restoring your professional learning workspace."
      />
    );
  }

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

  return <>{children}</>;
};

export default AuthGuard;
