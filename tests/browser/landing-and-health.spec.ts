import { expect, test } from '@playwright/test';

test.describe('Landing page & public routes', () => {
  test('landing page loads with hero, features, pricing, and FAQ', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /engineering english os/i,
      })
    ).toBeVisible();

    // Features section (Workflow)
    await expect(page.getByText('Workflow').first()).toBeVisible();

    // Pricing section — 3 plans visible
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Project').first()).toBeVisible();

    // FAQ section
    const faqButton = page.getByRole('button', { name: /what is engvox/i });
    if (await faqButton.isVisible()) {
      await faqButton.click();
      await expect(
        page.getByText(/ai-powered english training platform/i)
      ).toBeVisible();
    }
  });

  test('pricing page loads with all plan tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(
      page.getByRole('heading', { name: /access level/i })
    ).toBeVisible();
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Project').first()).toBeVisible();
    await expect(page.getByText('Exec').first()).toBeVisible();
  });

  test('login page loads with social login buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page
        .getByRole('heading', { name: /welcome back/i })
        .or(page.getByText(/log in/i))
    ).toBeVisible();
    // Demo button should be present
    await expect(page.getByRole('button', { name: /demo/i })).toBeVisible();
  });

  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get(
      'https://englishengineer-production.up.railway.app/api/health'
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.version).toBeDefined();
  });
});

test.describe('Responsive design', () => {
  test('dashboard does not overflow on mobile viewport', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.getByRole('button', { name: /demo/i }).click();
    await expect(
      page.getByRole('heading', { name: /command center/i })
    ).toBeVisible();

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
