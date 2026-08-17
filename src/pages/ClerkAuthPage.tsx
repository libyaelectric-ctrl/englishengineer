import { SignIn, SignUp } from '@clerk/clerk-react';

import { useLocation } from 'react-router-dom';

import {
  CLERK_PUBLISHABLE_KEY,
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
} from '@/features/auth/clerk.config';

import LoginPage from './LoginPage';

interface ClerkAuthPageProps {
  mode: 'sign-in' | 'sign-up';
}

type ClerkLocationState = { from?: { pathname?: string } } | null;

/**
 * Honor the page the user originally tried to reach (passed by <AuthGuard>
 * via router `state.from`, or carsried in a `?redirect_url=` query) so a
 * sign-in returns to the original destination instead of always `/dashboard`.
 */
const getReturnTarget = (search: string, state: ClerkLocationState): string | undefined => {
  const redirectUrl = new URLSearchParams(search).get('redirect_url');
  if (redirectUrl?.startsWith('/')) return redirectUrl;
  const fromPath = state?.from?.pathname;
  if (fromPath && fromPath !== '/login' && fromPath !== '/signup') return fromPath;
  return undefined;
};

const ClerkAuthPage = ({ mode }: ClerkAuthPageProps) => {
  const location = useLocation();
  const returnTarget = getReturnTarget(location.search, location.state as ClerkLocationState);

  if (!CLERK_PUBLISHABLE_KEY) {
    return <LoginPage />;
  }

  const signInAfter = returnTarget ?? CLERK_SIGN_IN_FALLBACK_REDIRECT_URL;
  const signUpAfter = returnTarget ?? CLERK_SIGN_UP_FALLBACK_REDIRECT_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-50 duration-200 p-6">
        {mode === 'sign-in' ? (
          <SignIn afterSignInUrl={signInAfter} />
        ) : (
          <SignUp afterSignUpUrl={signUpAfter} />
        )}
      </div>
    </div>
  );
};

export default ClerkAuthPage;
