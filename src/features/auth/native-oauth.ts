/**
 * Native (Capacitor) Google OAuth bridge.
 *
 * Clerk's web SDK cannot complete Google OAuth inside an Android WebView —
 * Google rejects embedded-WebView user agents on its consent page, so the
 * in-app redirect flow dead-ends (the "login olmuyor" symptom on the APK).
 * The reliable mobile pattern is a system-browser + deep-link round trip:
 *
 * 1. Start the flow with `signIn.authenticateWithRedirect(...)`, pointing the
 *    RETURN URL at the app's custom URL scheme (`com.engvox.app://oauth-callback`,
 *    declared as an intent filter in android/app/src/main/AndroidManifest.xml).
 * 2. Clerk builds the authorize URL on its own domain (clerk.engvox.com is in
 *    capacitor.config.ts `server.allowNavigation`), so the WebView loads it;
 *    the redirect to accounts.google.com is NOT allowlisted, so Capacitor's
 *    BridgeWebViewClient hands the navigation to the system browser.
 * 3. Google consent completes, Clerk finalizes the sign-in server-side and
 *    redirects the system browser to the custom scheme. Android resolves the
 *    intent back into the app (launchMode singleTask → onNewIntent).
 * 4. `useNativeOAuthReturn()` catches the deep link (appUrlOpen / getLaunchUrl)
 *    and replays its query params onto the WebView's current origin at
 *    `#/oauth-callback`. The page reloads, clerk-js boots with those params,
 *    and OAuthCallbackPage completes the flow with `clerk.handleRedirectCallback()`
 *    — the same session-establishment path email/password uses, so the session
 *    cookie lands on the WebView's https://localhost origin as usual.
 *
 * Prerequisite (ops, cannot be configured from app code): the Clerk Dashboard
 * for the instance must allow `com.engvox.app://oauth-callback` as a redirect
 * URL, and the Google OAuth provider must be enabled. Email/password and OTP
 * sign-in are unaffected — they run entirely in-app.
 */
import { App } from '@capacitor/app';

import { useEffect, useRef } from 'react';

import { isNativePlatform } from '@/shared/utils/capacitor';

import { forwardOAuthReturn } from './native-oauth-forward';

export {
  OAUTH_CALLBACK_ROUTE,
  buildOAuthForwardUrl,
  forwardOAuthReturn,
} from './native-oauth-forward';

/**
 * The custom URL scheme the Android manifest declares for OAuth returns.
 * Must stay in sync with `appId` in capacitor.config.ts (com.engvox.app) and
 * the `<data android:scheme="com.engvox.app" />` intent filter in
 * android/app/src/main/AndroidManifest.xml.
 */
export const OAUTH_CALLBACK_SCHEME = 'com.engvox.app';

/** The deep link Clerk redirects the system browser to after OAuth completes. */
export const getOAuthDeepLinkUrl = (): string => `${OAUTH_CALLBACK_SCHEME}://oauth-callback`;

/** True when running inside the native Capacitor shell (Android/iOS). */
export const isNativeOAuthSupported = (): boolean => isNativePlatform();

/**
 * Listens for the system browser handing the OAuth completion back to the app
 * and forwards it into the WebView. Mount once at the app root.
 *
 * Covers both warm resume (appUrlOpen via onNewIntent) and cold start
 * (getLaunchUrl from the launching intent). The forwarded URL is an
 * https://localhost URL, so it can never match the deep-link prefix again —
 * no forwarding loop.
 */
export function useNativeOAuthReturn(): void {
  const handled = useRef(false);

  useEffect(() => {
    if (!isNativeOAuthSupported()) return;

    let cancelled = false;
    const handleUrl = (url: string): void => {
      if (cancelled || handled.current) return;
      if (!url.startsWith(getOAuthDeepLinkUrl())) return;
      handled.current = true;
      forwardOAuthReturn(url);
    };

    const listenerPromise = App.addListener('appUrlOpen', ({ url }) => handleUrl(url));
    App.getLaunchUrl()
      .then((launch) => {
        if (launch?.url) handleUrl(launch.url);
      })
      .catch(() => {
        /* no launch URL — nothing to forward */
      });

    return () => {
      cancelled = true;
      listenerPromise.then((listener) => listener.remove()).catch(() => {});
    };
  }, []);
}
