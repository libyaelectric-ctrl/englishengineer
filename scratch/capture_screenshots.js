import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\User\\Desktop\\EngineerOS_UI_Screenshots';

async function capture() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // 1. Public landing page desktop — first viewport
  console.log('Navigating to landing page...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  console.log('Capturing landing desktop hero...');
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-landing-desktop-hero.png'),
  });

  // 2. Complete public landing page desktop (full page)
  console.log('Capturing complete landing page...');
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '02-landing-desktop-full.png'),
    fullPage: true,
  });

  // 3. Public landing page at 390px
  console.log('Navigating to landing mobile...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '03-landing-mobile-390.png'),
    fullPage: true,
  });

  // 4. Access page desktop
  console.log('Navigating to Access page...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/pricing');
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '04-access-desktop.png'),
  });

  // Login & bypass onboarding
  console.log('Logging in to profile...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const demoBtn = page.locator('button:has-text("Engineer")').last();
  await demoBtn.click();
  await page.waitForURL('**/onboarding');
  await page.waitForTimeout(2000);

  // Bypass onboarding
  await page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('learning_profile_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          val.onboardingCompleted = true;
          localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {}
      }
    }
  });

  // Navigate to profile
  console.log('Navigating to profile...');
  await page.goto('http://localhost:3000/profile');
  await page.waitForURL('**/profile');
  await page.waitForTimeout(2000);

  // 5. Profile Overview
  console.log('Capturing profile overview...');
  const overviewEl = await page.locator('#overview');
  await overviewEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await overviewEl.screenshot({
    path: path.join(SCREENSHOT_DIR, '05-profile-overview.png'),
  });

  // 6. Skills and Progress section
  console.log('Capturing profile skills...');
  const skillsEl = await page.locator('#skills');
  await skillsEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await skillsEl.screenshot({
    path: path.join(SCREENSHOT_DIR, '06-profile-skills.png'),
  });

  // 7. Learning Preferences section
  console.log('Capturing profile preferences...');
  const prefEl = await page.locator('#preferences');
  await prefEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await prefEl.screenshot({
    path: path.join(SCREENSHOT_DIR, '07-profile-preferences.png'),
  });

  // 8. Account and Billing section
  console.log('Capturing profile billing...');
  const billingEl = await page.locator('#billing');
  await billingEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await billingEl.screenshot({
    path: path.join(SCREENSHOT_DIR, '08-profile-billing.png'),
  });

  // 9. Security and Data section
  console.log('Capturing profile security...');
  const securityEl = await page.locator('#security');
  await securityEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await securityEl.screenshot({
    path: path.join(SCREENSHOT_DIR, '09-profile-security.png'),
  });

  // 10. Profile page at 390px
  console.log('Capturing profile mobile...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '10-profile-mobile-390.png'),
  });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
