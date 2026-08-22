import { checkA11y, injectAxe } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('home page has no critical violations', async ({ page }) => {
    await checkA11y(page, undefined, {
      detailedReport: true,
      includedImpacts: ['critical', 'serious'],
    });
  });

  test('dashboard page has no critical violations', async ({ page }) => {
    await page.goto('/dashboard');
    await checkA11y(page, undefined, {
      detailedReport: true,
      includedImpacts: ['critical', 'serious'],
    });
  });

  test('vocabulary page has no critical violations', async ({ page }) => {
    await page.goto('/vocabulary');
    await checkA11y(page, undefined, {
      detailedReport: true,
      includedImpacts: ['critical', 'serious'],
    });
  });
});
