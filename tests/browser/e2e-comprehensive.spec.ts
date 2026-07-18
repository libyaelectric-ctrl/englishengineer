import { test, expect } from '@playwright/test';

const SITE = 'https://englishengineer.vercel.app';

test.describe('Comprehensive E2E', () => {
  test('Landing page loads correctly', async ({ page }) => {
    await page.goto(SITE);
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Engineering English OS/)).toBeVisible();
    await expect(page.getByText(/Start free/i).first()).toBeVisible();
  });

  test('Login flow works', async ({ page }) => {
    await page.goto(SITE + '/login');
    await page.getByRole('button', { name: /try demo mode/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/command center/i)).toBeVisible();
  });

  test('All 6 skill pages load', async ({ page }) => {
    await page.goto(SITE + '/login');
    await page.getByRole('button', { name: /try demo mode/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    const pages = [
      '/vocabulary',
      '/grammar',
      '/reading',
      '/writing',
      '/listening',
      '/speaking',
    ];
    for (const p of pages) {
      await page.goto(SITE + p);
      await page.waitForTimeout(1000);
      expect(page.url()).toContain(p);
    }
  });

  test('Nav2 is visible on skill pages', async ({ page }) => {
    await page.goto(SITE + '/login');
    await page.getByRole('button', { name: /try demo mode/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.goto(SITE + '/vocabulary');
    await page.waitForTimeout(1500);
    const nav2 = page.locator('aside').last();
    await expect(nav2).toBeVisible();
  });

  test('Super user login works', async ({ page }) => {
    await page.goto(SITE + '/login');
    await page
      .getByPlaceholder(/you@example.com/i)
      .fill('catexozcan@gmail.com');
    await page.getByPlaceholder(/•/).fill('123456');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });
    expect(page.url()).not.toContain('/login');
  });

  test('Backend health endpoint works', async ({ page }) => {
    const response = await page.goto(
      'https://englishengineer-production.up.railway.app/api/health'
    );
    const data = await response?.json();
    expect(data?.ok).toBe(true);
    expect(data?.version).toBe('4.0.1');
  });

  test('Profile page loads', async ({ page }) => {
    await page.goto(SITE + '/login');
    await page.getByRole('button', { name: /try demo mode/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.goto(SITE + '/profile/overview');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/profile');
  });

  test('Dark mode toggle exists', async ({ page }) => {
    await page.goto(SITE + '/login');
    await page.getByRole('button', { name: /try demo mode/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(3000);
    // Check if dark mode button exists in the page source
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('dark mode');
  });

  test('Video hero loads on landing', async ({ page }) => {
    await page.goto(SITE);
    await page.waitForTimeout(2000);
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });

  test('Agentic images load on landing', async ({ page }) => {
    await page.goto(SITE);
    await page.waitForTimeout(3000);
    const images = await page.locator('img[src*="agentic"]').count();
    expect(images).toBeGreaterThan(0);
  });
});
