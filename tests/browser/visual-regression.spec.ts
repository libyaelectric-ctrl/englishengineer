import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('landing page snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('landing-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('pricing page snapshot', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('pricing-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('login page snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
