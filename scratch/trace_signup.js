import { chromium } from 'playwright';

const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Tracing Signup. Target: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  page.on('request', (req) => {
    console.log(`[REQUEST] ${req.method()} ${req.url()}`);
  });

  page.on('response', (res) => {
    console.log(`[RESPONSE] ${res.status()} ${res.url()}`);
  });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Click Log in link
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForTimeout(2000);

    // Switch to Create Account
    const createAccountTab = page
      .getByRole('tab', { name: 'Create Account' })
      .or(page.getByText('Create Account'))
      .first();
    await createAccountTab.click();
    await page.waitForTimeout(1000);

    // Fill registration details
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.waitForTimeout(500);

    console.log('Submitting signup...');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Wait for network activity to settle or redirection
    await page.waitForTimeout(10000);
    console.log('Current URL after 10s:', page.url());
  } catch (err) {
    console.error('Trace error:', err);
  } finally {
    await browser.close();
  }
}

run();
