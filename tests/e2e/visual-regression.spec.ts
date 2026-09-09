/**
 * Visual regression tests — screenshot baseline for all main pages.
 *
 * Run: npx playwright test src/e2e/visual-regression.e2e.test.ts
 * Update baselines: npx playwright test --update-snapshots src/e2e/visual-regression.e2e.test.ts
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

const PUBLIC_PAGES = [
  { name: 'landing', path: '/' },
  { name: 'sign-in', path: '/sign-in' },
  { name: 'sign-up', path: '/sign-up' },
  { name: 'onboard', path: '/onboard' },
];

test.describe('Visual regression — public pages', () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.name} matches baseline`, async ({ page: p }) => {
      await p.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle' });
      await expect(p).toHaveScreenshot(`${page.name}.png`, {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual regression — auth-gated pages (demo mode)', () => {
  test.beforeEach(async ({ page: p }) => {
    // Enter demo mode via onboard flow
    await p.goto(`${BASE_URL}/onboard`, { waitUntil: 'networkidle' });
    // Select discipline and language via JS
    await p.evaluate(() => {
      const sections = document.querySelectorAll('section');
      if (sections.length >= 2) {
        const btns = sections[0]!.querySelectorAll('button');
        if (btns.length > 0) btns[9]!.click();
      }
    });
    await p.waitForTimeout(500);
    await p.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) =>
          b.textContent?.includes('İleri') ||
          b.textContent?.includes('Weiter') ||
          b.textContent?.includes('Next') ||
          b.textContent?.includes('Dalej'),
      );
      if (btn && !btn.disabled) btn.click();
    });
    await p.waitForURL('**/dashboard', { timeout: 15000 });
    await p.waitForLoadState('networkidle');
  });

  const AUTHED_PAGES = [
    { name: 'dashboard', path: '/dashboard' },
    { name: 'vocabulary', path: '/vocabulary' },
    { name: 'grammar', path: '/grammar' },
    { name: 'reading', path: '/reading' },
    { name: 'listening', path: '/listening' },
    { name: 'writing', path: '/writing' },
    { name: 'speaking', path: '/speaking' },
    { name: 'profile', path: '/profile' },
    { name: 'settings', path: '/settings' },
    { name: 'billing', path: '/billing' },
  ];

  for (const pg of AUTHED_PAGES) {
    test(`${pg.name} matches baseline`, async ({ page: p }) => {
      await p.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle' });
      await expect(p).toHaveScreenshot(`${pg.name}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    });
  }
});
