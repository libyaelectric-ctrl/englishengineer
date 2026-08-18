/**
 * Shared Clerk sign-in helpers for Playwright specs.
 *
 * The app's only auth path is Clerk (the old "demo" login button is gone), so
 * browser/e2e specs sign in as a real free-tier Clerk user. This module owns
 * that flow: create/reuse a dedicated `+clerk_test` account via the Clerk
 * Backend API, script the email → password → OTP sign-in, and seed the
 * onboarding profile so the app unlocks.
 *
 * Requires CLERK_SECRET_KEY (environment or root .env.local). Specs that use
 * these helpers should call `skipIfNoClerkSecret()` at module scope so the
 * suite skips cleanly when the key is missing (e.g. fork PRs), and CI verifies
 * the secret is configured before running.
 */
import { type APIRequestContext, type Page, expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const TEST_USER_EMAIL = 'e2e.locksmoke+clerk_test@gmail.com';
export const TEST_USER_PASSWORD = 'EngVoxLockE2E2026';

/** Minimal KEY=VALUE parser for the root .env.local (values are never logged). */
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
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY || '';
const CLERK_API_URL = (
  process.env.CLERK_API_URL ||
  env.CLERK_API_URL ||
  'https://api.clerk.com'
).replace(/\/+$/, '');

export const hasClerkSecret = (): boolean => Boolean(CLERK_SECRET_KEY);

/** Call at module scope in specs that need a real Clerk session. */
export const skipIfNoClerkSecret = (): void => {
  test.skip(
    !hasClerkSecret(),
    'CLERK_SECRET_KEY is required (set it in .env.local) to run Clerk-based e2e tests'
  );
};

/** Create the shared test user once, or resolve its id if it already exists. */
export const ensureTestUser = async (request: APIRequestContext): Promise<string> => {
  const headers = { Authorization: `Bearer ${CLERK_SECRET_KEY}` };
  const create = await request.post(`${CLERK_API_URL}/v1/users`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
    data: {
      email_address: [TEST_USER_EMAIL],
      password: TEST_USER_PASSWORD,
      first_name: 'E2E',
      last_name: 'Test User',
      public_metadata: { source: 'playwright-e2e' },
    },
  });
  if (create.ok()) {
    const user = (await create.json()) as { id: string };
    return user.id;
  }
  if (create.status() !== 422) {
    throw new Error(`Clerk user creation failed: HTTP ${create.status()} ${await create.text()}`);
  }
  // Email already taken — look the user up.
  const list = await request.get(
    `${CLERK_API_URL}/v1/users?email_address=${encodeURIComponent(TEST_USER_EMAIL)}`,
    { headers }
  );
  expect(list.ok()).toBeTruthy();
  const users = (await list.json()) as { id: string }[];
  expect(users.length).toBeGreaterThan(0);
  return users[0].id;
};

/**
 * Scripted Clerk sign-in: email → password → one-time code (fixed 424242 for
 * `+clerk_test` addresses). Handles instances that skip either step. Forces a
 * desktop viewport so the app shell renders the sidebar regardless of the
 * Playwright project's device.
 */
export const signInAsTestUser = async (page: Page): Promise<void> => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  const emailInput = page.locator('input[name="identifier"]').first();
  await expect(emailInput).toBeVisible({ timeout: 30_000 });
  await emailInput.fill(TEST_USER_EMAIL);
  await page.getByRole('button', { name: /continue/i }).click();

  // Password (factor one). Some instances skip straight to the code.
  const passwordInput = page.locator('input[name="password"]');
  if (await passwordInput.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await passwordInput.fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /continue/i }).click();
  }

  // The password → verification-code step can be slow: Clerk sends the email
  // before mounting the code input. Wait on the URL (hash route
  // #/factor-two) instead of polling the input.
  await page.waitForURL(/\/dashboard|#\/factor-two/, { timeout: 75_000 });

  if (page.url().includes('#/factor-two')) {
    // New-device verification: +clerk_test emails accept the fixed code
    // 424242. The input is labelled "Enter verification code".
    const codeInput = page
      .getByLabel(/verification code/i)
      .or(page.locator('input[name="code"]'))
      .first();
    await expect(codeInput).toBeVisible({ timeout: 30_000 });
    // Clerk's code input is a custom OTP field: it ignores programmatic
    // value setting (fill) and needs real keystrokes, so type sequentially.
    await codeInput.pressSequentially('424242', { delay: 100 });
    // Clerk auto-submits once all six digits are entered.
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
  }
};

/**
 * Fresh users land on the onboarding gate. Seed the learning profile directly
 * (the key ClerkBridge reads after sign-in) so the app unlocks without
 * clicking through the panel.
 */
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

/**
 * Drop-in replacement for the removed "demo" login: signs in as the shared
 * free-tier Clerk test user and unlocks the app (onboarding seeded). Specs
 * previously calling `loginAsDemo(page)` / `demoLogin(page)` can import this
 * without changing their call sites.
 */
export const demoLogin = async (page: Page): Promise<void> => {
  const userId = await ensureTestUser(page.request);
  await signInAsTestUser(page);
  await completeOnboarding(page, userId);
};
