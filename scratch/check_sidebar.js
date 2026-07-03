import { chromium } from 'playwright';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const BASE_URL = 'https://englishengineer.vercel.app';

async function run() {
  console.log(`Checking Sidebar Links...`);

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
    console.log('Navigating to root...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(ARTIFACT_DIR, 'sidebar_1_root.png') });

    console.log('Clicking Log in...');
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(ARTIFACT_DIR, 'sidebar_2_login.png') });

    console.log('Clearing local storage...');
    await page.evaluate(() => localStorage.clear());

    console.log('Navigating to root to reload...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'sidebar_3_root_after_clear.png'),
    });

    console.log('Clicking Log in again...');
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'sidebar_4_login_after_clear.png'),
    });

    console.log('Logging in as Demo Engineer...');
    const demoBtn = page
      .getByRole('button', { name: 'Use Demo Engineer' })
      .first();
    await demoBtn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: join(ARTIFACT_DIR, 'sidebar_5_after_login.png'),
    });
    console.log('Logged in successfully. URL:', page.url());
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
