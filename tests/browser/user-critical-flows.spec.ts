import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe('Landing Page & Pricing (Unauthenticated)', () => {
    test('navigation to pricing page works', async ({ page }) => {
      await page.goto('/');
      // Removed the fake if(isVisible) assertion. Replaced with unconditional expect.
      const pricingLink = page.locator('a[href="/pricing"]').first();
      await expect(pricingLink).toBeVisible();
      await pricingLink.click();
      await expect(page).toHaveURL(/.*pricing/);
      // Ensure pricing content is actually rendered
      await expect(
        page
          .locator('h1, h2')
          .filter({ hasText: /pricing|plan/i })
          .first()
      ).toBeVisible();
    });
  });

  test.describe('Auth Flow', () => {
    test('login page renders correct inputs', async ({ page }) => {
      await page.goto('/login');
      // Replaced weak body visible check with real input checks
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('signup page renders correct inputs', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Dashboard Security', () => {
    test('dashboard redirects to login when not authenticated', async ({
      page,
    }) => {
      await page.goto('/dashboard');
      // Removed weak OR logic, enforced unconditional redirect assertion
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Vocabulary Flow', () => {
    test('vocabulary page structural integrity', async ({ page }) => {
      await page.goto('/vocabulary');
      // Ensure the page either redirects to login (if guarded) or shows structural UI
      const url = page.url();
      if (url.includes('login')) {
        await expect(page).toHaveURL(/.*login/);
      } else {
        await expect(page.locator('input').first()).toBeVisible();
      }
    });
  });

  test.describe('Health Check', () => {
    test('health endpoint returns valid response', async ({ page }) => {
      const response = await page.goto('http://127.0.0.1:8787/api/health');
      expect(response?.status()).toBe(200);
      const body = await response?.json();
      expect(body.ok).toBe(true);
      expect(body.version).toBeTruthy();
    });
  });
});
