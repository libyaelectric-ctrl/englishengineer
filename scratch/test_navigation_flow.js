import { chromium } from 'playwright';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const BASE_URL = 'https://englishengineer.vercel.app';

async function run() {
  console.log(`Starting Navigation Flow Check...`);

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
    // 1. Go to root
    console.log('1. Going to root...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('URL:', page.url());
    await page.screenshot({ path: join(ARTIFACT_DIR, 'nav_1_root.png') });

    // 2. Clear storage (to ensure we are logged out)
    console.log('2. Clearing storage...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 3. Go to root again
    console.log('3. Going to root after clear...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('URL:', page.url());
    await page.screenshot({ path: join(ARTIFACT_DIR, 'nav_2_root_clear.png') });

    // 4. Click Log in link
    console.log('4. Looking for Log in link...');
    const loginLink = page
      .getByRole('link', { name: 'Log in', exact: true })
      .or(page.locator('a[href="/login"]'))
      .first();
    const isLoginLinkVisible = await loginLink.isVisible();
    console.log('Login link visible:', isLoginLinkVisible);

    if (isLoginLinkVisible) {
      console.log('Clicking Log in...');
      await loginLink.click();
      await page.waitForTimeout(3000);
      console.log('URL after click:', page.url());
      await page.screenshot({ path: join(ARTIFACT_DIR, 'nav_3_login.png') });
    } else {
      console.log(
        'Login link is NOT visible. Listing all links on landing page:'
      );
      const links = page.locator('a');
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        console.log(
          `Link ${i + 1}: text="${await links.nth(i).innerText()}" href="${await links.nth(i).getAttribute('href')}"`
        );
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
