import { test, expect } from '@playwright/test';

test.describe('Grammar Flow', () => {
  test('grammar page loads', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForLoadState('networkidle');

    // Check page loads without error
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('grammar page has lesson structure', async ({ page }) => {
    await page.goto('/grammar');
    await page.waitForLoadState('networkidle');

    // Check for grammar-related content
    const content = await page.textContent('body');
    const hasGrammarContent =
      content?.includes('Grammar') ||
      content?.includes('lesson') ||
      content?.includes('rule');
    expect(hasGrammarContent).toBeTruthy();
  });
});
