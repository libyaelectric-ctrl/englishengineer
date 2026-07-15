import { test, expect } from '@playwright/test';

test.describe('Chaos Engineering - Resilience Tests', () => {
  test('backend handles network timeout gracefully', async ({ request }) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);

    try {
      await request.get('https://englishengineer-production.up.railway.app/api/health', {
        signal: controller.signal,
      });
    } catch {
      // Expected to timeout
    }
  });

  test('frontend handles API failure gracefully', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('app recovers after page refresh', async ({ page }) => {
    await page.goto('/');
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
  });
});
