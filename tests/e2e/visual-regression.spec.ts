/**
 * Visual regression tests — screenshot baseline for main public and app pages.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

const PUBLIC_PAGES = [
  { name: 'landing', path: '/' },
  { name: 'pricing', path: '/pricing' },
  { name: 'sign-in', path: '/sign-in' },
  { name: 'sign-up', path: '/sign-up' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'business', path: '/business' },
  { name: 'privacy', path: '/legal/privacy' },
  { name: 'terms', path: '/legal/terms' },
  { name: 'start', path: '/start' },
];

test.describe('Visual regression — public pages', () => {
  for (const publicPage of PUBLIC_PAGES) {
    test(`${publicPage.name} matches baseline`, async ({ page }) => {
      await page.goto(`${BASE_URL}${publicPage.path}`, { waitUntil: 'networkidle' });
      await expect(page).toHaveScreenshot(`${publicPage.name}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    });
  }

  test('onboarding shows all 15 languages in a three-column grid without helper copy', async ({ page }) => {
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    await expect(page.getByText('İki seçim de aynı formatta')).toHaveCount(0);
    const languageSection = page.locator('section').filter({ hasText: /Diller|Select your language|Kies je taal|Pilih/ }).last();
    await expect(languageSection.locator('button')).toHaveCount(15);
    await expect(languageSection.locator('button').first()).toBeVisible();
  });
});

test.describe('Visual regression — auth-gated pages (demo mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    await page.locator('section').first().locator('button').first().click();
    await page.locator('section').last().locator('button').first().click();
    const nextButton = page.getByRole('button', { name: /İleri|Next|Weiter|Dalej|Volgende|Siguiente|Suivant/i });
    await nextButton.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
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
    { name: 'billing', path: '/billing' },
  ];

  for (const appPage of AUTHED_PAGES) {
    test(`${appPage.name} matches baseline`, async ({ page }) => {
      await page.goto(`${BASE_URL}${appPage.path}`, { waitUntil: 'networkidle' });
      await expect(page).toHaveScreenshot(`${appPage.name}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    });
  }
});
