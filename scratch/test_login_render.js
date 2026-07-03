import { chromium } from 'playwright';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const BASE_URL = 'https://englishengineer.vercel.app';

async function run() {
  console.log(`Starting Login Render Check...`);

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
    console.log('Navigating to /login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log('Current URL:', page.url());
    await page.screenshot({ path: join(ARTIFACT_DIR, 'login_render_1.png') });

    console.log('Clearing local storage...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log('Reloading /login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log('Current URL after reload:', page.url());
    await page.screenshot({ path: join(ARTIFACT_DIR, 'login_render_2.png') });

    const createAccountTab = page
      .getByRole('tab', { name: 'Create Account' })
      .or(page.getByText('Create Account'))
      .first();
    const isTabVisible = await createAccountTab.isVisible();
    console.log('Create Account Tab Visible:', isTabVisible);

    if (isTabVisible) {
      await createAccountTab.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: join(ARTIFACT_DIR, 'login_render_signup_mode.png'),
      });
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
