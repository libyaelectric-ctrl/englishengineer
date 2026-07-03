import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to https://englishengineer.vercel.app...');
  try {
    await page.goto('https://englishengineer.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    const title = await page.title();
    console.log('Page Title:', title);

    const h1Text = await page.locator('h1').first().textContent();
    console.log('H1 Text:', h1Text);
  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
