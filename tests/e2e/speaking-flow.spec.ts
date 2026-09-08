import { expect, test } from '@playwright/test';

import { skipIfNoFirebaseTestConfig } from '../helpers/firebase-login';

skipIfNoFirebaseTestConfig();

test.describe.serial('Speaking page flow (free tier)', () => {
  test('free-tier user is redirected from /speaking to /pricing', async ({ page }) => {
    await page.goto('/speaking');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
  });

  test('speaking stays locked from the dashboard sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: /^skills$/i }).click();
    await expect(page.getByRole('button', { name: /speaking \(locked\)/i })).toBeVisible();
  });
});
