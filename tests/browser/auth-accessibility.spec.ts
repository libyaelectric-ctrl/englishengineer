import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const AUTH_PAGES = [
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
];

test.describe('Auth Pages Accessibility', () => {
  for (const page of AUTH_PAGES) {
    test(`${page.name} page passes WCAG 2.1 AA checks`, async ({ page: p }) => {
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page: p })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test(`${page.name} form inputs have associated labels`, async ({
      page: p,
    }) => {
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page: p })
        .withRules(['label'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test(`${page.name} page has correct heading hierarchy`, async ({
      page: p,
    }) => {
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page: p })
        .withRules(['heading-order'])
        .analyze();

      const seriousViolations = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(seriousViolations).toEqual([]);
    });

    test(`${page.name} page meets color contrast requirements`, async ({
      page: p,
    }) => {
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page: p })
        .withRules(['color-contrast'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test(`${page.name} page is navigable with keyboard`, async ({
      page: p,
    }) => {
      await p.goto(page.path);
      await p.waitForLoadState('networkidle');

      // Tab through interactive elements
      await p.keyboard.press('Tab');
      const firstFocused = await p.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName;
      });

      // First focusable element should be an input, button, or link
      expect(['INPUT', 'BUTTON', 'A', 'SELECT']).toContain(firstFocused);
    });
  }
});
