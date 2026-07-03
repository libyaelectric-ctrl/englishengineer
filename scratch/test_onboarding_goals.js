import { chromium } from 'playwright';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Onboarding Goal Check... Email: ${email}`);

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
    console.log('Navigating to root...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    console.log('Clearing local storage...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log('Navigating to root again...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    console.log('Clicking Log in...');
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForTimeout(2000);
    console.log('URL after Log in click:', page.url());

    // Click button (first matching button with "Create Account" text)
    console.log('Clicking Create Account button...');
    await page
      .getByRole('button', { name: 'Create Account', exact: true })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Fill details
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);

    console.log('Submitting signup...');
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/onboarding/, { timeout: 20000 });

    // Step 1: Rhythm
    console.log('Step 1...');
    await page
      .getByRole('heading', { name: /Set a realistic daily rhythm/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Step 2: Role
    console.log('Step 2...');
    await page
      .getByRole('heading', { name: /Tell us where you work/i })
      .waitFor();
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Step 3: Goals
    console.log('Step 3...');
    await page
      .getByRole('heading', { name: /Choose communication goals/i })
      .waitFor();
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'goals_step3_before.png'),
    });

    // Click continue
    console.log('Clicking continue on Step 3...');
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();

    // Wait and check URL
    await page.waitForTimeout(3000);
    console.log('URL after clicking continue on Step 3:', page.url());
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'goals_step3_after.png'),
    });
  } catch (err) {
    console.error('Error:', err);
    await page.screenshot({ path: join(ARTIFACT_DIR, 'goals_error.png') });
  } finally {
    await browser.close();
  }
}

run();
