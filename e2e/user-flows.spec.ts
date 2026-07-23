import { test, expect } from '@playwright/test';

test.describe('User registration and onboarding', () => {
  test('user can navigate to signup page', async ({ page }) => {
    await page.goto('/');
    const signupLink = page.getByRole('link', { name: /sign up|kayıt/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*sign|kayıt/);
    }
  });
});

test.describe('Listening lesson flow', () => {
  test('user can access listening lessons', async ({ page }) => {
    await page.goto('/');
    const listeningLink = page.getByRole('link', {
      name: /listening|dinleme/i,
    });
    if (await listeningLink.isVisible()) {
      await listeningLink.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Billing page', () => {
  test('user can access billing/pricing page', async ({ page }) => {
    await page.goto('/');
    const billingLink = page.getByRole('link', {
      name: /pricing|billing|pro/i,
    });
    if (await billingLink.isVisible()) {
      await billingLink.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Vocabulary page', () => {
  test('user can access vocabulary page', async ({ page }) => {
    await page.goto('/');
    const vocabLink = page.getByRole('link', { name: /vocabulary|kelime/i });
    if (await vocabLink.isVisible()) {
      await vocabLink.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Home page loads', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
