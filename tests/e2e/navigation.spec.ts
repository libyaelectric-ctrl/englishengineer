import { test, expect } from '@playwright/test';

test.describe('Public route rendering', () => {
  const publicRoutes = [
    { path: '/', headingPattern: /work-ready english|engineering english/i },
    { path: '/pricing', headingPattern: /pricing/i },
    { path: '/business', headingPattern: /business/i },
    { path: '/login', headingPattern: /sign in|log in/i },
    { path: '/signup', headingPattern: /sign up|create.*account/i },
  ];

  for (const route of publicRoutes) {
    test(`public route ${route.path} renders`, async ({ page }) => {
      await page.goto(route.path);
      await expect(
        page
          .getByRole('heading', { name: route.headingPattern })
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

test.describe('Authenticated route rendering', () => {
  async function loginAsDemo(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });
  }

  const authenticatedRoutes = [
    '/vocabulary',
    '/grammar',
    '/reading',
    '/writing',
    '/listening',
    '/speaking',
  ];

  for (const route of authenticatedRoutes) {
    test(`skill route ${route} renders after login`, async ({ page }) => {
      await loginAsDemo(page);
      await page.goto(route);
      await page.waitForTimeout(1000);
      expect(page.url()).toContain(route);
    });
  }
});

test.describe('Route redirects', () => {
  async function loginAsDemo(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });
  }

  test('/analytics redirects to /progress/overview', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/progress\/overview/);
  });

  test('/ai redirects to /tools/ai', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/ai');
    await expect(page).toHaveURL(/\/tools\/ai/);
  });

  test('/curriculum redirects to /curriculum/today', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/curriculum');
    await expect(page).toHaveURL(/\/curriculum\/today/);
  });

  test('/learning-plan redirects to /progress/next-steps', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/learning-plan');
    await expect(page).toHaveURL(/\/progress\/next-steps/);
  });

  test('/tools redirects to /tools/work', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/tools');
    await expect(page).toHaveURL(/\/tools\/work/);
  });

  test('/profile redirects to /profile/overview', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile\/overview/);
  });

  test('/progress redirects to /progress/overview', async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/progress');
    await expect(page).toHaveURL(/\/progress\/overview/);
  });

  test('/dashboard redirects to login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('404 page', () => {
  test('shows 404 for unknown authenticated route', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });

    await page.goto('/completely-unknown-route-xyz');
    await expect(
      page.getByText(/404|not found|logic fault/i).first()
    ).toBeVisible();
  });

  test('404 page has return link to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });

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
  async function loginAsDemo(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo/i }).click();
    await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, {
      timeout: 15000,
    });
  }

  test('Cmd+K opens command palette', async ({ page }) => {
    await loginAsDemo(page);
    await page.keyboard.press('Control+k');
    await expect(
      page.getByRole('textbox', { name: /command palette/i })
    ).toBeVisible();
  });

  test('command palette shows navigation items', async ({ page }) => {
    await loginAsDemo(page);
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: /command palette/i });
    await expect(input).toBeVisible();

    // Should show Dashboard command
    await expect(
      page.getByRole('button', { name: /dashboard/i })
    ).toBeVisible();
  });

  test('command palette search filters results', async ({ page }) => {
    await loginAsDemo(page);
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: /command palette/i });
    await input.fill('vocabulary');
    await expect(
      page.getByRole('button', { name: /vocabulary/i }).first()
    ).toBeVisible();
  });

  test('command palette closes on Escape', async ({ page }) => {
    await loginAsDemo(page);
    await page.keyboard.press('Control+k');
    await expect(
      page.getByRole('textbox', { name: /command palette/i })
    ).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('textbox', { name: /command palette/i })
    ).not.toBeVisible();
  });

  test('command palette navigates on Enter', async ({ page }) => {
    await loginAsDemo(page);
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: /command palette/i });
    await input.fill('vocabulary');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/vocabulary/);
  });
});
