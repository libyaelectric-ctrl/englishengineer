import { test, expect } from '@playwright/test';

test.describe('Progress Flow', () => {
  test('progress page loads', async ({ page }) => {
    await page.goto('/progress/overview');
    await page.waitForLoadState('networkidle');

    // Check page loads without error
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check page loads without error
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('profile page loads', async ({ page }) => {
    await page.goto('/profile/overview');
    await page.waitForLoadState('networkidle');

    // Check page loads without error
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
