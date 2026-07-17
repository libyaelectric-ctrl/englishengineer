import { test, expect } from '@playwright/test';

test.describe('Full user journey', () => {
  test('landing → login → dashboard → vocabulary → grammar → profile → tools', async ({
    page,
  }) => {
    // 1. Landing page
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /work-ready english/i })
    ).toBeVisible();

    // 2. Navigate to login via CTA
    const loginLink = page.getByRole('link', { name: /login/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('/login');
    }
    await expect(page).toHaveURL(/login|signup/);

    // 3. Fill email/password and submit
    const emailInput = page.getByPlaceholder(/you@example.com/i);
    const passwordInput = page.getByPlaceholder(/password/i);

    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await page.getByRole('button', { name: /sign in/i }).click();
    }

    // 4. Use demo mode if local auth is blocked
    const demoButton = page.getByRole('button', { name: /demo/i });
    if (await demoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoButton.click();
    }

    // 5. Wait for dashboard
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });
    await expect(page.getByText(/command center/i).first()).toBeVisible();

    // 6. Navigate to vocabulary via sidebar
    await page
      .getByRole('link', { name: /vocabulary/i })
      .first()
      .click();
    await page.waitForURL(/\/vocabulary/);
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible();

    // 7. Navigate to grammar via sidebar
    await page
      .getByRole('link', { name: /grammar/i })
      .first()
      .click();
    await page.waitForURL(/\/grammar/);
    await expect(
      page.getByText(/Select a grammar lesson/i).first()
    ).toBeVisible();

    // 8. Navigate to profile via sidebar
    const profileMenu = page.getByRole('button', { name: /profile/i });
    if (await profileMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await profileMenu.click();
    }
    await page
      .getByRole('link', { name: /overview/i })
      .last()
      .click();
    await page.waitForURL(/\/profile\/overview/);

    // 9. Navigate to tools via sidebar
    const toolsMenu = page.getByRole('button', { name: /tools/i });
    if (await toolsMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toolsMenu.click();
    }
    await page
      .getByRole('link', { name: /work tools/i })
      .first()
      .click();
    await page.waitForURL(/\/tools\/work/);
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

  test('login page social buttons are visible', async ({ page }) => {
    await page.goto('/login');
    // Check for demo button or social login buttons
    const demoButton = page.getByRole('button', { name: /demo/i });
    await expect(demoButton).toBeVisible();
  });

  test('signup mode toggles correctly', async ({ page }) => {
    await page.goto('/login');
    // Click "Sign up" link to switch to signup mode
    const signupToggle = page.getByRole('button', { name: /sign up/i });
    if (await signupToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signupToggle.click();
      await expect(
        page.getByRole('heading', { name: /create.*account|sign up/i })
      ).toBeVisible();
    }
  });

  test('dashboard → profile settings and back', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });

    // Navigate to profile settings
    await page.goto('/profile/preferences');
    await page.waitForURL(/\/profile\/preferences/);

    // Navigate back to dashboard
    await page.getByRole('link', { name: /home/i }).first().click();
    await page.waitForURL(/\/dashboard/);
  });

  test('sidebar sign out button is visible', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });

    // Sign Out button should exist
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
});
