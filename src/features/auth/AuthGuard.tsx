import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '@/shared/components/LoadingState';
import { useFirebaseAuth } from './FirebaseAuth';
import { useAuthStore } from './auth.store';
import { AUTH_SIGN_IN_URL } from './firebase.config';

const AUTH_TIMEOUT_MS = 8_000;

const reportAuthTimeout = (pathname: string) => {
  import('@sentry/react')
    .then((module) => {
      module.withScope((scope) => {
        scope.setTag('auth.timeout', true);
        scope.setTag('auth.timeout_ms', AUTH_TIMEOUT_MS);
        scope.setTag('route', pathname);
        scope.setLevel('warning');
      });
      module.captureMessage(
        'Firebase Auth failed to load within timeout — likely blocked by ad blocker or privacy extension'
      );
    })
    .catch(() => {});
};

const useAuthTimeout = (isLoaded: boolean, pathname: string) => {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => {
      reportAuthTimeout(pathname);
      setTimedOut(true);
    }, AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, pathname]);
  return timedOut;
};

const WorkspaceLoading = () => (
  <LoadingState title="Opening EngVox" description="Restoring your professional learning workspace." />
);

interface SessionContext {
  sessionKind?: string;
  isAuthenticated: boolean;
  currentUser: { id?: string } | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  firebaseUserId?: string;
}

const resolveSessionState = (ctx: SessionContext) => {
  const isLocalKind = ctx.sessionKind === 'local' || ctx.sessionKind === 'demo' || !ctx.sessionKind;
  const hasLocalSession = isLocalKind && ctx.isAuthenticated && Boolean(ctx.currentUser);
  const isFirebaseMatch = ctx.sessionKind === 'firebase' && ctx.currentUser?.id === ctx.firebaseUserId;
  const firebaseReady = ctx.isLoaded && ctx.isSignedIn && (!ctx.firebaseUserId || isFirebaseMatch);
  const waitingForAuth = (!ctx.isLoaded || (ctx.isSignedIn && !firebaseReady)) && !hasLocalSession;

  return {
    hasSession: hasLocalSession || firebaseReady,
    waitingForAuth,
  };
};

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, currentUser, sessionKind } = useAuthStore();
  const location = useLocation();
  const { isLoaded, isSignedIn, user } = useFirebaseAuth();

  const session = resolveSessionState({
    sessionKind,
    isAuthenticated,
    currentUser,
    isLoaded,
    isSignedIn,
    firebaseUserId: user?.uid,
  });

  const timedOut = useAuthTimeout(isLoaded, location.pathname);

  if (session.waitingForAuth) {
    if (timedOut) {
      return (
        <LoadingState
          variant="error"
          title="Connection problem"
          description="Unable to reach the authentication service. This is usually caused by an ad blocker or privacy extension. Please disable it for this site and reload the page."
        />
      );
    }
    return <WorkspaceLoading />;
  }

  if (!session.hasSession) {
    if (isLoading) return <WorkspaceLoading />;
    return <Navigate to={AUTH_SIGN_IN_URL} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
