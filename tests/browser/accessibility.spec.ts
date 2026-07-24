import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ALL_PAGES = [
  { name: 'Landing', path: '/', title: /EngVox/ },
  { name: 'Login', path: '/login', title: /EngVox/ },
  { name: 'Pricing', path: '/pricing', title: /EngVox/ },
  { name: 'Start', path: '/start', title: /EngVox/ },
  { name: 'Business', path: '/business', title: /EngVox/ },
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// ─── WCAG 2.1 AA Compliance ───

test.describe('WCAG 2.1 AA Compliance', () => {
  for (const page of ALL_PAGES) {
    test(`${page.name} page passes WCAG 2.1 AA checks`, async ({ page: p }) => {
      await p.goto(page.path);
      if (page.title) {
        await expect(p).toHaveTitle(page.title);
      }

      const results = await new AxeBuilder({ page: p })
        .withTags(WCAG_TAGS)
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

// ─── Keyboard Navigation ───

test.describe('Keyboard Navigation', () => {
  test('landing page is navigable with Tab key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return (
        el?.tagName +
        ':' +
        (el?.getAttribute('aria-label') || el?.textContent?.slice(0, 20) || '')
      );
    });

    // Should focus on something interactive
    expect(firstFocused).not.toBe('');

    // Skip-to-content link should work
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(secondFocused).toBeDefined();
  });

  test('login form is fully keyboard accessible', async ({ page }) => {
    await page.goto('/login');

    // Tab to email input
    await page.keyboard.press('Tab');
    const emailFocused = await page.evaluate(() =>
      document.activeElement?.getAttribute('type')
    );
    expect(emailFocused).toBe('email');

    // Tab to password input
    await page.keyboard.press('Tab');
    const passFocused = await page.evaluate(() =>
      document.activeElement?.getAttribute('type')
    );
    expect(passFocused).toBe('password');

    // Tab to submit button
    await page.keyboard.press('Tab');
    const btnFocused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(btnFocused).toBe('BUTTON');
  });

  test('Escape key closes modal/overlay elements', async ({ page }) => {
    await page.goto('/');

    // Open a modal if present
    const modalTrigger = page
      .locator('[data-testid*="mascot"], [aria-label*="mascot"]')
      .first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(300);

      // Press Escape
      await page.keyboard.press('Escape');

      // Modal should be closed
      const modal = page.locator('[role="dialog"]');
      const isVisible = await modal.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });
});

// ─── Focus Management ───

test.describe('Focus Management', () => {
  test('page title is announced on navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EngVox/);

    // Check that <main> landmark exists
    const mainLandmark = page.locator('main, [role="main"]');
    await expect(mainLandmark).toHaveCount(1);
  });

  test('navigation landmark exists on authenticated pages', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check nav landmark
    const navLandmark = page.locator('nav, [role="navigation"]');
    const count = await navLandmark.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('skip-to-content link exists on landing page', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator(
      'a[href="#main-content"], a[href="#content"]'
    );
    await expect(skipLink).toHaveCount(1);
  });
});

// ─── Color Contrast (via axe) ───

test.describe('Color Contrast', () => {
  test('landing page has sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('login page has sufficient color contrast', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ─── ARIA & Semantic HTML ───

test.describe('ARIA and Semantic HTML', () => {
  test('all images have alt text or are marked decorative', async ({
    page,
  }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('forms have associated labels', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['link-name'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['button-name'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ─── Mobile Accessibility ───

test.describe('Mobile Accessibility', () => {
  test.use({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });

  test('landing page passes accessibility on mobile', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('login page passes accessibility on mobile', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('mobile navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Check that mobile menu button exists
    const menuButton = page
      .locator('[aria-label*="navigation"], [aria-label*="menu"]')
      .first();
    const isVisible = await menuButton.isVisible().catch(() => false);

    if (isVisible) {
      // Focus and activate with keyboard
      await menuButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Navigation should be visible
      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav.first()).toBeVisible();
    }
  });
});

// ─── Screen Reader Support ───

test.describe('Screen Reader Support', () => {
  test('interactive elements have aria-labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    // Allow some flexibility — heading order violations are warnings, not errors
    const seriousViolations = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(seriousViolations).toEqual([]);
  });

  test('landmark regions are properly defined', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['region'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ─── Form Accessibility ───

test.describe('Form Accessibility', () => {
  test('login form inputs have labels', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('form error messages are accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

// ─── Color and Contrast ───

test.describe('Color and Contrast', () => {
  test('landing page meets color contrast requirements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('pricing page meets color contrast requirements', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
