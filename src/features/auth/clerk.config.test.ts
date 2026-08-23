import { describe, expect, it } from 'vitest';

import {
  CLERK_PUBLISHABLE_KEY,
  CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  CLERK_SIGN_UP_URL,
} from './clerk.config';

describe('clerk.config', () => {
  it('CLERK_SIGN_IN_URL is a string', () => {
    expect(typeof CLERK_SIGN_IN_URL).toBe('string');
    expect(CLERK_SIGN_IN_URL.length).toBeGreaterThan(0);
  });

  it('CLERK_SIGN_UP_URL is a string', () => {
    expect(typeof CLERK_SIGN_UP_URL).toBe('string');
    expect(CLERK_SIGN_UP_URL.length).toBeGreaterThan(0);
  });

  it('CLERK_SIGN_IN_FALLBACK_REDIRECT_URL defaults to /dashboard', () => {
    expect(CLERK_SIGN_IN_FALLBACK_REDIRECT_URL).toBe('/dashboard');
  });

  it('CLERK_SIGN_UP_FALLBACK_REDIRECT_URL defaults to /dashboard', () => {
    expect(CLERK_SIGN_UP_FALLBACK_REDIRECT_URL).toBe('/dashboard');
  });

  it('CLERK_PUBLISHABLE_KEY is defined or undefined', () => {
    expect(typeof CLERK_PUBLISHABLE_KEY === 'string' || CLERK_PUBLISHABLE_KEY === undefined).toBe(
      true
    );
  });
});
