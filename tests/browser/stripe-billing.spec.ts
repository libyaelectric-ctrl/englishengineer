import { expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

const API_BASE = process.env.BACKEND_URL || 'http://localhost:8787';

test.describe('Stripe billing integration', () => {
  test('pricing page shows plan tiers with current prices', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/pricing plans/i).first()).toBeVisible();

    // Free plan
    await expect(page.getByText('$0').first()).toBeVisible();
    await expect(page.getByText('Free', { exact: true }).first()).toBeVisible();

    // Paid tiers (billing catalog: Junior $29, Senior $59, Master $99)
    await expect(page.getByText('$29').first()).toBeVisible();
    await expect(page.getByText('$59').first()).toBeVisible();
    await expect(page.getByText('$99').first()).toBeVisible();
  });

  test('checkout flow initiates for a paid plan', async ({ page }) => {
    await page.goto('/pricing');

    // Find and click a plan checkout button (naming differs per plan)
    const planButton = page
      .getByRole('button', { name: /upgrade|subscribe|choose|get started|start/i })
      .first();

    if (await planButton.isVisible()) {
      await planButton.click();
      // Should redirect to a checkout/portal or show a demo-blocked message
      await page.waitForTimeout(2000);
      const url = page.url();
      const isCheckoutRedirect =
        url.includes('checkout.') || url.includes('/login') || url.includes('/start');
      expect(isCheckoutRedirect).toBeTruthy();
    }
  });

  test('billing section shows current plan in profile', async ({ page }) => {
    await page.goto('/profile/billing');
    await expect(page.getByText(/billing|subscription|plan/i).first()).toBeVisible();
  });

  test('health endpoint confirms billing provider check exists', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBeDefined();
    expect(body.checks?.stripe).toBeDefined();
  });

  test('backend billing endpoint responds to auth', async ({ request }) => {
    // Test that the billing endpoint requires auth (returns 401 without token)
    const response = await request.post(`${API_BASE}/api/billing/create-checkout-session`, {
      data: {
        email: 'test@test.com',
        successUrl: 'http://localhost',
        cancelUrl: 'http://localhost',
      },
    });
    // Should return 401 without auth
    expect(response.status()).toBe(401);
  });
});
