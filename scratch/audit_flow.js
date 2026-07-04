import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/58f9ae45-6953-45d0-b8dd-9969a5e2bf6a';
const SCREENSHOT_DIR = join(ARTIFACT_DIR, 'screenshots');
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Starting Comprehensive QA Audit. Target: ${BASE_URL}`);
  console.log(`Account Email: ${email}`);

  const browser = await chromium.launch({ headless: true });
  // Create clean context with large viewport (1920x1080) to ensure everything fits
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  await context.clearCookies();
  const page = await context.newPage();

  // Listen to errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.toString()}`);
  });

  try {
    // ==========================================
    // PHASE 1: Landing Page
    // ==========================================
    console.log('\n--- PHASE 1: Landing Page ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('Landing page loaded.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '01_landing_fold.png'),
    });

    // Scroll to pricing
    const pricingHeading = page
      .getByRole('heading', { name: /Choose the right path/i })
      .or(page.getByText(/Pricing/i))
      .first();
    if (await pricingHeading.isVisible()) {
      await pricingHeading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '02_landing_pricing.png'),
      });
    }

    // ==========================================
    // PHASE 2: Registration
    // ==========================================
    console.log('\n--- PHASE 2: Registration ---');

    // Clear storage first before any transition
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Go to root and click Log in link to transition client-side (avoiding Vercel 404 on direct /login reload)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log('Transitioned to login page. Current URL:', page.url());
    await page.screenshot({ path: join(SCREENSHOT_DIR, '03_login_page.png') });

    // Switch to Create Account tab (using button select instead of tab role)
    console.log('Switching to Create Account tab...');
    await page
      .getByRole('button', { name: 'Create Account', exact: true })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Fill details
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '04_registration_filled.png'),
    });

    // Click form submit button
    console.log('Submitting registration form...');
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/onboarding/, { timeout: 30000 });
    console.log('URL after registration submit redirect:', page.url());
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '05_after_registration.png'),
    });

    // ==========================================
    // PHASE 3: Onboarding
    // ==========================================
    console.log('\n--- PHASE 3: Onboarding ---');

    // Step 1: Rhythm
    const step1Header = page.getByRole('heading', {
      name: /Set a realistic daily rhythm/i,
    });
    await step1Header.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Step 1 visible.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '06_onboarding_step1.png'),
    });
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Step 2: Role
    const step2Header = page.getByRole('heading', {
      name: /Tell us where you work/i,
    });
    await step2Header.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Step 2 visible.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '07_onboarding_step2.png'),
    });
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Step 3: Goals
    const step3Header = page.getByRole('heading', {
      name: /Choose communication goals/i,
    });
    await step3Header.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Step 3 visible.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '08_onboarding_step3.png'),
    });
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Step 4: Level
    const step4Header = page.getByRole('heading', {
      name: /current English level/i,
    });
    await step4Header.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Step 4 visible.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '09_onboarding_step4.png'),
    });
    const a2Btn = page
      .getByRole('button', { name: 'A2', exact: true })
      .or(page.getByText('A2'))
      .first();
    if (await a2Btn.isVisible()) {
      await a2Btn.click();
      await page.waitForTimeout(200);
    }
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Step 5: Plan
    const step5Header = page.getByRole('heading', {
      name: /Choose your starting workspace/i,
    });
    await step5Header.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Step 5 visible.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '10_onboarding_step5.png'),
    });
    const freeBtn = page.getByRole('button', { name: /Free/ }).first();
    if (await freeBtn.isVisible()) {
      await freeBtn.click();
      await page.waitForTimeout(200);
    }
    await page
      .getByRole('button', { name: /continue/i })
      .first()
      .click();
    await page.waitForTimeout(3000);

    if (page.url().includes('/placement')) {
      console.log('On placement page. Skipping test...');
      const startA1Btn = page
        .getByRole('button', { name: /Start at A1/i })
        .or(page.getByText(/Start at A1/i))
        .first();
      if (await startA1Btn.isVisible()) {
        await startA1Btn.click();
        await page.waitForTimeout(3000);
      }
    }

    console.log('Curriculum page loaded. URL:', page.url());
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '11_curriculum_loaded.png'),
    });

    // ==========================================
    // PHASE 4: FREE PLAN verification
    // ==========================================
    console.log('\n--- PHASE 4: Free Plan verification ---');

    // 1. Vocabulary (Learn 20 words)
    console.log('Navigating to Vocabulary via sidebar links...');
    await page
      .locator('aside')
      .getByRole('button', { name: /Skills/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    await page
      .locator('aside')
      .getByRole('link', { name: 'Vocabulary', exact: true })
      .click();
    await page.waitForURL(/\/vocabulary/, { timeout: 15000 });
    await page.waitForTimeout(2000); // Wait for list population

    await page.screenshot({
      path: join(SCREENSHOT_DIR, '12_vocabulary_init.png'),
    });

    console.log('Learning 20 words...');
    let wordsLearned = 0;
    for (let batch = 0; batch < 3; batch++) {
      const learnBtns = page
        .locator('main')
        .getByRole('button', { name: /Learn/i });
      const count = await learnBtns.count();
      console.log(`Batch ${batch + 1}: Found ${count} Learn buttons.`);
      for (let i = 0; i < count; i++) {
        if (wordsLearned >= 20) break;
        const firstLearnBtn = page
          .locator('main')
          .getByRole('button', { name: /Learn/i })
          .first();
        if (await firstLearnBtn.isVisible()) {
          await firstLearnBtn.click();
          await page.waitForTimeout(500);
          wordsLearned++;
        }
      }
      if (wordsLearned >= 20) break;
      const nextBatchBtn = page
        .locator('main')
        .getByRole('button', { name: /Next 10-word batch/i });
      if (await nextBatchBtn.isVisible()) {
        await nextBatchBtn.click();
        await page.waitForTimeout(2000);
      } else {
        break;
      }
    }
    console.log(`Vocabulary words learned: ${wordsLearned}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '13_vocabulary_done.png'),
    });

    // 2. Grammar (Complete 10 rules)
    console.log('Navigating to Grammar via sidebar...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Grammar', exact: true })
      .click();
    await page.waitForURL(/\/grammar/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: join(SCREENSHOT_DIR, '14_grammar_init.png'),
    });

    console.log('Reviewing 10 rules...');
    let grammarDone = 0;
    for (let i = 0; i < 10; i++) {
      const correctBtn = page
        .locator('main')
        .getByRole('button', { name: /I used this correctly/i });
      if (await correctBtn.isVisible()) {
        await correctBtn.click();
        await page.waitForTimeout(500);
        grammarDone++;
      } else {
        break;
      }
    }
    console.log(`Grammar rules reviewed: ${grammarDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '15_grammar_done.png'),
    });

    // 3. Reading (Complete 10 reading missions)
    console.log('Navigating to Reading via sidebar...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Reading', exact: true })
      .click();
    await page.waitForURL(/\/reading/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Completing 10 reading missions...');
    let readingDone = 0;
    for (let rIdx = 0; rIdx < 10; rIdx++) {
      const beginBtns = page
        .locator('main')
        .getByRole('button', { name: /Begin/i })
        .or(page.locator('main').getByRole('button', { name: /Retry/i }));
      if ((await beginBtns.count()) === 0) break;
      await beginBtns.first().click();
      await page.waitForTimeout(1000);

      // Using :not([disabled]) selector to make sure we click active choices and not the disabled submit button
      const options = page.locator(
        'main button.cursor-pointer:not([disabled])'
      );
      const optCount = await options.count();
      for (let opt = 0; opt < Math.min(optCount, 3); opt++) {
        await options.nth(opt).click();
        await page.waitForTimeout(100);
      }

      await page
        .locator('main')
        .getByRole('button', { name: /Submit Answers/i })
        .or(page.locator('main').getByRole('button', { name: /Submit/i }))
        .first()
        .click();
      await page.waitForTimeout(1500);

      const backBtn = page
        .locator('main')
        .getByRole('button', { name: /Back/i })
        .or(page.locator('main').getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page
          .locator('aside')
          .getByRole('link', { name: 'Reading', exact: true })
          .click();
      }
      await page.waitForTimeout(1500);
      readingDone++;
    }
    console.log(`Reading missions completed: ${readingDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '16_reading_done.png'),
    });

    // 4. Writing (Complete 5 writing missions)
    console.log('Navigating to Writing via sidebar...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Writing', exact: true })
      .click();
    await page.waitForURL(/\/writing/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Completing 5 writing missions...');
    let writingDone = 0;
    for (let wIdx = 0; wIdx < 5; wIdx++) {
      const beginBtns = page
        .locator('main')
        .getByRole('button', { name: /Begin/i })
        .or(page.locator('main').getByRole('button', { name: /Retry/i }));
      if ((await beginBtns.count()) === 0) break;
      await beginBtns.first().click();

      // Wait for textarea to appear
      const textArea = page.locator('main textarea').first();
      await textArea.waitFor({ state: 'visible', timeout: 15000 });
      await textArea.fill(
        'Inspection results: main grounding wiring is checked and verified in accordance with specification standards.'
      );

      await page
        .locator('main')
        .getByRole('button', { name: /Submit Draft/i })
        .first()
        .click();
      await page.waitForTimeout(2500);

      const backBtn = page
        .locator('main')
        .getByRole('button', { name: /Back/i })
        .or(page.locator('main').getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page
          .locator('aside')
          .getByRole('link', { name: 'Writing', exact: true })
          .click();
      }
      await page.waitForTimeout(1500);
      writingDone++;
    }
    console.log(`Writing missions completed: ${writingDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '17_writing_done.png'),
    });

    // 5. Listening (Complete 5 listening missions)
    console.log('Navigating to Listening via sidebar...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Listening', exact: true })
      .click();
    await page.waitForURL(/\/listening/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Completing 5 listening missions...');
    let listeningDone = 0;
    for (let lIdx = 0; lIdx < 5; lIdx++) {
      const beginBtns = page
        .locator('main')
        .getByRole('button', { name: /Open transcript task/i });
      if ((await beginBtns.count()) === 0) {
        console.log('No Open transcript task buttons found.');
        break;
      }
      await beginBtns.first().click();

      // Wait for textarea to appear
      const textArea = page.locator('main textarea').first();
      await textArea.waitFor({ state: 'visible', timeout: 15000 });
      await textArea.fill(
        'The substation MV grounding ring has been installed. Visual checking is complete.'
      );

      await page
        .locator('main')
        .getByRole('button', { name: /Submit transcript task/i })
        .first()
        .click();
      await page.waitForTimeout(2500);

      const backBtn = page
        .locator('main')
        .getByRole('button', { name: /Back/i })
        .or(page.locator('main').getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page
          .locator('aside')
          .getByRole('link', { name: 'Listening', exact: true })
          .click();
      }
      await page.waitForTimeout(1500);
      listeningDone++;
    }
    console.log(`Listening completed: ${listeningDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '18_listening_done.png'),
    });

    // 6. Speaking (Complete 5 speaking missions)
    console.log('Navigating to Speaking via sidebar...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Speaking', exact: true })
      .click();
    await page.waitForURL(/\/speaking/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Completing 5 speaking missions...');
    let speakingDone = 0;
    for (let sIdx = 0; sIdx < 5; sIdx++) {
      // Correctly target the second flex-wrap container for the mission cards
      const missionBtns = page
        .locator('main div.flex-wrap')
        .nth(1)
        .locator('button');
      if ((await missionBtns.count()) === 0) {
        console.log('No speaking mission buttons found.');
        break;
      }
      if (sIdx >= (await missionBtns.count())) break;
      await missionBtns.nth(sIdx).click();
      await page.waitForTimeout(1000);

      const textArea = page
        .locator('main textarea')
        .or(page.locator('main').getByPlaceholder(/typed transcript fallback/i))
        .first();
      await textArea.waitFor({ state: 'visible', timeout: 15000 });
      await textArea.fill(
        'Good morning team. We are going to inspect the electrical safety clearance in the generator room.'
      );
      await page
        .locator('main')
        .getByRole('button', { name: /Submit written roleplay/i })
        .or(
          page
            .locator('main')
            .getByRole('button', { name: /Submit speech assessment/i })
        )
        .first()
        .click();
      await page.waitForTimeout(2500);

      const dismissBtn = page
        .locator('main')
        .getByRole('button', { name: /Dismiss/i })
        .first();
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
      }
      speakingDone++;
    }
    console.log(`Speaking completed: ${speakingDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '19_speaking_done.png'),
    });

    // 7. Test AI Coach Daily Limit on FREE (3 requests)
    console.log('Navigating to Tools via sidebar to access AI Copilot...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Tools', exact: true })
      .click();
    await page.waitForURL(/\/tools/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log('Clicking AI Copilot tab...');
    await page.locator('main button[aria-label="AI Copilot"]').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '20_ai_coach_init.png'),
    });

    const aiInput = page.locator('main textarea').first();
    const sendBtn = page
      .locator('main')
      .getByRole('button', { name: /Send/i })
      .or(page.locator('main').locator('button[type="submit"]'))
      .first();

    console.log('Sending AI coach requests until limit (3)...');
    let requestsSent = 0;
    for (let r = 0; r < 4; r++) {
      if (await aiInput.isDisabled()) {
        console.log('AI Coach input has been disabled correctly! Limit hit.');
        break;
      }
      console.log(`Sending AI Coach prompt ${r + 1}...`);
      await aiInput.fill(
        `Hello coach, check site status for panel vault. Request ${r + 1}`
      );
      await sendBtn.click();
      await page.waitForTimeout(6000); // wait for AI response
      requestsSent++;
    }
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '21_ai_coach_limit.png'),
    });
    console.log(`AI Coach requests sent: ${requestsSent}`);

    // ==========================================
    // PHASE 5: Profile review
    // ==========================================
    console.log('\n--- PHASE 5: Profile review ---');
    console.log('Navigating to Profile...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Profile', exact: true })
      .click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '22_profile_overview.png'),
    });

    // Switch to billing
    console.log('Switching to Billing tab...');
    await page
      .locator('main')
      .getByRole('button', { name: 'Billing', exact: true })
      .click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '23_profile_billing_free.png'),
    });

    // ==========================================
    // PHASE 6: Upgrade to PRO
    // ==========================================
    console.log('\n--- PHASE 6: Upgrade to PRO ---');
    // Navigate to pricing page via Profile Upgrade or direct navigate
    console.log('Clicking upgrade button on profile page...');
    const billingUpgradeBtn = page
      .locator('main')
      .getByRole('button', { name: /Upgrade/i })
      .or(page.locator('main').getByText(/Upgrade to Pro/i))
      .first();
    if (await billingUpgradeBtn.isVisible()) {
      await billingUpgradeBtn.click();
      await page.waitForTimeout(5000);
    } else {
      console.log(
        'No upgrade button on profile, navigating to /pricing via router context...'
      );
      await page.evaluate(() => window.location.assign('/pricing')); // client-side router navigation if possible, or reload
      await page.waitForTimeout(5000);
    }

    // Check if we are redirected to Stripe or need to select Pro on pricing page
    console.log('Current URL after upgrade click:', page.url());
    if (!page.url().includes('stripe.com')) {
      console.log(
        'Not yet on Stripe. We must be on pricing page. Clicking Select Pro...'
      );
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '24_pricing_page.png'),
      });
      const selectProBtn = page
        .locator('main')
        .getByRole('button', { name: /Upgrade to Pro/i })
        .or(page.locator('main').getByRole('button', { name: /Select Pro/i }))
        .first();
      await selectProBtn.click();
      console.log('Clicked Select Pro. Waiting for checkout redirection...');
      await page.waitForURL(/stripe.com/, { timeout: 30000 });
      console.log('Redirected to Stripe. URL:', page.url());
    }

    // Now we are on Stripe Checkout
    if (page.url().includes('stripe.com')) {
      console.log('Stripe checkout loaded. Waiting for form elements...');
      await page.waitForLoadState('domcontentloaded');

      // Robust dynamic check: wait for EITHER the accordion button OR cardNumber input to be attached
      const paymentContainerEl = page
        .locator('[data-testid="card-accordion-item-button"], #cardNumber')
        .first();
      await paymentContainerEl.waitFor({ state: 'attached', timeout: 35000 });

      // Check if the accordion button is present and click it if so
      const cardAccordionBtn = page
        .locator('[data-testid="card-accordion-item-button"]')
        .first();
      if ((await cardAccordionBtn.count()) > 0) {
        console.log('Accordion button found. Expanding Kart accordion...');
        await page.evaluate(() => {
          const el = document.querySelector(
            '[data-testid="card-accordion-item-button"]'
          );
          if (el) el.click();
        });
        await page.waitForTimeout(2000);
      } else {
        console.log(
          'No accordion button found. Card fields might be expanded by default.'
        );
      }

      await page.screenshot({
        path: join(SCREENSHOT_DIR, '25_checkout_redirect.png'),
      });

      // Dynamic wait for card inputs to render and become visible
      const cardNumberInput = page.locator('#cardNumber').first();
      await cardNumberInput.waitFor({ state: 'visible', timeout: 25000 });

      // Fill Stripe payment info
      console.log('Entering credit card details...');
      await cardNumberInput.fill('4242424242424242');
      await page.waitForTimeout(200);
      await page.locator('#cardExpiry').fill('1234');
      await page.waitForTimeout(200);
      await page.locator('#cardCvc').fill('123');
      await page.waitForTimeout(200);
      await page.locator('#billingName').fill('QA Electrical Engineer');
      await page.waitForTimeout(200);

      // Check if billing postal code is visible
      const zipField = page.locator('#billingPostalCode');
      if (await zipField.isVisible()) {
        await zipField.fill('12345');
        await page.waitForTimeout(200);
      }

      await page.screenshot({
        path: join(SCREENSHOT_DIR, '26_stripe_filled.png'),
      });

      // Submit checkout form
      console.log('Clicking Stripe submit button...');
      await page.locator('button[type="submit"]').first().click();

      console.log(
        'Submitted Stripe payment form. Waiting for redirect back to app...'
      );
      await page.waitForURL(/\/profile\?billing=success/, { timeout: 35000 });
      console.log('Successfully redirected back to app. URL:', page.url());
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '27_after_stripe_success.png'),
      });
    }

    // Returned to Profile. Direct reload here lands on Vercel 404, so we recover client-side via landing page header links.
    console.log(
      'Detected Vercel 404 on redirect back. Navigating to root landing page...'
    );
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    console.log('Waiting for landing page to render...');
    await page.waitForTimeout(2000);

    console.log('Clicking Log in link on landing page to go to login page...');
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Logging in again to recover session...');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.locator('form button[type="submit"]').click();

    // Wait for the automatic redirect to /curriculum or /dashboard to complete
    await page.waitForURL(/\/curriculum|\/dashboard/, { timeout: 25000 });
    console.log('Recovered session. Current URL:', page.url());

    console.log('Navigating back to Profile client-side...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Profile', exact: true })
      .click();
    await page.waitForURL(/\/profile/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Waiting for backend webhook sync (5s)...');
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '28_profile_post_upgrade.png'),
    });

    // Click Billing to verify sync
    console.log('Clicking Billing tab...');
    await page
      .locator('main')
      .getByRole('button', { name: 'Billing', exact: true })
      .click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '29_profile_billing_pro_check.png'),
    });

    // ==========================================
    // PHASE 9: Documents (Upload verification on PRO)
    // ==========================================
    console.log('\n--- PHASE 9: Documents ---');
    console.log('Navigating to Tools -> AI Copilot client-side...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Tools', exact: true })
      .click();
    await page.waitForURL(/\/tools/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.locator('main button[aria-label="AI Copilot"]').first().click();
    await page.waitForTimeout(1000);

    const txtContent =
      'QA Audit Document: 1. Substation grounding layout spacing check. 2. Safety checklist is complete.';
    writeFileSync('scratch/test.txt', txtContent);
    writeFileSync('scratch/test.pdf', 'MOCK PDF DATA');
    writeFileSync('scratch/test.docx', 'MOCK DOCX DATA');
    console.log('Created local test files for upload.');

    const uploadInput = page.locator('main input[type="file"]').first();
    if (await uploadInput.isVisible()) {
      console.log('Uploading test.txt...');
      await uploadInput.setInputFiles('scratch/test.txt');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '30_doc_txt_uploaded.png'),
      });

      console.log('Uploading test.pdf...');
      await uploadInput.setInputFiles('scratch/test.pdf');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '31_doc_pdf_uploaded.png'),
      });

      console.log('Uploading test.docx (should hit Pro limit)...');
      await uploadInput.setInputFiles('scratch/test.docx');
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '32_doc_docx_uploaded.png'),
      });
    }

    // ==========================================
    // PHASE 11: Responsiveness check
    // ==========================================
    console.log('\n--- PHASE 11: Responsiveness ---');

    // Navigate to Curriculum first while sidebar is still visible in desktop view (using correct 'Home' link name)
    console.log('Navigating to Curriculum client-side (desktop view)...');
    await page
      .locator('aside')
      .getByRole('link', { name: 'Home', exact: true })
      .first()
      .click();
    await page.waitForURL(/\/curriculum|\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Now resize viewport to check responsiveness layout changes
    console.log('Resizing to tablet viewport (900x1100)...');
    await page.setViewportSize({ width: 900, height: 1100 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '33_viewport_tablet.png'),
    });

    console.log('Resizing to mobile viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '34_viewport_mobile.png'),
    });
  } catch (err) {
    console.error('Fatal error during QA E2E run:', err);
    // Take error screenshot on failure
    await page.screenshot({ path: join(SCREENSHOT_DIR, 'error_state.png') });
  } finally {
    await browser.close();
    console.log('\nQA Audit finished.');
  }
}

run();
