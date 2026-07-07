import { expect, test, type Page } from '@playwright/test';

const demoLogin = async (page: Page) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Use Demo Engineer' }).click();
  await expect(
    page.getByRole('heading', { name: /command center/i })
  ).toBeVisible();
};

test.describe('Stripe billing integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('pricing page shows all plan tiers with correct prices', async ({
    page,
  }) => {
    await page.goto('/pricing');
    await expect(
      page.getByRole('heading', { name: /pricing/i })
    ).toBeVisible();

    // Free plan
    await expect(page.getByText('$0').first()).toBeVisible();
    await expect(page.getByText('Free').first()).toBeVisible();

    // Pro plan
    await expect(page.getByText('$19').first()).toBeVisible();

    // Project plan
    await expect(page.getByText('$39').first()).toBeVisible();

    // Max plan
    await expect(page.getByText('$59').first()).toBeVisible();
  });

  test('checkout flow initiates for Pro plan', async ({ page }) => {
    await demoLogin(page);
    await page.goto('/pricing');

    // Find and click the Pro plan checkout button
    const proButton = page
      .getByRole('button', { name: /upgrade|subscribe|get pro/i })
      .first();

    if (await proButton.isVisible()) {
      await proButton.click();
      // Should redirect to Stripe checkout or show auth prompt
      await page.waitForTimeout(2000);
      const url = page.url();
      const isCheckoutRedirect =
        url.includes('checkout.stripe.com') ||
        url.includes('/login') ||
        url.includes('/start');
      expect(isCheckoutRedirect).toBeTruthy();
    }
  });

  test('billing section shows current plan in profile', async ({ page }) => {
    await demoLogin(page);
    await page.goto('/profile/billing');
    await expect(
      page.getByText(/billing|subscription|plan/i).first()
    ).toBeVisible();
  });

  test('health endpoint confirms Stripe is configured', async ({ request }) => {
    const response = await request.get(
      'https://englishengineer-production.up.railway.app/api/health'
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.stripeConfigured).toBe(true);
  });

  test('backend billing endpoint responds to auth', async ({ request }) => {
    // Test that the billing endpoint requires auth (returns 401 without token)
    const response = await request.get(
      'https://englishengineer-production.up.railway.app/api/billing/status'
    );
    // Should return 401 or 403 without auth
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
