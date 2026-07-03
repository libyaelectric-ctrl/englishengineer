import { chromium } from 'playwright';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Tracing Stripe Checkout... Email: ${email}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.clearCookies();
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  try {
    console.log('1. Signup & Onboarding...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForTimeout(2000);
    await page
      .getByRole('button', { name: 'Create Account', exact: true })
      .first()
      .click();
    await page.waitForTimeout(500);

    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/onboarding/, { timeout: 20000 });

    // Step 1-5
    await page
      .getByRole('heading', { name: /Set a realistic daily rhythm/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    await page
      .getByRole('heading', { name: /Tell us where you work/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    await page
      .getByRole('heading', { name: /Choose communication goals/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    await page
      .getByRole('heading', { name: /current English level/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    await page
      .getByRole('heading', { name: /Choose your starting workspace/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(3000);

    if (page.url().includes('/placement')) {
      const startA1Btn = page
        .getByRole('button', { name: /Start at A1/i })
        .or(page.getByText(/Start at A1/i))
        .first();
      if (await startA1Btn.isVisible()) {
        await startA1Btn.click();
        await page.waitForTimeout(3000);
      }
    }

    // Go to Profile
    console.log('2. Navigating to Profile...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Profile', exact: true })
      .click();
    await page.waitForTimeout(2000);

    // Switch to Billing
    await page
      .locator('main')
      .getByRole('button', { name: 'Billing', exact: true })
      .click();
    await page.waitForTimeout(1000);

    // Click Upgrade
    console.log('3. Clicking Upgrade to Pro...');
    await page
      .locator('main')
      .getByRole('button', { name: /Upgrade/i })
      .first()
      .click();

    // Wait for Stripe Checkout URL
    console.log('4. Waiting for Stripe Checkout URL...');
    await page.waitForURL(/stripe.com/, { timeout: 30000 });
    console.log('Redirected to Stripe. URL:', page.url());

    // Wait for load state domcontentloaded and a short delay
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(10000); // 10s wait for Stripe to fully render

    await page.screenshot({ path: join(ARTIFACT_DIR, 'stripe_loaded.png') });
    console.log('Screenshot captured.');

    // Print all inputs
    console.log('Listing all inputs on the Stripe Checkout page:');
    const inputs = page.locator('input');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute('id');
      const name = await inputs.nth(i).getAttribute('name');
      const placeholder = await inputs.nth(i).getAttribute('placeholder');
      const type = await inputs.nth(i).getAttribute('type');
      console.log(
        `Input ${i + 1}: id="${id}" name="${name}" placeholder="${placeholder}" type="${type}"`
      );
    }
  } catch (err) {
    console.error('Error during Stripe trace:', err);
  } finally {
    await browser.close();
  }
}

run();
