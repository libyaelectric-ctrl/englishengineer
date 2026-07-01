import { expect, test, type Page } from '@playwright/test';

const loginDemo = async (page: Page) => {
  await page.goto('/start');
  await page.getByRole('button', { name: 'Try Lite' }).click();
  await page.getByRole('button', { name: 'Explore now at A1' }).click();
};

const expectNoHorizontalOverflow = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
};

test.describe('mobile-first learning shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('phone opens Grammar without overflow and keeps navigation dismissible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginDemo(page);
    await page.goto('/grammar');
    await expect(
      page.getByRole('heading', { name: 'Grammar Workspace' })
    ).toBeVisible();
    await expect(page.getByText('Lesson 1', { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const sidebar = page.getByTestId('app-sidebar');
    const closedBox = await sidebar.boundingBox();
    expect(closedBox ? closedBox.x + closedBox.width : 0).toBeLessThanOrEqual(
      0
    );
    await page.getByLabel('Toggle navigation sidebar').click();
    await expect(page.getByRole('link', { name: 'Grammar' })).toBeVisible();
    await page.getByRole('link', { name: 'Grammar' }).click();
    await expect
      .poll(async () => {
        const reopenedBox = await sidebar.boundingBox();
        return reopenedBox ? reopenedBox.x + reopenedBox.width : 0;
      })
      .toBeLessThanOrEqual(0);

    await page.goto('/curriculum');
    await expect(
      page.getByRole('heading', { name: 'Learning Hub' })
    ).toBeVisible();
    await expect(page.getByText('Unified Review Queue')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('tablet dashboard remains within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await loginDemo(page);
    await page.goto('/dashboard');
    await expect(
      page.getByRole('heading', { name: /Mission Control/i })
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
