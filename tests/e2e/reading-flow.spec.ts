import { expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

// Reading is a Senior-tier feature: the free-tier test user is redirected to
// the pricing page both from the menu and from direct URL access.
test.describe.serial('Reading page flow (free tier)', () => {
  test('free-tier user is redirected from /reading to /pricing', async ({ page }) => {
    await page.goto('/reading');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
  });

  test('reading stays locked from the dashboard sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: /^skills$/i }).click();
    await expect(page.getByRole('button', { name: /reading \(locked\)/i })).toBeVisible();
  });
});
