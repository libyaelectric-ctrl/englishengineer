import { SignIn, SignUp } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { isNativePlatform } from '@/shared/utils/capacitor';
import {
  CLERK_PUBLISHABLE_KEY,
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
 * via router `state.from`, or carried in a `?redirect_url=` query) so a
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

  // On native platform, open Clerk auth in system browser to avoid WebView OAuth issues
  useEffect(() => {
    if (!isNativePlatform() || !CLERK_PUBLISHABLE_KEY) return;

    const clerkHost = CLERK_PUBLISHABLE_KEY.replace('pk_live_', '').replace('pk_test_', '').split('$')[0];
    const authUrl = mode === 'sign-in'
      ? `https://${clerkHost}/sign-in`
      : `https://${clerkHost}/sign-up`;

    import('@capacitor/browser').then(({ Browser }) => {
      Browser.open({
        url: authUrl,
        toolbarColor: '#0a0a1a',
      });
    }).catch(() => {
      // Fallback: stay in WebView with Clerk component
    });
  }, [mode]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-md">
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
        <div className="mb-4 flex w-full max-w-[26rem] justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-surface-hover hover:border-primary/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>EngVox Home</span>
          </Link>
        </div>

        <div className="w-full max-w-[26rem] animate-in fade-in zoom-in-50 duration-200">
          {mode === 'sign-in' ? (
            <SignIn
              routing="path"
              path={CLERK_SIGN_IN_URL}
              signUpUrl={CLERK_SIGN_UP_URL}
              fallbackRedirectUrl={signInAfter}
              afterSignInUrl={signInAfter}
            />
          ) : (
            <SignUp
              routing="path"
              path={CLERK_SIGN_UP_URL}
              signInUrl={CLERK_SIGN_IN_URL}
              fallbackRedirectUrl={signUpAfter}
              afterSignUpUrl={signUpAfter}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClerkAuthPage;
