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

// Auth-gated pages require proper auth setup (Clerk/Firebase emulator).
// To run these, set up auth state first:
//   npx playwright test tests/browser/landing-and-health.spec.ts --project=chromium-desktop
// Then uncomment the section below and adjust storageState path.
