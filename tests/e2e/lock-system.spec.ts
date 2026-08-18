/**
 * Lock-system smoke test (free tier).
 *
 * Signs in as a real free-tier Clerk user and verifies the subscription lock
 * system end to end in a real browser:
 *   1. Menu locks — locked nav items render with a lock icon / "Soon" badge
 *   2. Locked-feature modal — clicking a locked item explains the required plan
 *   3. "See plans" → /pricing
 *   4. URL protection — direct navigation to locked routes redirects to /pricing
 *   5. Free-tier previews — /vocabulary and /grammar stay open for free users
 *
 * Requires a Clerk secret key (CLERK_SECRET_KEY in the environment or in the
 * root .env.local) so the test can create/reuse its dedicated `+clerk_test`
 * account. Test emails accept the fixed verification code 424242, so the whole
 * sign-in is scriptable. Skips cleanly when the key is missing.
 */
import { type APIRequestContext, type Page, expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TEST_EMAIL = 'e2e.locksmoke+clerk_test@gmail.com';
const TEST_PASSWORD = 'EngVoxLockE2E2026';

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

test.skip(
  !CLERK_SECRET_KEY,
  'CLERK_SECRET_KEY is required (set it in .env.local) to run the lock-system smoke test'
);

const clerkHeaders = { Authorization: `Bearer ${CLERK_SECRET_KEY}` };

/** Create the dedicated test user once, or resolve its id if it already exists. */
const ensureTestUser = async (request: APIRequestContext): Promise<string> => {
  const create = await request.post(`${CLERK_API_URL}/v1/users`, {
    headers: { ...clerkHeaders, 'Content-Type': 'application/json' },
    data: {
      email_address: [TEST_EMAIL],
      password: TEST_PASSWORD,
      first_name: 'E2E',
      last_name: 'Lock Smoke',
      public_metadata: { source: 'lock-system-smoke' },
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
    `${CLERK_API_URL}/v1/users?email_address=${encodeURIComponent(TEST_EMAIL)}`,
    { headers: clerkHeaders }
  );
  expect(list.ok()).toBeTruthy();
  const users = (await list.json()) as { id: string }[];
  expect(users.length).toBeGreaterThan(0);
  return users[0].id;
};

/**
 * Scripted Clerk sign-in: email → password → one-time code (fixed 424242 for
 * `+clerk_test` addresses). Handles instances that skip either step.
 */
const signIn = async (page: Page) => {
  await page.goto('/login');
  await expect(page.locator('input[name="identifier"]').first()).toBeVisible({
    timeout: 30_000,
  });
  await page.locator('input[name="identifier"]').first().fill(TEST_EMAIL);
  await page.getByRole('button', { name: /continue/i }).click();

  const passwordInput = page.locator('input[name="password"]');
  if (await passwordInput.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await passwordInput.fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /continue/i }).click();
  }

  // New-device verification: the code input is labelled "Enter verification
  // code" (Clerk no longer names it `code`), and +clerk_test emails accept
  // the fixed code 424242.
  const codeInput = page
    .getByLabel(/verification code/i)
    .or(page.locator('input[name="code"]'))
    .first();
  if (await codeInput.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await codeInput.fill('424242');
    await page.getByRole('button', { name: /continue/i }).click();
  }

  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
};

/**
 * Fresh users land on the onboarding gate. Seed the learning profile directly
 * (the key ClerkBridge reads after sign-in) so the app unlocks without
 * clicking through the panel — keeps the smoke test focused on the lock system.
 */
const passOnboarding = async (page: Page, userId: string) => {
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

test.describe('Lock system smoke test (free tier)', () => {
  let userId: string;

  test.beforeAll(async ({ request }) => {
    userId = await ensureTestUser(request);
  });

  test('menu shows locks, locked item opens the plan modal, See plans → /pricing', async ({
    page,
  }) => {
    await signIn(page);
    await passOnboarding(page, userId);

    // Top-level locked items render as buttons with a lock affordance.
    const translatorLocked = page.getByRole('button', { name: /translator \(locked\)/i });
    await expect(translatorLocked).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: /team \(locked\)/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /team \(locked\)/i }).getByText('Soon')
    ).toBeVisible();

    // Nested skill items are locked too (expand the Skills group first).
    await page.getByRole('button', { name: /^skills$/i }).click();
    await expect(page.getByRole('button', { name: /reading \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /writing \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /speaking \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /listening \(locked\)/i })).toBeVisible();

    // Clicking a locked item explains the required plan instead of redirecting.
    await translatorLocked.click();
    const modal = page.getByTestId('locked-feature-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Upgrade required' })).toBeVisible();
    await expect(modal.getByText(/Translator is included in the Senior plan/i)).toBeVisible();
    await expect(modal.getByText('Senior', { exact: true })).toBeVisible();

    // "See plans" closes the modal and opens pricing.
    await modal.getByRole('button', { name: /see plans/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('Team (coming soon) shows a "coming soon" modal without a See plans action', async ({
    page,
  }) => {
    await signIn(page);
    await passOnboarding(page, userId);

    await page.getByRole('button', { name: /team \(locked\)/i }).click();
    const modal = page.getByTestId('locked-feature-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Coming soon' })).toBeVisible();
    await expect(modal.getByText(/Team is on its way/i)).toBeVisible();
    await expect(modal.getByRole('button', { name: /see plans/i })).toHaveCount(0);

    await modal.getByRole('button', { name: /maybe later/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('URL protection: locked routes redirect to /pricing, preview routes stay open', async ({
    page,
  }) => {
    await signIn(page);
    await passOnboarding(page, userId);

    // Fully locked routes → pricing.
    for (const path of [
      '/reading',
      '/writing',
      '/speaking',
      '/listening',
      '/placement',
      '/tools/ai',
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    }

    // Learning Hub sections (Curriculum / Learning Memory) are locked.
    await page.goto('/curriculum/full');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    await page.goto('/curriculum/memory');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });

    // Free-tier preview routes stay open.
    await page.goto('/vocabulary');
    await expect(page).toHaveURL(/\/vocabulary/, { timeout: 20_000 });
    await page.goto('/grammar');
    await expect(page).toHaveURL(/\/grammar/, { timeout: 20_000 });
  });
});
