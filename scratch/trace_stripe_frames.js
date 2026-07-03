import { chromium } from 'playwright';

const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Tracing Stripe Frames...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
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
    await page
      .locator('main')
      .getByRole('button', { name: /Upgrade/i })
      .first()
      .click();

    // Wait for Stripe Checkout URL
    await page.waitForURL(/stripe.com/, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(10000);

    // Click "Kart" accordion button
    await page.evaluate(() => {
      const el = document.querySelector(
        '[data-testid="card-accordion-item-button"]'
      );
      if (el) el.click();
    });
    await page.waitForTimeout(5000);

    // List all frames
    const frames = page.frames();
    console.log(`Total frames: ${frames.length}`);
    for (let idx = 0; idx < frames.length; idx++) {
      const f = frames[idx];
      console.log(`Frame ${idx}: name="${f.name()}" url="${f.url()}"`);
      const inputs = f.locator('input');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const id = await inputs.nth(i).getAttribute('id');
        const name = await inputs.nth(i).getAttribute('name');
        console.log(`  Input inside Frame ${idx}: id="${id}" name="${name}"`);
      }
    }
  } catch (err) {
    console.error('Error during Stripe frames trace:', err);
  } finally {
    await browser.close();
  }
}

run();
