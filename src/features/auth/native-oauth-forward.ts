/**
 * Pure helpers that replay a `com.engvox.app://` OAuth return URL into the
 * WebView. Kept in their own module, separate from the React hook in
 * native-oauth.ts, so unit tests can mock the navigation side effect without
 * reimplementing the URL handling.
 */

/** Hash-router route that completes the OAuth flow (see router.tsx). */
export const OAUTH_CALLBACK_ROUTE = '/oauth-callback';

/**
 * Computes the WebView URL an OAuth return is forwarded to: the deep link's
 * query params (Clerk handshake/state) are copied onto the app's origin and
 * the hash router is pointed at `#/oauth-callback`. Pure function — the
 * caller performs the navigation.
 */
export function buildOAuthForwardUrl(
  deepLinkUrl: string,
  baseUrl: string = window.location.href
): string {
  const incoming = new URL(deepLinkUrl);
  const target = new URL(baseUrl);
  target.search = incoming.search;
  target.hash = `#${OAUTH_CALLBACK_ROUTE}`;
  return target.toString();
}

/**
 * Replays a `com.engvox.app://` return URL into the WebView via a full
 * navigation to {@link buildOAuthForwardUrl}'s target, so the app reloads and
 * clerk-js boots with the params visible in `window.location`. Falls back to a
 * plain reload if the deep link cannot be parsed.
 */
export function forwardOAuthReturn(deepLinkUrl: string): void {
  try {
    window.location.href = buildOAuthForwardUrl(deepLinkUrl);
  } catch {
    window.location.reload();
  }
}
