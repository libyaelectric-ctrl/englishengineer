import { useAuth } from '@clerk/clerk-react';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useAuthStore } from './auth.store';
import { CLERK_PUBLISHABLE_KEY } from './clerk.config';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Clerk-aware guard. Rendered only when a Clerk publishable key is configured
 * (i.e. <ClerkProvider> is mounted) so the unconditional useAuth() call below
 * can never throw "no ClerkProvider detected".
 */
const ClerkAuthGuard = ({ children }: AuthGuardProps) => {
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

/**
 * Legacy guard used when no Clerk key is configured: the whole app runs on the
 * Supabase/local adapter, so there is no ClerkProvider and Clerk hooks must
 * never be called.
 */
const LegacyAuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, initialize, currentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser && !isAuthenticated) {
      void initialize();
    }
  }, [initialize, currentUser, isAuthenticated]);

  const hasSession = isAuthenticated || Boolean(currentUser);

  if (isLoading && !hasSession) {
    return (
      <LoadingState
        title="Opening EngVox"
        description="Restoring your professional learning workspace."
      />
    );
  }

  if (!hasSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AuthGuard = ({ children }: AuthGuardProps) =>
  CLERK_PUBLISHABLE_KEY ? (
    <ClerkAuthGuard>{children}</ClerkAuthGuard>
  ) : (
    <LegacyAuthGuard>{children}</LegacyAuthGuard>
  );
