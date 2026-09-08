/**
 * Firebase auth flow E2E coverage.
 *
 * Public rendering and auth-guard tests run without credentials. Authenticated
 * tests use the configured Firebase test project through the shared helper.
 */
import { expect, test, type Page } from '@playwright/test';

import { hasFirebaseTestConfig, signInAsTestUser } from '../helpers/firebase-login';

const expectAuthLanding = async (page: Page) => {
  await expect(page.getByRole('heading', { name: /giriş yap|hesap oluştur/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /e-posta ile devam et/i })).toBeVisible();
};

test.describe('Firebase auth pages', () => {
  test('login page renders the Firebase email/password entry point', async ({ page }) => {
    await page.goto('/login');
    await expectAuthLanding(page);
    await expect(page).toHaveTitle(/EngVox/i);
    await expect(page.getByRole('link', { name: /kayıt olun/i })).toBeVisible();
  });

  test('signup page renders the Firebase account form entry point', async ({ page }) => {
    await page.goto('/signup');
    await expectAuthLanding(page);
    await expect(page.getByRole('link', { name: /giriş yapın/i })).toBeVisible();
  });

  test('email forms expose native email and password controls', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /e-posta ile devam et/i }).click();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('Auth guard redirects', () => {
  for (const route of ['/dashboard', '/profile', '/progress']) {
    test(`unauthenticated user is redirected from ${route}`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.context().clearCookies();
      await page.goto(route);
      await page.waitForURL(/\/login/, { timeout: 15_000 });
      await expectAuthLanding(page);
    });
  }

  test('public routes remain accessible', async ({ page }) => {
    for (const route of ['/', '/pricing', '/start']) {
      await page.goto(route);
      await expect(page).toHaveTitle(/EngVox/i);
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});

test.describe('Firebase sign-in flow', () => {
  test.skip(
    !hasFirebaseTestConfig(),
    'Firebase E2E test project credentials are required for authenticated auth tests'
  );

  test('signs in with email and password', async ({ page }) => {
    await signInAsTestUser(page);
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  test('allows protected routes after sign-in', async ({ page }) => {
    await signInAsTestUser(page);
    await page.goto('/profile');
    await page.waitForURL(/\/profile/, { timeout: 10_000 });
    await page.goto('/progress');
    await page.waitForURL(/\/progress/, { timeout: 10_000 });
  });

  test('logout returns to the login page', async ({ page }) => {
    await signInAsTestUser(page);
    const logout = page
      .getByRole('button', { name: /logout|çıkış|log out/i })
      .or(page.getByText(/logout|çıkış/i))
      .first();
    await expect(logout).toBeVisible({ timeout: 10_000 });
    await logout.click();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await expectAuthLanding(page);
  });
});
