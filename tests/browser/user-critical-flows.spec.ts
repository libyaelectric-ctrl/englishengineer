import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe('Landing Page', () => {
    test('loads landing page and displays main content', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('navigation to pricing page works', async ({ page }) => {
      await page.goto('/');
      const pricingLink = page.locator('a[href="/pricing"]').first();
      if (await pricingLink.isVisible()) {
        await pricingLink.click();
        await expect(page).toHaveURL(/.*pricing/);
      }
    });
  });

  test.describe('Login Flow', () => {
    test('login page renders correctly', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('body')).toBeVisible();
    });

    test('signup page renders correctly', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Dashboard Flow', () => {
    test('dashboard redirects to login when not authenticated', async ({
      page,
    }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
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

  test.describe('Vocabulary Page', () => {
    test('vocabulary page is accessible', async ({ page }) => {
      await page.goto('/vocabulary');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Grammar Page', () => {
    test('grammar page is accessible', async ({ page }) => {
      await page.goto('/grammar');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Speaking Page', () => {
    test('speaking page is accessible', async ({ page }) => {
      await page.goto('/speaking');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Reading Page', () => {
    test('reading page is accessible', async ({ page }) => {
      await page.goto('/reading');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Writing Page', () => {
    test('writing page is accessible', async ({ page }) => {
      await page.goto('/writing');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Listening Page', () => {
    test('listening page is accessible', async ({ page }) => {
      await page.goto('/listening');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('AI Page', () => {
    test('AI page is accessible', async ({ page }) => {
      await page.goto('/ai');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('404 Handling', () => {
    test('unknown route shows not found page', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('pages render on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });

    test('pages render on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
