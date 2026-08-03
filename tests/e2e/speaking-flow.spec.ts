import { expect, test } from '@playwright/test';

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /demo/i }).click();
  await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
    timeout: 15000,
  });
}

test.describe.serial('Speaking page flow', () => {
  test('speaking page loads', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/speaking');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/speaking');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('speaking page shows prompts or missions', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/speaking');
    await page.waitForTimeout(1000);
    const content = page.locator(
      '[class*="mission"], [class*="card"], [class*="prompt"], [class*="item"]'
    );
    await expect(content.first()).toBeVisible({ timeout: 5000 });
  });

  test('speaking page has interactive UI elements', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/speaking');
    await page.waitForTimeout(1000);
    const interactiveElement = page.locator(
      'button, a, [role="button"], [class*="card"], [class*="item"]'
    );
    const count = await interactiveElement.count();
    expect(count).toBeGreaterThan(0);
  });
});
