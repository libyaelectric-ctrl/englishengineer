import { expect, test } from '@playwright/test';

import { skipIfNoFirebaseTestConfig } from '../helpers/firebase-login';

skipIfNoFirebaseTestConfig();

test.describe('Writing flow', () => {
  test('writing page loads after login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 15000 });
    await page.goto('/writing');
    await expect(page.locator('body')).toContainText(/writing|mission|draft/i);
  });

  test('writing redirects to pricing when not on Master plan', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 15000 });
    await page.goto('/writing');
    await expect(page).toHaveURL(/\/pricing/);
  });
});
