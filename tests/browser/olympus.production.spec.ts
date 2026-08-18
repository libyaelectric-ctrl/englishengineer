import { type Page, expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

const authenticatedPage = async (page: Page, path: string) => {
  await page.goto(path);
};

test.describe('EngineerOS Olympus real browser verification (Clerk + free tier)', () => {

  test('startup, Clerk sign-in, dashboard persistence, and logout', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /master the emails.*rfis.*site meetings/i,
      })
    ).toBeVisible();
    // The auth-setup project signs in as the shared Clerk test user — the
    // session is already present, so the dashboard loads directly.
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByText(/command center/i).first()).toBeVisible();

    // Session persists across reload (Clerk restores the cookie).
    await page.reload();
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
  });

  test('free-tier lock system: preview routes open, locked routes redirect to pricing', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    // Free previews stay open.
    for (const route of ['/vocabulary', '/grammar']) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route), { timeout: 20_000 });
    }

    // Locked features redirect to pricing (menu + URL protection).
    for (const route of ['/reading', '/writing', '/listening', '/speaking', '/placement']) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/pricing/, { timeout: 20_000 });
    }
  });

  test('menu locks render with lock buttons and the upgrade modal explains the plan', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    // Top-level locked items (Translator) and "coming soon" (Team).
    const translator = page.getByRole('button', { name: /translator \(locked\)/i });
    await expect(translator).toBeVisible();
    await expect(page.getByRole('button', { name: /team \(locked\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /team \(locked\)/i }).getByText('Soon')).toBeVisible();

    // Nested skills are locked too.
    await page.getByRole('button', { name: /^skills$/i }).click();
    await expect(page.getByRole('button', { name: /reading \(locked\)/i })).toBeVisible();

    // Clicking a locked item opens the required-plan modal; See plans → /pricing.
    await translator.click();
    const modal = page.getByTestId('locked-feature-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Upgrade required' })).toBeVisible();
    await expect(modal.getByText(/Translator is included in the Senior plan/i)).toBeVisible();
    await modal.getByRole('button', { name: /see plans/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('vocabulary search and add-to-my-vocabulary flow', async ({ page }) => {
    await authenticatedPage(page, '/vocabulary');
    await expect(page.getByRole('heading', { name: 'Vocabulary', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder(/search vocabulary/i)).toBeVisible();

    // Search a known word → results section.
    await page.getByPlaceholder(/search vocabulary/i).fill('compile');
    await page.getByRole('button', { name: /^search$/i }).click();
    await expect(page.getByText(/search results/i).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /reset/i }).click();

    // Unknown word → "add to my vocabulary" form with required fields.
    await page.getByPlaceholder(/search vocabulary/i).fill('olympus-custom-term');
    await page.getByRole('button', { name: /^search$/i }).click();
    const addButton = page.getByRole('button', { name: /add to my vocabulary/i });
    if (await addButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await addButton.click();
      const addForm = page.getByRole('form', { name: 'Add to My Vocabulary' });
      await expect(addForm).toBeVisible();
      await expect(addForm.getByLabel(/turkish meaning/i)).toBeVisible();
      await expect(addForm.getByLabel(/example/i)).toBeVisible();
    }
  });

  test('profile overview renders and navigation shell works', async ({ page }) => {
    await authenticatedPage(page, '/profile/overview');
    await expect(page.getByRole('heading', { name: /profile overview/i })).toBeVisible({
      timeout: 20_000,
    });

    // Sidebar navigation still works from profile.
    await page.goto('/dashboard');
    await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('command palette (Cmd+K) opens and navigates to a free route', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: /command palette/i });
    await expect(input).toBeVisible();
    await input.fill('vocabulary');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/vocabulary/);
  });

  test('dashboard renders on desktop, tablet, and mobile viewports', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    for (const viewport of [
      { width: 1440, height: 1000, label: 'desktop' },
      { width: 900, height: 1100, label: 'tablet' },
      { width: 390, height: 844, label: 'mobile' },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await expect(page.getByText(/command center/i).first()).toBeVisible({ timeout: 20_000 });
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflows, `${viewport.label} should not overflow horizontally`).toBe(false);
    }
  });

  test('404 page shows for unknown routes with a return link', async ({ page }) => {
    await page.goto('/completely-unknown-route-xyz');
    await expect(page.getByText(/404|not found|logic fault/i).first()).toBeVisible();

    const returnLink = page.getByRole('link', { name: /return|command center/i });
    if (await returnLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await returnLink.click();
      await page.waitForURL(/\/dashboard/);
    }
  });
});
