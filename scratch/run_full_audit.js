import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ARTIFACT_DIR =
  'C:/Users/User/.gemini/antigravity/brain/dbeed071-e0dd-4c42-9917-c027e2309a86';
const SCREENSHOT_DIR = join(ARTIFACT_DIR, 'screenshots');
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'https://englishengineer.vercel.app';
const email = `engineer.qa.test.${Date.now()}@example.com`;
const password = `TestPassword123!`;

async function run() {
  console.log(`Starting QA Audit. Target: ${BASE_URL}`);
  console.log(`Test account: ${email} / ${password}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console and network errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE UNCAUGHT ERROR] ${err.toString()}`);
  });

  try {
    // ==========================================
    // PHASE 1: Landing Page
    // ==========================================
    console.log('\n--- PHASE 1: Landing Page ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
    console.log('Landing page loaded successfully.');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '01_landing_fold.png'),
    });
    console.log('Screenshot saved: 01_landing_fold.png');

    // Scroll to pricing section
    const pricingHeader = page
      .getByRole('heading', { name: /Choose the right path/i })
      .or(page.getByText(/pricing/i))
      .first();
    if (await pricingHeader.isVisible()) {
      await pricingHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '02_landing_pricing.png'),
      });
      console.log('Screenshot saved: 02_landing_pricing.png');
    }

    // ==========================================
    // PHASE 2: Registration
    // ==========================================
    console.log('\n--- PHASE 2: Registration ---');
    // Click login link
    const loginLink = page
      .getByRole('link', { name: 'Log in', exact: true })
      .or(page.locator('a[href="/login"]'))
      .first();
    await loginLink.click();
    await page.waitForURL(/\/login/);
    console.log('Login page loaded.');
    await page.screenshot({ path: join(SCREENSHOT_DIR, '03_login_page.png') });

    // Switch to Create Account tab
    const createAccountTab = page
      .getByRole('tab', { name: 'Create Account' })
      .or(page.getByText('Create Account'))
      .first();
    await createAccountTab.click();
    await page.waitForTimeout(500);

    // Fill registration details
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '04_registration_filled.png'),
    });

    // Click Create Account button
    const signupBtn = page
      .getByRole('button', { name: 'Create Account' })
      .or(page.locator('button[type="submit"]'))
      .first();
    await signupBtn.click();
    console.log('Submitted signup form.');

    // Wait for page redirection. Supabase registration might immediately log in or show a message.
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '05_after_signup.png'),
    });
    console.log(`Current URL: ${page.url()}`);

    // ==========================================
    // PHASE 3: Onboarding
    // ==========================================
    console.log('\n--- PHASE 3: Onboarding ---');
    if (page.url().includes('/onboarding')) {
      console.log('Onboarding page loaded.');

      // Step 1: Study Rhythm
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '06_onboarding_step1.png'),
      });
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(1000);
      console.log('Onboarding step 1 completed.');

      // Step 2: Role and Industry
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '07_onboarding_step2.png'),
      });
      // Select Electrical Track (should be default or we select)
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(1000);
      console.log('Onboarding step 2 completed.');

      // Step 3: Goals
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '08_onboarding_step3.png'),
      });
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(1000);
      console.log('Onboarding step 3 completed.');

      // Step 4: Level
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '09_onboarding_step4.png'),
      });
      // Select A2 Level
      const a2Btn = page
        .getByRole('button', { name: 'A2', exact: true })
        .or(page.getByText('A2'))
        .first();
      if (await a2Btn.isVisible()) {
        await a2Btn.click();
        await page.waitForTimeout(200);
      }
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(1000);
      console.log('Onboarding step 4 completed.');

      // Step 5: Plan
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '10_onboarding_step5.png'),
      });
      // Select Free
      const freePlanCard = page.getByRole('button', { name: /Free/ }).first();
      if (await freePlanCard.isVisible()) {
        await freePlanCard.click();
        await page.waitForTimeout(200);
      }
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForTimeout(3000);
      console.log('Onboarding step 5 completed.');
    }

    // Handle placement test redirection if any
    console.log(`Current URL: ${page.url()}`);
    if (page.url().includes('/placement')) {
      console.log('On placement page, clicking Start at A1/A2...');
      const skipBtn = page
        .getByRole('button', { name: /Start at A1/i })
        .or(page.getByText(/Start at A1/i))
        .first();
      if (await skipBtn.isVisible()) {
        await skipBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    console.log(`Current URL after onboarding/placement: ${page.url()}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '11_curriculum_or_dashboard.png'),
    });

    // ==========================================
    // PHASE 4: Free Plan learning
    // ==========================================
    console.log('\n--- PHASE 4: Free Plan learning ---');

    // 1. Vocabulary (Learn 20 words)
    console.log('Navigating to /vocabulary...');
    await page.goto(`${BASE_URL}/vocabulary`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '12_vocabulary_init.png'),
    });

    console.log('Learning 20 words...');
    let wordsLearned = 0;
    for (let batch = 0; batch < 3; batch++) {
      console.log(`Learning batch ${batch + 1}...`);
      // Find all Learn buttons on the page
      const learnBtns = page.getByRole('button', { name: /Learn/i });
      const count = await learnBtns.count();
      console.log(`Found ${count} Learn buttons.`);
      for (let i = 0; i < Math.min(count, 10); i++) {
        if (wordsLearned >= 20) break;
        await learnBtns.nth(i).click();
        await page.waitForTimeout(500);
        wordsLearned++;
      }
      if (wordsLearned >= 20) break;
      // Load next batch
      const nextBatchBtn = page.getByRole('button', {
        name: /Next 10-word batch/i,
      });
      if (await nextBatchBtn.isVisible()) {
        await nextBatchBtn.click();
        await page.waitForTimeout(1500);
      } else {
        console.log(
          'Next batch button not visible, stopping vocabulary learning.'
        );
        break;
      }
    }
    console.log(`Vocabulary learned: ${wordsLearned}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '13_vocabulary_done.png'),
    });

    // 2. Grammar (Complete 10 rules)
    console.log('Navigating to /grammar...');
    await page.goto(`${BASE_URL}/grammar`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '14_grammar_init.png'),
    });

    console.log('Reviewing 10 grammar topics...');
    let grammarRulesReviewed = 0;
    for (let i = 0; i < 10; i++) {
      const correctBtn = page.getByRole('button', {
        name: /I used this correctly/i,
      });
      if (await correctBtn.isVisible()) {
        await correctBtn.click();
        await page.waitForTimeout(800);
        grammarRulesReviewed++;
      } else {
        console.log('Grammar correct button not visible, stopping.');
        break;
      }
    }
    console.log(`Grammar rules reviewed: ${grammarRulesReviewed}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '15_grammar_done.png'),
    });

    // 3. Reading (Complete 10 reading missions)
    console.log('Navigating to /reading...');
    await page.goto(`${BASE_URL}/reading`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '16_reading_init.png'),
    });

    console.log('Completing 10 reading missions...');
    let readingMissionsDone = 0;
    for (let mIdx = 0; mIdx < 10; mIdx++) {
      // Find Begin buttons
      const beginBtns = page
        .getByRole('button', { name: /Begin/i })
        .or(page.getByRole('button', { name: /Retry/i }));
      const count = await beginBtns.count();
      if (count === 0) {
        console.log('No reading missions available to start.');
        break;
      }
      console.log(`Launching reading mission ${readingMissionsDone + 1}...`);
      await beginBtns.first().click();
      await page.waitForTimeout(1500);

      // We are in workspace. For each question, select the first option
      // The options are buttons inside question sections
      const options = page.locator('button.cursor-pointer');
      const optionCount = await options.count();
      console.log(`Found ${optionCount} options in workspace.`);

      // Let's answer all questions. There are usually 3 questions.
      // We can just click the first choice for each question group
      // Each question group usually has multiple options. Let's click the first 3 we find
      for (let opt = 0; opt < Math.min(optionCount, 3); opt++) {
        await options.nth(opt).click();
        await page.waitForTimeout(200);
      }

      // Submit
      const submitBtn = page
        .getByRole('button', { name: /Submit Answers/i })
        .or(page.getByRole('button', { name: /Submit/i }))
        .first();
      await submitBtn.click();
      await page.waitForTimeout(1500);

      // Back to missions
      const backBtn = page
        .getByRole('button', { name: /Back/i })
        .or(page.getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page.goto(`${BASE_URL}/reading`, { waitUntil: 'networkidle' });
      }
      await page.waitForTimeout(1500);
      readingMissionsDone++;
    }
    console.log(`Reading missions completed: ${readingMissionsDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '17_reading_done.png'),
    });

    // 4. Writing (Complete 5 writing missions)
    console.log('Navigating to /writing...');
    await page.goto(`${BASE_URL}/writing`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('Completing 5 writing missions...');
    let writingMissionsDone = 0;
    for (let wIdx = 0; wIdx < 5; wIdx++) {
      const beginBtns = page
        .getByRole('button', { name: /Begin/i })
        .or(page.getByRole('button', { name: /Retry/i }));
      if ((await beginBtns.count()) === 0) break;
      await beginBtns.first().click();
      await page.waitForTimeout(1500);

      // Fill textarea
      const textArea = page.locator('textarea').first();
      if (await textArea.isVisible()) {
        await textArea.fill(
          'Dear contractor, please submit the updated cables routing layouts for the electrical vault room Zone 2 before Friday close of business. Visual layout verification will proceed after approval.'
        );
      }

      // Submit draft
      const submitBtn = page
        .getByRole('button', { name: /Submit Draft/i })
        .first();
      await submitBtn.click();
      await page.waitForTimeout(3000);

      // Back to missions
      const backBtn = page
        .getByRole('button', { name: /Back/i })
        .or(page.getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page.goto(`${BASE_URL}/writing`, { waitUntil: 'networkidle' });
      }
      await page.waitForTimeout(1500);
      writingMissionsDone++;
    }
    console.log(`Writing missions completed: ${writingMissionsDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '18_writing_done.png'),
    });

    // 5. Listening (Complete 5 listening missions)
    console.log('Navigating to /listening...');
    await page.goto(`${BASE_URL}/listening`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('Completing 5 listening missions...');
    let listeningMissionsDone = 0;
    for (let lIdx = 0; lIdx < 5; lIdx++) {
      const beginBtns = page
        .getByRole('button', { name: /Begin/i })
        .or(page.getByRole('button', { name: /Retry/i }));
      if ((await beginBtns.count()) === 0) break;
      await beginBtns.first().click();
      await page.waitForTimeout(1500);

      // Fill textarea
      const textArea = page.locator('textarea').first();
      if (await textArea.isVisible()) {
        await textArea.fill(
          'The substation inspection record indicates that the main medium voltage circuit breaker has been installed successfully. Grounding connections are tested and approved.'
        );
      }

      // Submit transcript task
      const submitBtn = page
        .getByRole('button', { name: /Submit transcript task/i })
        .first();
      await submitBtn.click();
      await page.waitForTimeout(2000);

      // Back to missions
      const backBtn = page
        .getByRole('button', { name: /Back/i })
        .or(page.getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page.goto(`${BASE_URL}/listening`, { waitUntil: 'networkidle' });
      }
      await page.waitForTimeout(1500);
      listeningMissionsDone++;
    }
    console.log(`Listening missions completed: ${listeningMissionsDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '19_listening_done.png'),
    });

    // 6. Speaking (Complete 5 speaking missions)
    console.log('Navigating to /speaking...');
    await page.goto(`${BASE_URL}/speaking`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('Completing 5 speaking missions...');
    let speakingMissionsDone = 0;
    for (let sIdx = 0; sIdx < 5; sIdx++) {
      const beginBtns = page
        .getByRole('button', { name: /Begin/i })
        .or(page.getByRole('button', { name: /Retry/i }));
      if ((await beginBtns.count()) === 0) break;
      await beginBtns.first().click();
      await page.waitForTimeout(1500);

      // Fill fallback text
      const textArea = page
        .locator('textarea')
        .or(page.getByPlaceholder(/typed transcript fallback/i))
        .first();
      if (await textArea.isVisible()) {
        await textArea.fill(
          'Good morning team. Today we will inspect the cable tray installation before starting cable pulling. Please confirm access, approved drawings, support spacing, safety permits, and inspection records.'
        );
      }

      // Submit written roleplay / speech assessment
      const submitBtn = page
        .getByRole('button', { name: /Submit written roleplay/i })
        .or(page.getByRole('button', { name: /Submit speech assessment/i }))
        .first();
      await submitBtn.click();
      await page.waitForTimeout(3000);

      // Dismiss diagnostics if open
      const dismissBtn = page.getByRole('button', { name: /Dismiss/i }).first();
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
        await page.waitForTimeout(500);
      }

      // Back to missions
      const backBtn = page
        .getByRole('button', { name: /Back/i })
        .or(page.getByText(/Back to/i))
        .first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
      } else {
        await page.goto(`${BASE_URL}/speaking`, { waitUntil: 'networkidle' });
      }
      await page.waitForTimeout(1500);
      speakingMissionsDone++;
    }
    console.log(`Speaking missions completed: ${speakingMissionsDone}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '20_speaking_done.png'),
    });

    // 7. Use AI Coach extensively on FREE plan to verify limits
    console.log('Navigating to /ai to test AI Coach...');
    await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '21_ai_coach_init.png'),
    });

    const aiInput = page.locator('textarea').first();
    const sendBtn = page
      .getByRole('button', { name: /Send/i })
      .or(page.locator('button[type="submit"]'))
      .first();

    // We send requests until daily limit (3 requests) is hit
    console.log('Sending AI coach requests until limit...');
    for (let r = 0; r < 4; r++) {
      if (await aiInput.isDisabled()) {
        console.log('AI coach input is disabled! Limit hit.');
        break;
      }
      console.log(`Sending request ${r + 1}...`);
      await aiInput.fill(
        'Hi Coach, check my current electrical progress on site. I have verified grounding cables.'
      );
      await sendBtn.click();
      await page.waitForTimeout(5000); // Wait for response
    }
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '22_ai_coach_limit.png'),
    });

    // ==========================================
    // PHASE 5: Profile review
    // ==========================================
    console.log('\n--- PHASE 5: Profile review ---');
    console.log('Navigating to /profile...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '23_profile_overview.png'),
    });

    // Switch to Billing tab
    const billingTabBtn = page
      .getByRole('button', { name: 'Billing', exact: true })
      .or(page.getByText('Billing'))
      .first();
    await billingTabBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '24_profile_billing_free.png'),
    });

    // ==========================================
    // PHASE 6: Upgrade to PRO
    // ==========================================
    console.log('\n--- PHASE 6: Upgrade to PRO ---');
    console.log('Navigating to /pricing...');
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '25_pricing_page.png'),
    });

    // Click Upgrade on Pro plan
    const upgradeBtn = page
      .getByRole('button', { name: /Upgrade to Pro/i })
      .or(page.getByRole('button', { name: /Select Pro/i }))
      .first();
    await upgradeBtn.click();
    console.log(
      'Clicked Upgrade to Pro. Waiting for Stripe checkout redirection...'
    );
    await page.waitForTimeout(8000); // Give plenty of time for Stripe checkout loading
    console.log(`Current URL after checkout click: ${page.url()}`);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '26_stripe_checkout.png'),
    });

    if (page.url().includes('stripe.com')) {
      console.log('On Stripe checkout page. Filling payment details...');
      // Note: Stripe iframe inputs require careful selector handling
      // Fill email if not pre-filled
      const stripeEmail = page.locator('#email');
      if (await stripeEmail.isVisible()) {
        await stripeEmail.fill(email);
      }

      // Fill Card details. Stripe elements are usually in an iframe.
      // Playwright can fill stripe inputs by focusing the frames, or using text sequences
      // Card Number
      await page.keyboard.type('4242');
      await page.keyboard.type('4242');
      await page.keyboard.type('4242');
      await page.keyboard.type('4242');
      await page.waitForTimeout(200);

      // Expiry
      await page.keyboard.type('12');
      await page.keyboard.type('34');
      await page.waitForTimeout(200);

      // CVC
      await page.keyboard.type('123');
      await page.waitForTimeout(200);

      // Cardholder Name
      const nameInput = page.locator('#billingName');
      if (await nameInput.isVisible()) {
        await nameInput.fill('QA Engineer');
      }

      // ZIP
      const zipInput = page.locator('#billingPostalCode');
      if (await zipInput.isVisible()) {
        await zipInput.fill('12345');
      }

      await page.screenshot({
        path: join(SCREENSHOT_DIR, '27_stripe_filled.png'),
      });

      // Click Subscribe/Pay button
      const payBtn = page.locator('.SubmitButton');
      await payBtn.click();
      console.log(
        'Stripe checkout form submitted. Waiting for redirection back to app...'
      );
      await page.waitForTimeout(10000);
      console.log(`Current URL after Stripe submission: ${page.url()}`);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '28_after_stripe.png'),
      });
    }

    // Ensure we are back on profile
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '29_profile_after_upgrade.png'),
    });

    // Switch to Billing tab to verify entitlement update
    const billingTabBtn2 = page
      .getByRole('button', { name: 'Billing', exact: true })
      .or(page.getByText('Billing'))
      .first();
    await billingTabBtn2.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '30_profile_billing_pro.png'),
    });

    // ==========================================
    // PHASE 9: Documents (Upload verification on PRO)
    // ==========================================
    console.log('\n--- PHASE 9: Documents ---');
    console.log('Navigating to /ai...');
    await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SCREENSHOT_DIR, '31_ai_pro_view.png') });

    // We can upload TXT, PDF, DOCX
    // Since front-end mock parses PDF and DOCX, let's create mock text files
    const txtContent =
      'Verification document: 1. Main electrical safety clearance is 3 feet behind panels. 2. Testing grounding wiring system is complete.';
    writeFileSync('scratch/test.txt', txtContent);
    writeFileSync('scratch/test.pdf', 'MOCK PDF DATA');
    writeFileSync('scratch/test.docx', 'MOCK DOCX DATA');
    console.log('Created local files scratch/test.txt, test.pdf, test.docx');

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      // 1. Upload TXT
      console.log('Uploading test.txt...');
      await fileInput.setInputFiles('scratch/test.txt');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '32_doc_upload_txt.png'),
      });

      // 2. Upload PDF
      console.log('Uploading test.pdf...');
      await fileInput.setInputFiles('scratch/test.pdf');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '33_doc_upload_pdf.png'),
      });

      // 3. Upload DOCX (should exceed 2 uploads/month limit on PRO!)
      console.log('Uploading test.docx...');
      await fileInput.setInputFiles('scratch/test.docx');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: join(SCREENSHOT_DIR, '34_doc_upload_docx.png'),
      });
    } else {
      console.log('File input not visible.');
    }

    // ==========================================
    // PHASE 11: Responsiveness check
    // ==========================================
    console.log('\n--- PHASE 11: Responsiveness ---');
    // Tablet
    console.log('Resizing to Tablet (900x1100)...');
    await page.setViewportSize({ width: 900, height: 1100 });
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '35_viewport_tablet.png'),
    });

    // Mobile
    console.log('Resizing to Mobile (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, '36_viewport_mobile.png'),
    });
  } catch (err) {
    console.error('Fatal error during QA automated run:', err);
  } finally {
    await browser.close();
    console.log('\nAudit browser run closed.');
  }
}

run();
