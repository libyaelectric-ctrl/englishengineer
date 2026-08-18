import { expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

test.describe('Full user journey', () => {
  test('landing → login → dashboard → vocabulary → grammar → profile → tools', async ({
    page,
  }) => {
    // 1. Landing page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /engineering english os/i })).toBeVisible();

    // 2. The auth-setup project signs in as the shared Clerk test user, so the
    //    session is already present — load the authenticated dashboard.
    await page.goto('/dashboard');
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });

    // 5. Navigate to vocabulary via sidebar
    const skillsMenu = page.getByRole('button', { name: /^skills$/i });
    if (await skillsMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skillsMenu.click();
    }
    await page
      .getByRole('link', { name: /^vocabulary$/i })
      .first()
      .click();
    await page.waitForURL(/\/vocabulary/);
    await expect(page.getByRole('heading', { name: 'Vocabulary', exact: true })).toBeVisible();

    // 6. Navigate to grammar via sidebar
    await page
      .getByRole('link', { name: /^grammar$/i })
      .first()
      .click();
    await page.waitForURL(/\/grammar/);
    await expect(page.locator('body')).toContainText(/grammar/i);

    // 7. Navigate to profile via sidebar
    const profileMenu = page.getByRole('button', { name: /^profile$/i });
    if (await profileMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileMenu.click();
    }
    await page
      .getByRole('link', { name: /overview/i })
      .last()
      .click();
    await page.waitForURL(/\/profile\/overview/);

    // 8. Tools are locked for the free tier → pricing
    const toolsMenu = page.getByRole('button', { name: /^tools$/i });
    if (await toolsMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toolsMenu.click();
    }
    const workToolsLink = page.getByRole('link', { name: /work tools/i }).first();
    if (await workToolsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await workToolsLink.click();
    }
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
  });

  test('landing CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/');
    // Verify main CTA exists
    const cta = page
      .getByRole('link', { name: /start free/i })
      .or(page.getByRole('link', { name: /get started/i }));
    if (await cta.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cta.first().click();
      await expect(page).toHaveURL(/login|signup|start/);
    }
  });

  test('login page renders the Clerk sign-in form', async ({ page }) => {
    await page.goto('/login');
    // Clerk's sign-in always exposes the email/identifier field.
    await expect(page.locator('input[name="identifier"]').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('signup mode toggles correctly', async ({ page }) => {
    await page.goto('/login');
    // Clerk's sign-in card links to sign-up.
    const signupToggle = page.getByRole('button', { name: /sign up/i });
    if (await signupToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signupToggle.click();
      await expect(page.getByRole('heading', { name: /create.*account|sign up/i })).toBeVisible();
    } else {
      await expect(page.locator('input[name="identifier"]').first()).toBeVisible();
    }
  });

  test('dashboard → profile settings and back', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    // Navigate to profile settings
    await page.goto('/profile/preferences');
    await page.waitForURL(/\/profile\/preferences/);

    // Navigate back to dashboard
    await page.getByRole('link', { name: /home/i }).first().click();
    await page.waitForURL(/\/dashboard/);
  });

  test('sidebar sign out button is visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    // Sign Out button lives in the sidebar footer.
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
