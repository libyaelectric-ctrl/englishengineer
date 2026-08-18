/**
 * Playwright global auth setup.
 *
 * Signs in once as the shared free-tier Clerk test user (email + password +
 * fixed OTP 424242) and seeds the onboarding profile, then saves the browser
 * storage state (Clerk session cookie + localStorage) to
 * playwright/.auth/user.json. The chromium-desktop and mobile-safari projects
 * declare this as a dependency and load the saved state, so individual specs
 * skip the slow per-test sign-in entirely.
 *
 * Skips cleanly when CLERK_SECRET_KEY is missing; dependent tests are skipped
 * automatically when this setup is skipped.
 */
import { test as setup } from '@playwright/test';
import { mkdirSync } from 'node:fs';

import {
  completeOnboarding,
  ensureTestUser,
  hasClerkSecret,
  signInAsTestUser,
} from './clerk-login';

setup.skip(!hasClerkSecret(), 'CLERK_SECRET_KEY is required to run Clerk-based e2e tests');

const AUTH_STATE_PATH = 'playwright/.auth/user.json';

setup('authenticate as free-tier Clerk test user', async ({ page, request }) => {
  const userId = await ensureTestUser(request);
  await signInAsTestUser(page);
  await completeOnboarding(page, userId);

  mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
