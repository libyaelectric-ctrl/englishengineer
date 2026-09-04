import { SignIn, SignUp, useAuth, useClerk } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';

import { useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { isNativePlatform } from '@/shared/utils/capacitor';

import {
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_URL,
} from '@/features/auth/clerk.config';
import { getOAuthDeepLinkUrl, isNativeOAuthSupported } from '@/features/auth/native-oauth';

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

/**
 * Google OAuth cannot run inside the Capacitor WebView (Google rejects
 * embedded-WebView user agents), so on native platforms Clerk's built-in
 * social buttons are hidden and this button starts a system-browser flow
 * instead: authenticateWithRedirect with the return URL pointed at the app's
 * `com.engvox.app://oauth-callback` deep link. See native-oauth.ts for the
 * full round trip. On web this renders nothing — Clerk's in-app OAuth works.
 */
const NativeGoogleOAuthButton = ({
  mode,
  afterCompleteUrl,
}: {
  mode: 'sign-in' | 'sign-up';
  afterCompleteUrl: string;
}) => {
  const clerk = useClerk();
  const { isLoaded } = useAuth();
  const [state, setState] = useState<'idle' | 'starting' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isNativeOAuthSupported()) return null;

  const handleClick = async (): Promise<void> => {
    setState('starting');
    setError(null);
    try {
      const resource = mode === 'sign-in' ? clerk.client?.signIn : clerk.client?.signUp;
      if (!resource) {
        throw new Error('Authentication is not ready yet — please try again in a moment.');
      }
      await resource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: getOAuthDeepLinkUrl(),
        redirectUrlComplete: afterCompleteUrl,
      });
      // Reaching this line means the redirect never fired (e.g. the deep link
      // is not allowlisted as a redirect URL in the Clerk Dashboard). Surface
      // the failure instead of silently hanging.
      setState('failed');
      setError(
        'Google sign-in could not be started. Check that the Clerk Dashboard allows the redirect URL, or use email/password.'
      );
    } catch (err) {
      setState('failed');
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={!isLoaded || state === 'starting'}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border-soft bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.58v3h3.87c2.26-2.09 3.58-5.17 3.58-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
          />
        </svg>
        {state === 'starting' ? 'Opening Google…' : 'Continue with Google'}
      </button>
      {state === 'failed' && error && (
        <p className="mt-2 text-center text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

const ClerkAuthPage = ({ mode }: ClerkAuthPageProps) => {
  const location = useLocation();
  const returnTarget = getReturnTarget(location.search, location.state as ClerkLocationState);

  const signInAfter = returnTarget ?? CLERK_SIGN_IN_FALLBACK_REDIRECT_URL;
  const signUpAfter = returnTarget ?? CLERK_SIGN_UP_FALLBACK_REDIRECT_URL;

  // On native, Clerk's own social buttons are hidden — NativeGoogleOAuthButton
  // replaces them with a system-browser flow (see native-oauth.ts).
  const nativeAppearance = isNativePlatform()
    ? { elements: { socialButtons: { display: 'none' } } }
    : undefined;

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
            <>
              <NativeGoogleOAuthButton mode="sign-in" afterCompleteUrl={signInAfter} />
              <SignIn
                routing="path"
                path={CLERK_SIGN_IN_URL}
                signUpUrl={CLERK_SIGN_UP_URL}
                fallbackRedirectUrl={signInAfter}
                afterSignInUrl={signInAfter}
                appearance={nativeAppearance}
              />
            </>
          ) : (
            <>
              <NativeGoogleOAuthButton mode="sign-up" afterCompleteUrl={signUpAfter} />
              <SignUp
                routing="path"
                path={CLERK_SIGN_UP_URL}
                signInUrl={CLERK_SIGN_IN_URL}
                fallbackRedirectUrl={signUpAfter}
                afterSignUpUrl={signUpAfter}
                appearance={nativeAppearance}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClerkAuthPage;
