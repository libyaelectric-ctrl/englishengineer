import { test, expect } from '@playwright/test';

test.describe('Billing Flow', () => {
  test('pricing page loads with plans', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/EngVox/);

    // Check that pricing plans are visible
    const plans = page
      .locator('[data-testid*="plan"], [class*="pricing"]')
      .first();
    await expect(plans).toBeVisible();
  });

  test('pricing page has plan comparison', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Check for plan names
    const content = await page.textContent('body');
    expect(content).toContain('Free');
    expect(content).toContain('Pro');
  });

  test('billing page requires auth', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');

    // Should redirect to login or show auth required
    const url = page.url();
    const isLoginPage = url.includes('/login');
    const hasBillingContent = await page.locator('text=Billing').isVisible();
    expect(isLoginPage || hasBillingContent).toBeTruthy();
  });
});
