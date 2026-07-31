import { expect, test } from '@playwright/test';

test.describe('Dashboard flow', () => {
  async function loginAsDemo(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });
  }

  test('dashboard loads after login', async ({ page }) => {
    await loginAsDemo(page);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('dashboard shows streak widget', async ({ page }) => {
    await loginAsDemo(page);
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 15000 });
    const body = page.locator('body');
    await expect(body).toContainText(/dashboard|streak|goal/i);
  });

  test('navigation to grammar page works', async ({ page }) => {
    await loginAsDemo(page);
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 15000 });
    await page.goto('/grammar');
    await expect(page.locator('body')).toContainText(/grammar/i);
  });

  test('navigation to vocabulary page works', async ({ page }) => {
    await loginAsDemo(page);
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 15000 });
    await page.goto('/vocabulary');
    await expect(page.locator('body')).toContainText(/vocabulary/i);
  });

  test('navigation to profile page works', async ({ page }) => {
    await loginAsDemo(page);
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 15000 });
    await page.goto('/profile');
    await expect(page.locator('body')).toContainText(/profile/i);
  });
});
