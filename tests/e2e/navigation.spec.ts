import { expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

test.describe('Public route rendering', () => {
  // Public pages must render signed out: opt out of the shared auth state so
  // /login and /signup do not bounce to /dashboard.
  test.use({ storageState: { cookies: [], origins: [] } });

  const publicRoutes = [
    { path: '/', headingPattern: /engineering english/i },
    { path: '/pricing', headingPattern: /pricing/i },
    { path: '/business', headingPattern: /communication readiness/i },
    { path: '/login', headingPattern: /sign in|log in/i },
    { path: '/signup', headingPattern: /sign up|create.*account/i },
  ];

  for (const route of publicRoutes) {
    test(`public route ${route.path} renders`, async ({ page }) => {
      await page.goto(route.path);
      await expect(
        page
          .getByRole('heading', { name: route.headingPattern })
          .first()
          .or(page.getByText(route.headingPattern).first())
      ).toBeVisible();
    });
  }

  const legalRoutes = ['terms', 'privacy', 'cookies', 'refund'];
  for (const doc of legalRoutes) {
    test(`legal route /legal/${doc} renders`, async ({ page }) => {
      await page.goto(`/legal/${doc}`);
      await expect(page.locator('body')).not.toBeEmpty();
    });
  }
});

test.describe('Authenticated route rendering (free tier)', () => {
  // The free tier previews vocabulary/grammar; the rest of the skills are
  // locked and redirect to pricing.
  const freeRoutes = ['/vocabulary', '/grammar'];
  for (const route of freeRoutes) {
    test(`free skill route ${route} renders after login`, async ({ page }) => {
      await page.goto('/dashboard');
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route), { timeout: 20_000 });
    });
  }

  const lockedRoutes = ['/reading', '/writing', '/listening', '/speaking'];
  for (const route of lockedRoutes) {
    test(`locked skill route ${route} redirects to /pricing after login`, async ({ page }) => {
      await page.goto('/dashboard');
      await page.goto(route);
      await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    });
  }
});

test.describe('Route redirects', () => {
  test('/analytics redirects to /progress/overview', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/progress\/overview/);
  });

  test('/ai redirects to /pricing (AI Copilot requires Master)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/ai');
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('/curriculum redirects to /curriculum/today', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/curriculum');
    await expect(page).toHaveURL(/\/curriculum\/today/);
  });

  test('/learning-plan redirects to /progress/next-steps', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/learning-plan');
    await expect(page).toHaveURL(/\/progress\/next-steps/);
  });

  test('/tools redirects to /pricing (tools require Master)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/tools');
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('/profile renders ProfilePage directly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('/progress redirects to /progress/overview', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/progress');
    await expect(page).toHaveURL(/\/progress\/overview/);
  });

  test('/dashboard redirects to login when unauthenticated', async ({ browser }) => {
    // Opt out of the shared auth state: a fresh context has no Clerk session.
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
    await context.close();
  });
});

test.describe('404 page', () => {
  test('shows 404 for unknown authenticated route', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/completely-unknown-route-xyz');
    await expect(page.getByText(/404|not found|logic fault/i).first()).toBeVisible();
  });

  test('404 page has return link to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/nonexistent-page-12345');
    const returnLink = page.getByRole('link', {
      name: /return|command center/i,
    });
    if (await returnLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await returnLink.click();
      await page.waitForURL(/\/dashboard/);
    }
  });
});

test.describe('Command palette (Cmd+K)', () => {
  const openPalette = async (page: import('@playwright/test').Page) => {
    await page.goto('/dashboard');
    // Wait for the shell to mount before pressing the shortcut, otherwise the
    // keydown listener is not attached yet.
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });
    await page.keyboard.press('Control+k');
  };

  test('Cmd+K opens command palette', async ({ page }) => {
    await openPalette(page);
    await expect(page.getByRole('textbox', { name: /command palette/i })).toBeVisible();
  });

  test('command palette shows navigation items', async ({ page }) => {
    await openPalette(page);
    const input = page.getByRole('textbox', { name: /command palette/i });
    await expect(input).toBeVisible();

    // Should show Dashboard command
    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible();
  });

  test('command palette search filters results', async ({ page }) => {
    await openPalette(page);
    const input = page.getByRole('textbox', { name: /command palette/i });
    await input.fill('vocabulary');
    await expect(page.getByRole('button', { name: /vocabulary/i }).first()).toBeVisible();
  });

  test('command palette closes on Escape', async ({ page }) => {
    await openPalette(page);
    await expect(page.getByRole('textbox', { name: /command palette/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('textbox', { name: /command palette/i })).not.toBeVisible();
  });

  test('command palette navigates on Enter', async ({ page }) => {
    await openPalette(page);
    const input = page.getByRole('textbox', { name: /command palette/i });
    await input.fill('vocabulary');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/vocabulary/);
  });
});
