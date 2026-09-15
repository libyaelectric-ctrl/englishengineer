import { expect, test } from '@playwright/test';

test.describe('Landing page & public routes', () => {
  test('landing page loads with hero, disciplines, and skills sections', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /speak the language of/i,
      })
    ).toBeVisible();

    // Disciplines section (engineering worlds picker)
    await expect(page.getByText(/pick the engineering world you work in/i)).toBeVisible();

    // Skills section
    await expect(page.getByText(/train every skill in one place/i)).toBeVisible();
  });

  test('pricing page loads with all plan tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Junior').first()).toBeVisible();
    await expect(page.getByText('Senior').first()).toBeVisible();
    await expect(page.getByText('Specialist').first()).toBeVisible();
    await expect(page.getByText('Master').first()).toBeVisible();
  });

  test('login page loads with sign-in heading and demo entry', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /giriş yap|ücretsiz başlayın/i })).toBeVisible();
    // Demo button should be present
    await expect(page.getByRole('button', { name: /demo/i })).toBeVisible();
  });

  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get('https://englishengineer-backend.onrender.com/api/health');
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
    await page.reload();
    // Dismiss the cookie banner so it cannot intercept onboarding clicks.
    const acceptCookies = page.getByRole('button', { name: /kabul et/i });
    await acceptCookies.click();
    await page.getByRole('button', { name: /demo/i }).click();

    // First sign-in routes through onboarding: pick a discipline and language.
    await expect(page.getByRole('heading', { name: /set up your learning path/i })).toBeVisible();
    await page.getByRole('button', { name: /architecture design/i }).click();
    await page.getByRole('button', { name: /english english/i }).click();
    await page.getByRole('button', { name: /^next$/i }).click();

    await expect(page.getByText(/command center/i)).toBeVisible();

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
