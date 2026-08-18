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
 * account. Skips cleanly when the key is missing.
 */
import { expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

// The auth-setup project signs in as the free-tier Clerk user and stores the
// session, so tests start authenticated by going straight to /dashboard.
skipIfNoClerkSecret();

test.describe('Lock system smoke test (free tier)', () => {
  test('menu shows locks, locked item opens the plan modal, See plans → /pricing', async ({
    page,
  }) => {
    await page.goto('/dashboard');

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
    await page.goto('/dashboard');

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
    await page.goto('/dashboard');

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
