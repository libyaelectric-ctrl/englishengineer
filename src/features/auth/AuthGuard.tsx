/* eslint-disable complexity */
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '@/shared/components/LoadingState';
import { useFirebaseAuth } from './FirebaseAuth';
import { useAuthStore } from './auth.store';
import { AUTH_SIGN_IN_URL } from './firebase.config';
const AUTH_TIMEOUT_MS = 8_000;
export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const authState = useAuthStore(); const { isAuthenticated, isLoading, currentUser, sessionKind } = authState; const location = useLocation(); const { isLoaded, isSignedIn, user } = useFirebaseAuth();
  const explicitLocal = sessionKind === 'local' || sessionKind === 'demo' || !Object.prototype.hasOwnProperty.call(authState, 'sessionKind');
  const hasLocalSession = explicitLocal && isAuthenticated && Boolean(currentUser);
  const firebaseReady = isLoaded && isSignedIn && (!user?.uid || (sessionKind === 'firebase' && currentUser?.id === user.uid));
  const hasSession = hasLocalSession || firebaseReady;
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => { if (isLoaded) return; const timer = setTimeout(() => { import('@sentry/react').then((module) => { module.withScope((scope) => { scope.setTag('auth.timeout', true); scope.setTag('auth.timeout_ms', AUTH_TIMEOUT_MS); scope.setTag('route', location.pathname); scope.setLevel('warning'); }); module.captureMessage('Firebase Auth failed to load within timeout — likely blocked by ad blocker or privacy extension'); }).catch(() => {}); setTimedOut(true); }, AUTH_TIMEOUT_MS); return () => clearTimeout(timer); }, [isLoaded, location.pathname]);
  if ((!isLoaded || (isSignedIn && !firebaseReady)) && !hasLocalSession) { if (timedOut) return <LoadingState variant="error" title="Connection problem" description="Unable to reach the authentication service. This is usually caused by an ad blocker or privacy extension. Please disable it for this site and reload the page." />; return <LoadingState title="Opening EngVox" description="Restoring your professional learning workspace." />; }
  if (!hasSession) { if (isLoading) return <LoadingState title="Opening EngVox" description="Restoring your professional learning workspace." />; return <Navigate to={AUTH_SIGN_IN_URL} state={{ from: location }} replace />; }
  return <>{children}</>;
};
export default AuthGuard;
