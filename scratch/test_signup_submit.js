import { chromium } from 'playwright';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Testing signup submit... Email: ${email}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForTimeout(2000);

    // Click tab
    console.log('Clicking Create Account tab...');
    await page.getByRole('tab', { name: 'Create Account' }).click();
    await page.waitForTimeout(500);

    // Fill details
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'signup_test_1_filled.png'),
    });

    // Click submit button (the one inside the form)
    console.log('Clicking submit button...');
    await page.locator('form button[type="submit"]').click();

    // Wait for redirect
    console.log('Waiting for redirect or change...');
    await page.waitForTimeout(10000);
    console.log('Current URL after submit:', page.url());
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'signup_test_2_after_submit.png'),
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
