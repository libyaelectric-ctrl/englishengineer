import { type Page, expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

const expectNoHorizontalOverflow = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
};

test.describe('mobile-first learning shell', () => {
  test('phone opens Grammar without overflow and keeps navigation dismissible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/grammar');
    await expect(page.getByRole('heading', { name: 'Grammar', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Search rules...')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const sidebar = page.getByTestId('app-sidebar');
    const closedBox = await sidebar.boundingBox();
    expect(closedBox ? closedBox.x + closedBox.width : 0).toBeLessThanOrEqual(0);
    await page.getByLabel('Toggle navigation sidebar').click();
    await expect(page.getByRole('link', { name: 'Grammar' })).toBeVisible();
    await page.getByRole('link', { name: 'Grammar' }).click();
    await expect
      .poll(async () => {
        const reopenedBox = await sidebar.boundingBox();
        return reopenedBox ? reopenedBox.x + reopenedBox.width : 0;
      })
      .toBeLessThanOrEqual(0);

    // /curriculum/memory is locked for the free tier → pricing.
    await page.goto('/curriculum/memory');
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    await expectNoHorizontalOverflow(page);
  });

  test('tablet dashboard remains within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/dashboard');
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });
    await expectNoHorizontalOverflow(page);
  });
});
