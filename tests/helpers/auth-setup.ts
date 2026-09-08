/**
 * Playwright global Firebase authentication setup.
 *
 * Provisions the configured test account, signs in through the real app UI,
 * seeds onboarding, and saves Firebase IndexedDB/localStorage state for the
 * authenticated desktop and mobile projects.
 */
import { test as setup } from '@playwright/test';
import { mkdirSync } from 'node:fs';

import {
  completeOnboarding,
  ensureTestUser,
  hasFirebaseTestConfig,
  signInAsTestUser,
} from './firebase-login';

setup.skip(
  !hasFirebaseTestConfig(),
  'Firebase E2E test project credentials are required for authenticated suites'
);

const AUTH_STATE_PATH = 'playwright/.auth/user.json';

setup('authenticate as Firebase test user', async ({ page, request }) => {
  const userId = await ensureTestUser(request);
  await signInAsTestUser(page);
  await completeOnboarding(page, userId);

  mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: AUTH_STATE_PATH, indexedDB: true });
});
