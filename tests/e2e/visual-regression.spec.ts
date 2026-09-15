/**
 * Visual regression tests — screenshot baseline for all main pages.
 *
 * Run: npx playwright test tests/e2e/visual-regression.spec.ts --project=visual-regression
 * Update baselines: npx playwright test tests/e2e/visual-regression.spec.ts --project=visual-regression --update-snapshots
 *
 * URLs are relative so they resolve against Playwright's `baseURL` (the
 * webServer started by playwright.config.ts).
 */
import { type Page, expect, test } from '@playwright/test';

/**
 * The app's `auto` theme mode resolves from the wall clock (light between 07:00
 * and 19:00), so an unpinned run renders a different theme depending on what
 * time of day CI happens to execute. Every committed baseline was captured in
 * dark, so pin the stored mode before the first navigation — otherwise these
 * tests fail purely because of the time of day.
 */
const BASELINE_THEME = 'dark';
const pinTheme = (p: Page) =>
  p.addInitScript((mode) => {
    try {
      localStorage.setItem('engvox-theme-mode', mode);
    } catch {
      /* storage unavailable — the app falls back to its own default */
    }
  }, BASELINE_THEME);

const PUBLIC_PAGES = [
  { name: 'landing', path: '/' },
  { name: 'sign-in', path: '/sign-in' },
  { name: 'sign-up', path: '/sign-up' },
];

test.describe('Visual regression — public pages', () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.name} matches baseline`, async ({ page: p }) => {
      await pinTheme(p);
      await p.goto(page.path, { waitUntil: 'networkidle' });
      await expect(p).toHaveScreenshot(`${page.name}.png`, {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual regression — auth-gated pages (demo mode)', () => {
  test.beforeEach(async ({ page: p }) => {
    await pinTheme(p);
    await p.goto('/login', { waitUntil: 'networkidle' });
    // Dismiss the cookie banner so it cannot intercept onboarding clicks.
    const acceptCookies = p.getByRole('button', { name: /kabul et/i });
    if (await acceptCookies.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptCookies.click();
    }
    // Enter demo mode through the real UI, then complete the onboarding gate.
    await p.getByRole('button', { name: /demo/i }).click();
    await expect(p.getByRole('heading', { name: /set up your learning path/i })).toBeVisible();
    await p.getByRole('button', { name: /architecture design/i }).click();
    await p.getByRole('button', { name: /english english/i }).click();
    await p.getByRole('button', { name: /^next$/i }).click();
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
      await p.goto(pg.path, { waitUntil: 'networkidle' });
      await expect(p).toHaveScreenshot(`${pg.name}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    });
  }
});
