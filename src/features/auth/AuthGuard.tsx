import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useFirebaseAuth } from './FirebaseAuth';
import { useAuthStore } from './auth.store';
import { AUTH_SIGN_IN_URL } from './firebase.config';

/** How long to wait for Firebase Auth to load before showing the timeout fallback. */
const AUTH_TIMEOUT_MS = 8_000;

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Firebase-aware guard. Rendered only inside <FirebaseAuthProvider> (Firebase
 * is the single auth of record), so the unconditional useFirebaseAuth() call
 * below is always safe. The app's own zustand store is seeded by
 * <FirebaseBridge> when a Firebase session is active, so the guard must not
 * redirect to /login in the meantime.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, currentUser } = useAuthStore();
  const location = useLocation();
  const { isLoaded: authLoaded, isSignedIn } = useFirebaseAuth();
  const hasProviderSession = authLoaded && isSignedIn;

  const hasSession = isAuthenticated || Boolean(currentUser) || hasProviderSession;

  // Timeout: if Firebase Auth doesn't load within AUTH_TIMEOUT_MS, show an
  // error instead of an infinite spinner. This happens when ad-blockers or
  // privacy extensions block the Firebase Auth endpoints.
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    if (authLoaded) return; // Auth already loaded — nothing to time out.
    const timer = setTimeout(() => {
      import('@sentry/react')
        .then((m) => {
          m.withScope((scope) => {
            scope.setTag('auth.timeout', true);
            scope.setTag('auth.timeout_ms', AUTH_TIMEOUT_MS);
            scope.setTag('route', location.pathname);
            scope.setLevel('warning');
          });
          m.captureMessage(
            'Firebase Auth failed to load within timeout — likely blocked by ad blocker or privacy extension'
          );
        })
        .catch(() => {});
      setAuthTimedOut(true);
    }, AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [authLoaded, location.pathname]);

  // While Firebase Auth is still loading we cannot know whether the user is
  // signed in. Redirecting to /login in this window races session restore:
  // /login sees the signed-in session and bounces back to /dashboard, which
  // bounces to /login again — an infinite reload loop. Wait for the provider
  // before ever deciding the user is signed out.
  //
  // However, if the app's own auth store already has a session (demo/local
  // users seeded by enterDemo()), skip the provider wait entirely — demo
  // users have no Firebase session so waiting would just hit the timeout.
  if (!authLoaded && !hasSession) {
    if (authTimedOut) {
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
    return <Navigate to={AUTH_SIGN_IN_URL} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
