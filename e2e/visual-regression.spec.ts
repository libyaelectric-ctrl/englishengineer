/**
 * Visual Regression Tests
 *
 * Captures screenshots of key pages and compares against baseline.
 * Run: npx playwright test e2e/visual-regression.spec.ts --update-snapshots
 */
import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('Visual Regression — Key Pages', () => {
  test('Landing Page — Hero', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    // Wait for animations to settle
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('landing-hero.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Landing Page — Full', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('landing-full.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dashboard Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Pricing Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('pricing.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Vocabulary Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/vocabulary`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('vocabulary.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Grammar Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/grammar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('grammar.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Not Found Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('not-found.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe('Visual Regression — Dark Mode', () => {
  test.use({ colorScheme: 'dark' });

  test('Landing Page — Dark', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('landing-dark.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Dashboard — Dark', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe('Visual Regression — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Landing Page — Mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('landing-mobile.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Dashboard — Mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });
});
