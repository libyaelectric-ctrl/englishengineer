import { useAuth } from '@clerk/clerk-react';
import * as Sentry from '@sentry/react';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useAuthStore } from './auth.store';
import { CLERK_SIGN_IN_URL } from './clerk.config';

/** How long to wait for Clerk to load before showing the timeout fallback. */
const CLERK_TIMEOUT_MS = 8_000;

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

  // Timeout: if Clerk doesn't load within CLERK_TIMEOUT_MS, show an error
  // instead of an infinite spinner. This happens when ad-blockers or privacy
  // extensions block clerk.engvox.com / *.clerk.accounts.dev.
  const [clerkTimedOut, setClerkTimedOut] = useState(false);

  useEffect(() => {
    if (clerkLoaded) return; // Clerk already loaded — nothing to time out.
    const timer = setTimeout(() => {
      Sentry.withScope((scope) => {
        scope.setTag('clerk.timeout', true);
        scope.setTag('clerk.timeout_ms', CLERK_TIMEOUT_MS);
        scope.setTag('route', location.pathname);
        scope.setLevel('warning');
      });
      Sentry.captureMessage(
        'Clerk failed to load within timeout — likely blocked by ad blocker or privacy extension'
      );
      setClerkTimedOut(true);
    }, CLERK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [clerkLoaded, location.pathname]);

  // While Clerk is still loading we cannot know whether the user is signed
  // in. Redirecting to /login in this window races Clerk's session restore:
  // /login sees the signed-in session and bounces back to /dashboard, which
  // bounces to /login again — an infinite reload loop. Wait for Clerk before
  // ever deciding the user is signed out.
  //
  // However, if the app's own auth store already has a session (demo/local
  // users seeded by enterDemo()), skip the Clerk wait entirely — demo users
  // have no Clerk session so waiting would just hit the timeout.
  if (!clerkLoaded && !hasSession) {
    if (clerkTimedOut) {
      return (
        <LoadingState
          variant="error"
          title="Connection problem"
          description="Unable to reach the authentication service. This is usually caused by an ad blocker or privacy extension. Please disable it for this site and reload the page."
        />
      );
    }
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
    return <Navigate to={CLERK_SIGN_IN_URL} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
