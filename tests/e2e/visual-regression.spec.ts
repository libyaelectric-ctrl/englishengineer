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

import { VOCABULARY_SEED_FIXTURE } from './fixtures/vocabulary.seed';

/**
 * The app's `auto` theme mode follows the OS `prefers-color-scheme`, and
 * headless Chromium reports light by default — but every committed baseline was
 * captured in dark. Pin the stored mode before the first navigation so the
 * rendered palette matches the baseline regardless of the host/CI setting.
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

/**
 * The vocabulary page fetches its terms at runtime from
 * `public/data/vocabulary/*.json`. Those files are gitignored build artifacts
 * served from storage in production, so a CI checkout has none of them and the
 * page renders its empty state while a developer machine renders the full card
 * grid — the same code, two different screenshots. Serve one small committed
 * fixture instead so the baseline covers the populated layout and renders
 * identically everywhere. Shard files beyond the first stay empty, since the
 * loader concatenates every shard of a level.
 */
const stubVocabularyData = (p: Page) =>
  // `*.json` keeps this to the fetched seed files; a broader glob would also
  // intercept Vite's dev-server request for the `src/data/vocabulary` module.
  p.route('**/data/vocabulary/*.json', (route) => {
    const isExtraShard = /\.seed-\d+\.json$/.test(route.request().url());
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isExtraShard ? [] : VOCABULARY_SEED_FIXTURE),
    });
  });

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
    await stubVocabularyData(p);
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
