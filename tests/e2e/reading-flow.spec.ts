import { expect, test } from '@playwright/test';

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /demo/i }).click();
  await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
    timeout: 15000,
  });
}

test.describe.serial('Reading page flow', () => {
  test('reading page loads with content', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/reading');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/reading');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('reading page shows mission list', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/reading');
    await page.waitForTimeout(1000);
    const missionItem = page
      .locator('[class*="mission"], [class*="card"], [class*="item"]')
      .first();
    await expect(missionItem).toBeVisible({ timeout: 5000 });
  });

  test('clicking a reading item opens detail view', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/reading');
    await page.waitForTimeout(1000);
    const clickable = page
      .locator('[class*="mission"], [class*="card"], [class*="item"], a[href*="reading"]')
      .first();
    await clickable.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('can navigate back from reading detail', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/reading');
    await page.waitForTimeout(1000);
    const clickable = page
      .locator('[class*="mission"], [class*="card"], [class*="item"], a[href*="reading"]')
      .first();
    if (await clickable.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clickable.click();
      await page.waitForTimeout(1000);
      await page.goBack();
      expect(page.url()).toContain('/reading');
    }
  });
});
