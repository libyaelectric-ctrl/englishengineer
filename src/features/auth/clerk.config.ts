// Client-side Clerk configuration.
//
// CLERK_SECRET_KEY is server-only and must NEVER be imported from client code —
// only the publishable key (VITE_CLERK_PUBLISHABLE_KEY) is safe to expose.
// These values are injected at build time by Vite from .env.local.

export const CLERK_PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ||
  'pk_live_Y2xlcmsuZW5ndm94LmNvbSQ';

export const CLERK_SIGN_IN_URL = import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in';

export const CLERK_SIGN_UP_URL = import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up';

export const CLERK_SIGN_IN_FALLBACK_REDIRECT_URL =
  import.meta.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/dashboard';

export const CLERK_SIGN_UP_FALLBACK_REDIRECT_URL =
  import.meta.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/dashboard';
