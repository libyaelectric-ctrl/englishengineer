/**
 * CSRF Token Helper for Frontend
 *
 * Reads the CSRF token from the cookie set by the backend
 * and provides it for inclusion in state-changing requests.
 */

const CSRF_COOKIE_NAME = 'eos_csrf';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Reads a cookie value by name.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Gets the current CSRF token from the cookie.
 * Returns null if no token is set.
 */
export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME);
}

/**
 * Returns headers object with CSRF token for state-changing requests.
 * Use this when making POST/PUT/DELETE/PATCH requests.
 *
 * @example
 * ```ts
 * fetch('/api/ai/coach', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     ...getCsrfHeaders(),
 *   },
 *   body: JSON.stringify({ prompt: 'Hello' }),
 * });
 * ```
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) return {};
  return { [CSRF_HEADER_NAME]: token };
}

/**
 * Returns a RequestInit with CSRF headers included.
 * Merges with any provided init options.
 *
 * @example
 * ```ts
 * fetch('/api/ai/coach', csrfFetchInit({
 *   method: 'POST',
 *   body: JSON.stringify({ prompt: 'Hello' }),
 * }));
 * ```
 */
export function csrfFetchInit(
  init: RequestInit = {}
): RequestInit {
  return {
    ...init,
    headers: {
      ...(typeof init.headers === 'object' && init.headers !== null
        ? init.headers
        : {}),
      ...getCsrfHeaders(),
    },
  };
}
