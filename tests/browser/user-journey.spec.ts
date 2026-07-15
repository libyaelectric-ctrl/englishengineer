import { test, expect } from '@playwright/test';

test.describe('Critical User Journey', () => {
  test('landing page loads and navigates to login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await page.click(
      'a[href="/login"], button:has-text("Login"), button:has-text("Sign")'
    );
    await expect(page).toHaveURL(/login|signup/);
  });

  test('landing page shows key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=EngineerOS').first()).toBeVisible();
    await expect(page.locator('text=Pricing').first()).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('dashboard redirects to login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login|onboarding/);
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-route-12345');
    await expect(
      page.locator('text=404, text=Not Found, text=not found').first()
    ).toBeVisible();
  });
});
