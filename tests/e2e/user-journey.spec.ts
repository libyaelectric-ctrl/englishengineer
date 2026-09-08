import { expect, test } from '@playwright/test';

import { skipIfNoFirebaseTestConfig } from '../helpers/firebase-login';

skipIfNoFirebaseTestConfig();

test.describe('Full user journey', () => {
  test('landing → login → dashboard → vocabulary → grammar → profile → tools', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /engineering english os/i })).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });

    const skillsMenu = page.getByRole('button', { name: /^skills$/i });
    if (await skillsMenu.isVisible({ timeout: 3000 }).catch(() => false)) await skillsMenu.click();
    await page.getByRole('link', { name: /^vocabulary$/i }).first().click();
    await page.waitForURL(/\/vocabulary/);
    await expect(page.getByRole('heading', { name: 'Vocabulary', exact: true })).toBeVisible();

    await page.getByRole('link', { name: /^grammar$/i }).first().click();
    await page.waitForURL(/\/grammar/);
    await expect(page.locator('body')).toContainText(/grammar/i);

    const profileMenu = page.getByRole('button', { name: /^profile$/i });
    if (await profileMenu.isVisible({ timeout: 3000 }).catch(() => false))
      await profileMenu.click();
    await page.getByRole('link', { name: /overview/i }).last().click();
    await page.waitForURL(/\/profile\/overview/);

    const toolsMenu = page.getByRole('button', { name: /^tools$/i });
    if (await toolsMenu.isVisible({ timeout: 3000 }).catch(() => false)) await toolsMenu.click();
    const workToolsLink = page.getByRole('link', { name: /work tools/i }).first();
    if (await workToolsLink.isVisible({ timeout: 3000 }).catch(() => false))
      await workToolsLink.click();
    await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
  });

  test('landing CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/');
    const cta = page
      .getByRole('link', { name: /start free/i })
      .or(page.getByRole('link', { name: /get started/i }));
    if (await cta.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cta.first().click();
      await expect(page).toHaveURL(/login|signup|start/);
    }
  });

  test('login page renders the Firebase sign-in form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /e-posta ile devam et/i }).click();
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 20_000 });
  });

  test('signup mode toggles correctly', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.getByRole('link', { name: /kayıt olun/i });
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await page.waitForURL(/\/signup/);
    await expect(page.getByRole('heading', { name: /hesap oluştur/i })).toBeVisible();
  });

  test('dashboard → profile settings and back', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await page.goto('/profile/preferences');
    await page.waitForURL(/\/profile\/preferences/);
    await page.getByRole('link', { name: /home/i }).first().click();
    await page.waitForURL(/\/dashboard/);
  });

  test('sidebar sign out button is visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
