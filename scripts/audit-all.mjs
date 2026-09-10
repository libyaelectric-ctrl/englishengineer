import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

const pages = [
  { name: 'landing', url: 'http://localhost:3000', selector: 'h1' },
  { name: 'start', url: 'http://localhost:3000/start', selector: 'h1' },
  { name: 'pricing', url: 'http://localhost:3000/pricing', selector: 'h1, h2' },
  { name: 'login', url: 'http://localhost:3000/sign-in', selector: 'input, button' },
  { name: 'business', url: 'http://localhost:3000/business', selector: 'h1, h2' },
];

for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(p.url, { waitUntil: 'load', timeout: 15000 });
    // Wait for actual content to appear (not skeleton)
    try {
      await page.waitForSelector(p.selector, { timeout: 10000 });
    } catch {
      console.log(`  ⚠ ${p.name}: selector "${p.selector}" not found, waiting extra`);
    }
    await page.waitForTimeout(3000);
    // Dismiss cookie
    const cookie = page.locator('button:has-text("Kabul"), button:has-text("Accept")');
    if (await cookie.count() > 0) {
      await cookie.first().click({ force: true });
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `.freebuff/shots/audit3-${p.name}.png`, fullPage: false });
    console.log(`✓ ${p.name}`);
  } catch (e) {
    console.error(`✗ ${p.name}: ${e.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log('Done');
