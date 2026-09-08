import { expect, test } from '@playwright/test';

import { skipIfNoFirebaseTestConfig } from '../helpers/firebase-login';

skipIfNoFirebaseTestConfig();

const API_BASE = process.env.BACKEND_URL || 'http://localhost:8787';

test.describe('Stripe billing integration', () => {
  test('pricing page shows plan tiers with current prices', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/pricing plans/i).first()).toBeVisible();
    await expect(page.getByText('$0').first()).toBeVisible();
    await expect(page.getByText('Free', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('$29').first()).toBeVisible();
    await expect(page.getByText('$59').first()).toBeVisible();
    await expect(page.getByText('$99').first()).toBeVisible();
  });

  test('checkout flow initiates for a paid plan', async ({ page }) => {
    await page.goto('/pricing');
    const planButton = page
      .getByRole('button', { name: /upgrade|subscribe|choose|get started|start/i })
      .first();
    if (await planButton.isVisible()) {
      await planButton.click();
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(
        url.includes('checkout.') || url.includes('/login') || url.includes('/start')
      ).toBeTruthy();
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
    const response = await request.post(`${API_BASE}/api/billing/create-checkout-session`, {
      data: {
        email: 'test@test.com',
        successUrl: 'http://localhost',
        cancelUrl: 'http://localhost',
      },
    });
    expect(response.status()).toBe(401);
  });
});
