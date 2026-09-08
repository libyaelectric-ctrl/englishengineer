/**
 * Lock-system smoke test (free tier).
 *
 * Signs in as a dedicated Firebase test user and verifies subscription locks.
 */
import { expect, test } from '@playwright/test';

import { skipIfNoFirebaseTestConfig } from '../helpers/firebase-login';

skipIfNoFirebaseTestConfig();

test.describe('Lock system smoke test (free tier)', () => {
  test('menu shows locks, locked item opens the plan modal, See plans → /pricing', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    const translatorLocked = page.getByRole('button', { name: /translator \(locked\)/i });
    await expect(translatorLocked).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: /team \(locked\)/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /team \(locked\)/i }).getByText('Soon')
    ).toBeVisible();

    await page.getByRole('button', { name: /^skills$/i }).click();
    await expect(page.getByRole('button', { name: /reading \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /writing \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /speaking \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /listening \(locked\)/i })).toBeVisible();

    await translatorLocked.click();
    const modal = page.getByTestId('locked-feature-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Upgrade required' })).toBeVisible();
    await expect(modal.getByText(/Translator is included in the Senior plan/i)).toBeVisible();
    await expect(modal.getByText('Senior', { exact: true })).toBeVisible();
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
    await page.goto('/curriculum/full');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    await page.goto('/curriculum/memory');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    await page.goto('/vocabulary');
    await expect(page).toHaveURL(/\/vocabulary/, { timeout: 20_000 });
    await page.goto('/grammar');
    await expect(page).toHaveURL(/\/grammar/, { timeout: 20_000 });
  });
});
