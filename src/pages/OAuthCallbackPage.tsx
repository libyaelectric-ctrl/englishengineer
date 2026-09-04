import { useAuth, useClerk } from '@clerk/clerk-react';

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { navigateTo } from '@/shared/utils/capacitor';

import { CLERK_SIGN_IN_URL } from '@/features/auth/clerk.config';

/**
 * Completes the native (Capacitor) Google OAuth round trip. The system
 * browser handed the deep link back to the app; useNativeOAuthReturn()
 * replayed Clerk's query params onto the WebView at `#/oauth-callback`, so
 * clerk-js booted with them visible. Here we finish the sign-in the same way
 * the `<AuthenticateWithRedirectCallback />` component would, but with hash
 * navigation so the post-sign-in redirect doesn't trigger a full document
 * load inside the WebView.
 *
 * Safe to visit on web too: with no pending OAuth flow the completion is a
 * no-op/error that bounces back to the sign-in screen.
 */

/** How long to wait for handleRedirectCallback before showing the error card. */
const COMPLETION_TIMEOUT_MS = 20_000;

const OAuthCallbackPage = () => {
  const { isLoaded } = useAuth();
  const clerk = useClerk();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    const fail = (message: string): void => {
      settled = true;
      if (!cancelled) setError(message);
    };

    // If Clerk never finishes — handleRedirectCallback stalls, or Clerk never
    // loads at all (Frontend API unreachable, e.g. a missing origin allowlist)
    // — don't leave the user staring at a spinner forever: surface the error
    // card so they can back out. Armed on mount, so it covers the not-yet-
    // loaded case too.
    const timeout = window.setTimeout(() => {
      if (settled) return;
      fail('Sign-in is taking too long. Please try again or use email/password.');
    }, COMPLETION_TIMEOUT_MS);

    if (!isLoaded) {
      // Clerk still loading — the completion starts when isLoaded flips; the
      // timeout above still guards the never-loads case.
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    const complete = async (): Promise<void> => {
      try {
        await clerk.handleRedirectCallback({}, async (to) => {
          if (to && !to.startsWith('http')) {
            navigateTo(to);
          }
        });
        settled = true;
        // handleRedirectCallback navigates on success; this is a safety net.
        if (!cancelled) navigate('/dashboard', { replace: true });
      } catch (err) {
        fail(
          err instanceof Error
            ? err.message
            : 'Could not complete Google sign-in. Please try again or use email/password.'
        );
      }
    };

    void complete();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isLoaded, clerk, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border-soft bg-surface p-8 text-center">
        {error ? (
          <>
            <h2 className="mb-2 text-base font-bold text-foreground">Sign-in incomplete</h2>
            <p className="mb-6 text-sm text-foreground/70">{error}</p>
            <button
              onClick={() => navigateTo(CLERK_SIGN_IN_URL)}
              className="w-full rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <p className="text-sm text-foreground/70">Finishing sign-in…</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
