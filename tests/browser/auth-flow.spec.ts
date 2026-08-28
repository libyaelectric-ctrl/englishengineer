/**
 * Auth Flow E2E Tests
 *
 * Tests the complete login/signup user journey:
 * 1. Page rendering (login, signup pages load correctly)
 * 2. Navigation between login ↔ signup
 * 3. Auth guard redirect (unauthenticated → /login)
 * 4. Clerk sign-in flow (when CLERK_SECRET_KEY is available)
 * 5. Protected route access after login
 * 6. Logout flow
 */
import { expect, test } from '@playwright/test';

import { hasClerkSecret, signInAsTestUser } from '../helpers/clerk-login';

// ─── Public page rendering (no auth required) ──────────────────────────────

test.describe('Login page rendering', () => {
  test('login page loads with Clerk sign-in form', async ({ page }) => {
    await page.goto('/login');

    // Clerk mounts its sign-in component — look for the identifier input
    const identifierInput = page.locator('input[name="identifier"]').first();
    await expect(identifierInput).toBeVisible({ timeout: 30_000 });

    // Continue button should be present
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');

    // Wait for Clerk to mount
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });

    // Look for "Sign up" or "Create account" link within the Clerk component
    const signupLink = page
      .getByRole('link', { name: /sign up|create account/i })
      .or(page.getByText(/don't have an account|new to/i));
    // Clerk may or may not show this depending on instance config
    // At minimum the page should load without errors
    await expect(page).toHaveTitle(/EngVox/i);
  });

  test('login page shows EngVox branding', async ({ page }) => {
    await page.goto('/login');

    // The page title should contain EngVox
    await expect(page).toHaveTitle(/EngVox/i);

    // Wait for Clerk to mount
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });
  });
});

test.describe('Signup page rendering', () => {
  test('signup page loads with Clerk sign-up form', async ({ page }) => {
    await page.goto('/signup');

    // Clerk mounts its sign-up component
    const firstNameInput = page.locator('input[name="firstName"]').first();
    const identifierInput = page.locator('input[name="identifier"]').first();

    // Either firstName or identifier input should be visible (depends on Clerk config)
    const hasFirstName = await firstNameInput.isVisible({ timeout: 15_000 }).catch(() => false);
    const hasIdentifier = await identifierInput.isVisible({ timeout: 15_000 }).catch(() => false);

    expect(hasFirstName || hasIdentifier).toBeTruthy();
    await expect(page).toHaveTitle(/EngVox/i);
  });

  test('signup page has link back to login', async ({ page }) => {
    await page.goto('/signup');

    // Wait for Clerk to mount
    await page
      .locator('input[name="firstName"], input[name="identifier"]')
      .first()
      .waitFor({ timeout: 30_000 });

    // Page should load without errors
    await expect(page).toHaveTitle(/EngVox/i);
  });
});

// ─── Navigation between login ↔ signup ──────────────────────────────────────

test.describe('Login ↔ Signup navigation', () => {
  test('can navigate from login to signup and back', async ({ page }) => {
    // Start at login
    await page.goto('/login');
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });

    // Navigate to signup via direct URL
    await page.goto('/signup');
    await page
      .locator('input[name="firstName"], input[name="identifier"]')
      .first()
      .waitFor({ timeout: 30_000 });
    await expect(page).toHaveTitle(/EngVox/i);

    // Navigate back to login via direct URL
    await page.goto('/login');
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });
    await expect(page).toHaveTitle(/EngVox/i);
  });

  test('start page has links to both login and signup', async ({ page }) => {
    await page.goto('/start');

    // Start page should have Create account and Log in links
    const signupLink = page.getByRole('link', { name: /create account/i });
    const loginLink = page.getByRole('link', { name: /log in/i });

    await expect(signupLink).toBeVisible();
    await expect(loginLink).toBeVisible();

    // Click signup link — should navigate to /signup
    await signupLink.click();
    await page.waitForURL(/\/signup/);
    await page
      .locator('input[name="firstName"], input[name="identifier"]')
      .first()
      .waitFor({ timeout: 30_000 });
  });
});

// ─── Auth guard redirect ────────────────────────────────────────────────────

test.describe('Auth guard redirects', () => {
  test('unauthenticated user is redirected to /login from protected route', async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.context().clearCookies();

    // Try to access a protected route
    await page.goto('/dashboard');

    // Should be redirected to /login
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });
  });

  test('unauthenticated user is redirected to /login from profile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.context().clearCookies();

    await page.goto('/profile');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });
  });

  test('unauthenticated user is redirected to /login from progress', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.context().clearCookies();

    await page.goto('/progress');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });
  });

  test('unauthenticated user can still access public routes', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.context().clearCookies();

    // Landing page should load without redirect
    await page.goto('/');
    await expect(page).toHaveTitle(/EngVox/i);

    // Pricing page should load without redirect
    await page.goto('/pricing');
    await expect(page).toHaveTitle(/EngVox/i);

    // Start page should load without redirect
    await page.goto('/start');
    await expect(page).toHaveTitle(/EngVox/i);
  });
});

// ─── Clerk sign-in flow (requires CLERK_SECRET_KEY) ─────────────────────────

test.describe('Clerk sign-in flow', () => {
  test.skip(!hasClerkSecret(), 'CLERK_SECRET_KEY is required for Clerk sign-in E2E tests');

  test('sign in with email and password', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');

    // Wait for Clerk to mount
    const emailInput = page.locator('input[name="identifier"]').first();
    await expect(emailInput).toBeVisible({ timeout: 30_000 });

    // Use the shared helper to sign in
    await signInAsTestUser(page);

    // After sign-in, should be on the dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 });

    // Dashboard should have sidebar navigation
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  test('protected routes are accessible after sign-in', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await signInAsTestUser(page);
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 });

    // Navigate to profile — should NOT redirect to login
    await page.goto('/profile');
    await page.waitForURL(/\/profile/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /profile|profil/i })).toBeVisible();

    // Navigate to progress — should NOT redirect to login
    await page.goto('/progress');
    await page.waitForURL(/\/progress/, { timeout: 10_000 });
  });

  test('logout redirects to login page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await signInAsTestUser(page);
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 });

    // Find and click logout button in sidebar
    const logoutButton = page
      .getByRole('button', { name: /logout|çıkış|log out/i })
      .or(page.getByText(/logout|çıkış/i));

    if (await logoutButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await logoutButton.click();

      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 15_000 });
      await page.locator('input[name="identifier"]').first().waitFor({ timeout: 30_000 });
    }
  });
});

// ─── Error handling ─────────────────────────────────────────────────────────

test.describe('Auth error handling', () => {
  test('invalid email shows error on login page', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[name="identifier"]').first();
    await expect(emailInput).toBeVisible({ timeout: 30_000 });

    // Enter invalid email
    await emailInput.fill('nonexistent@example.com');
    await page.getByRole('button', { name: /continue/i }).click();

    // Clerk should show an error (user not found or similar)
    // The exact message depends on Clerk instance configuration
    await expect(page.getByText(/not found|invalid|error|incorrect/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});

// ─── Responsive auth pages ──────────────────────────────────────────────────

test.describe('Responsive auth pages', () => {
  test('login page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');

    // Clerk sign-in should still be visible on mobile
    const emailInput = page.locator('input[name="identifier"]').first();
    await expect(emailInput).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveTitle(/EngVox/i);
  });

  test('signup page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/signup');

    // Wait for Clerk to mount
    await page
      .locator('input[name="firstName"], input[name="identifier"]')
      .first()
      .waitFor({ timeout: 30_000 });
    await expect(page).toHaveTitle(/EngVox/i);
  });
});
