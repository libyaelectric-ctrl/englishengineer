import { expect, test } from '@playwright/test';

test.describe('history routing', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of ['/pricing', '/business', '/legal/privacy', '/login']) {
    test(`loads and refreshes ${path} without a hash`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}(?:[?#]|$)`));
      expect(new URL(page.url()).hash).toBe('');

      await page.reload();
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}(?:[?#]|$)`));
    });
  }

  test('keeps auth callback query parameters on direct load and refresh', async ({ page }) => {
    await page.goto('/login?mode=callback&oobCode=test-code');
    await expect(page).toHaveURL(/\/login\?mode=callback&oobCode=test-code$/);
    await page.reload();
    await expect(page).toHaveURL(/\/login\?mode=callback&oobCode=test-code$/);
  });
});
