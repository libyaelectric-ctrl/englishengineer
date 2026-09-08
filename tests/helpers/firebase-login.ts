/**
 * Shared Firebase sign-in helpers for Playwright specs.
 *
 * Authenticated suites use a dedicated Firebase test account. The helper
 * creates the account through Identity Toolkit when needed, signs in through
 * the real EngVox email/password UI, and seeds the onboarding profile.
 * Secrets are read from environment variables or the root .env.local and are
 * never logged.
 */
import { type APIRequestContext, type Page, expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const loadDotEnv = (): Record<string, string> => {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    const env: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
    return env;
  } catch {
    return {};
  }
};

const env = loadDotEnv();
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || '';
export const TEST_USER_EMAIL =
  process.env.FIREBASE_E2E_TEST_EMAIL || env.FIREBASE_E2E_TEST_EMAIL || '';
export const TEST_USER_PASSWORD =
  process.env.FIREBASE_E2E_TEST_PASSWORD || env.FIREBASE_E2E_TEST_PASSWORD || '';
const FIREBASE_AUTH_REST_URL = (
  process.env.FIREBASE_AUTH_REST_URL ||
  env.FIREBASE_AUTH_REST_URL ||
  'https://identitytoolkit.googleapis.com/v1'
).replace(/\/+$/, '');

export const hasFirebaseTestConfig = (): boolean =>
  Boolean(FIREBASE_API_KEY && TEST_USER_EMAIL && TEST_USER_PASSWORD);

export const skipIfNoFirebaseTestConfig = (): void => {
  test.skip(
    !hasFirebaseTestConfig(),
    'VITE_FIREBASE_API_KEY, FIREBASE_E2E_TEST_EMAIL and FIREBASE_E2E_TEST_PASSWORD are required'
  );
};

const firebaseRequest = async (
  request: APIRequestContext,
  operation: 'signUp' | 'signInWithPassword'
) =>
  request.post(`${FIREBASE_AUTH_REST_URL}/accounts:${operation}?key=${FIREBASE_API_KEY}`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      returnSecureToken: true,
    },
  });

const firebaseErrorCode = async (response: Awaited<ReturnType<typeof firebaseRequest>>) => {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };
    return payload.error?.message ?? `HTTP_${response.status()}`;
  } catch {
    return `HTTP_${response.status()}`;
  }
};

export const ensureTestUser = async (request: APIRequestContext): Promise<string> => {
  const created = await firebaseRequest(request, 'signUp');
  if (created.ok()) {
    const payload = (await created.json()) as { localId?: string };
    if (payload.localId) return payload.localId;
    throw new Error('Firebase sign-up response did not include localId.');
  }

  const createError = await firebaseErrorCode(created);
  if (!createError.startsWith('EMAIL_EXISTS')) {
    throw new Error(`Firebase test user provisioning failed: ${createError}`);
  }

  const signedIn = await firebaseRequest(request, 'signInWithPassword');
  if (!signedIn.ok()) {
    throw new Error(`Firebase test user sign-in failed: ${await firebaseErrorCode(signedIn)}`);
  }
  const payload = (await signedIn.json()) as { localId?: string };
  if (!payload.localId) throw new Error('Firebase sign-in response did not include localId.');
  return payload.localId;
};

export const signInAsTestUser = async (page: Page): Promise<void> => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  await page.getByRole('button', { name: /e-posta ile devam et/i }).click();

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  await expect(emailInput).toBeVisible({ timeout: 30_000 });
  await emailInput.fill(TEST_USER_EMAIL);
  await passwordInput.fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: /giriş yap/i }).click();
  await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 60_000 });
};

export const completeOnboarding = async (page: Page, userId: string): Promise<void> => {
  await page.evaluate(
    ({ id }) => {
      localStorage.setItem(
        `eos_user_${id}_learning_profile_${id}`,
        JSON.stringify({
          userId: id,
          discipline: 'civil',
          interfaceLanguage: 'en',
          onboardingCompleted: true,
        })
      );
    },
    { id: userId }
  );
  await page.reload();
};

export const demoLogin = async (page: Page): Promise<void> => {
  const userId = await ensureTestUser(page.request);
  await signInAsTestUser(page);
  await completeOnboarding(page, userId);
};
