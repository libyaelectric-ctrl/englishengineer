import { SignIn, SignUp } from '@clerk/clerk-react';

import { useLocation } from 'react-router-dom';

import {
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_URL,
} from '@/features/auth/clerk.config';

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
  if (fromPath && fromPath !== CLERK_SIGN_IN_URL && fromPath !== CLERK_SIGN_UP_URL) return fromPath;
  return undefined;
};

const ClerkAuthPage = ({ mode }: ClerkAuthPageProps) => {
  const location = useLocation();
  const returnTarget = getReturnTarget(location.search, location.state as ClerkLocationState);

  const signInAfter = returnTarget ?? CLERK_SIGN_IN_FALLBACK_REDIRECT_URL;
  const signUpAfter = returnTarget ?? CLERK_SIGN_UP_FALLBACK_REDIRECT_URL;

  return (
    // The overlay itself scrolls: after the email step Clerk grows the card
    // (password / code input) and a non-scrollable fixed container would clip
    // that second step off-screen, leaving the user with nothing to type into.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-[26rem] animate-in fade-in zoom-in-50 duration-200">
          {mode === 'sign-in' ? (
            <SignIn afterSignInUrl={signInAfter} />
          ) : (
            <SignUp afterSignUpUrl={signUpAfter} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClerkAuthPage;
