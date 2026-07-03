import { chromium } from 'playwright';

const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Starting Signup Check. Target: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all console messages and page errors
  page.on('console', (msg) => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  page.on('requestfailed', (req) => {
    console.log(`[REQUEST FAILED] ${req.url()} - ${req.failure().errorText}`);
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('Navigated to landing page.');

    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForURL(/\/login/);
    console.log('Navigated to login page.');

    // Switch to Create Account
    await page.getByRole('tab', { name: 'Create Account' }).click();
    await page.waitForTimeout(500);

    // Fill registration details
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);

    console.log('Clicking Create Account...');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Wait for changes
    await page.waitForTimeout(5000);
    console.log('After 5 seconds, URL is:', page.url());

    // Check if error message is visible
    const errorLoc = page.locator(
      '.text-rose-500, .bg-rose-50, [role="alert"]'
    );
    const count = await errorLoc.count();
    for (let i = 0; i < count; i++) {
      console.log(`Error visible: ${await errorLoc.nth(i).innerText()}`);
    }
  } catch (err) {
    console.error('Test script error:', err);
  } finally {
    await browser.close();
  }
}

run();
