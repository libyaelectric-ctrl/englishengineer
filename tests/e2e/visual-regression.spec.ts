/* eslint-disable complexity */
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
    await p.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    const demoBtn = p.getByRole('button', { name: /demo/i });
    if (await demoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoBtn.click();
    }
    await p.waitForTimeout(1000);
    const url = p.url();
    if (url.includes('/onboard')) {
      await p.evaluate(() => {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.includes('auth_user') || key.includes('session_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              if (data.user) {
                data.user.onboardingCompleted = true;
                data.user.engineeringDiscipline = data.user.engineeringDiscipline || 'software';
                data.user.interfaceLanguage = data.user.interfaceLanguage || 'en';
                localStorage.setItem(key, JSON.stringify(data));
              }
            } catch {}
          }
        }
      });
      await p.reload({ waitUntil: 'networkidle' });
    }
    if (p.url().includes('/onboard') || p.url().includes('/dashboard')) {
      await p.waitForURL('**/dashboard', { timeout: 15000 });
      await p.waitForLoadState('networkidle');
    }
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
