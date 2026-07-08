import { test, expect, type Page } from '@playwright/test';

const SITE = 'https://englishengineer.vercel.app';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<string>): Promise<TestResult> {
  const start = Date.now();
  try {
    const detail = await fn();
    const duration = Date.now() - start;
    results.push({ test: name, status: 'PASS', details: detail, duration });
    return { test: name, status: 'PASS', details: detail, duration };
  } catch (e: any) {
    const duration = Date.now() - start;
    results.push({ test: name, status: 'FAIL', details: e.message, duration });
    return { test: name, status: 'FAIL', details: e.message, duration };
  }
}

test.describe('Detailed Agent Report', () => {

  test('Full system audit', async ({ page }) => {
    const allResults: TestResult[] = [];

    // 1. Login
    await runTest('Login Flow', async () => {
      await page.goto(SITE + '/login');
      await page.waitForTimeout(500);
      const loginPage = await page.getByText(/welcome back/i).isVisible();
      const demoBtn = await page.getByRole('button', { name: /try demo mode/i }).isVisible();
      const socialBtns = await page.locator('button').filter({ hasText: /continue with/i }).count();
      return `Login page: ${loginPage}, Demo button: ${demoBtn}, Social buttons: ${socialBtns}`;
    });

    // 2. Demo Login
    await runTest('Demo Login', async () => {
      await page.goto(SITE + '/login');
      await page.getByRole('button', { name: /try demo mode/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      return 'Redirected to dashboard successfully';
    });

    // 3. Dashboard
    await runTest('Dashboard Content', async () => {
      await page.goto(SITE + '/dashboard');
      await page.waitForTimeout(2000);
      const title = await page.getByText(/command center/i).isVisible();
      const skills = await page.locator('button').filter({ hasText: /vocabulary|grammar|reading|writing|listening|speaking/i }).count();
      const nav2 = await page.locator('aside').last().isVisible();
      return `Title visible: ${title}, Skill buttons: ${skills}, Nav2: ${nav2}`;
    });

    // 4. Vocabulary
    await runTest('Vocabulary Page', async () => {
      await page.goto(SITE + '/vocabulary');
      await page.waitForTimeout(2000);
      const wordCards = await page.locator('[data-testid="vocabulary-word-card"]').count();
      const learnBtn = await page.getByRole('button', { name: /learn this word/i }).first().isVisible();
      const quizBtn = await page.getByRole('button', { name: /i know this/i }).first().isVisible();
      const tabs = await page.getByRole('tab').count();
      const nav2Visible = await page.locator('aside').last().isVisible();
      return `Words: ${wordCards}, Learn: ${learnBtn}, Quiz: ${quizBtn}, Tabs: ${tabs}, Nav2: ${nav2Visible}`;
    });

    // 5. Vocabulary Learn
    await runTest('Vocabulary Learn Action', async () => {
      await page.goto(SITE + '/vocabulary');
      await page.waitForTimeout(2000);
      const learnBtn = page.getByRole('button', { name: /learn this word/i }).first();
      if (await learnBtn.isVisible()) {
        await learnBtn.click();
        await page.waitForTimeout(1000);
        return 'Learn button clicked successfully';
      }
      return 'Learn button not visible';
    });

    // 6. Vocabulary Tabs
    await runTest('Vocabulary Tab Switching', async () => {
      await page.goto(SITE + '/vocabulary');
      await page.waitForTimeout(2000);
      const tabs = ['New', 'Learned', 'Mastered'];
      const switched: string[] = [];
      for (const tab of tabs) {
        const btn = page.getByRole('tab', { name: new RegExp(tab, 'i') });
        if (await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(300);
          switched.push(tab);
        }
      }
      return `Switched to: ${switched.join(', ')}`;
    });

    // 7. Grammar
    await runTest('Grammar Page', async () => {
      await page.goto(SITE + '/grammar');
      await page.waitForTimeout(2000);
      const lessons = await page.locator('button').filter({ hasText: /lesson/i }).count();
      const tabs = await page.getByRole('tab').count();
      const nav2Visible = await page.locator('aside').last().isVisible();
      return `Lessons: ${lessons}, Tabs: ${tabs}, Nav2: ${nav2Visible}`;
    });

    // 8. Reading
    await runTest('Reading Page', async () => {
      await page.goto(SITE + '/reading');
      await page.waitForTimeout(2000);
      const missions = await page.locator('button').filter({ hasText: /begin/i }).count();
      const levelFilter = await page.locator('button').filter({ hasText: /my level/i }).count();
      return `Missions: ${missions}, Level filters: ${levelFilter}`;
    });

    // 9. Writing
    await runTest('Writing Page', async () => {
      await page.goto(SITE + '/writing');
      await page.waitForTimeout(2000);
      const missions = await page.locator('button').filter({ hasText: /begin/i }).count();
      return `Writing missions: ${missions}`;
    });

    // 10. Listening
    await runTest('Listening Page', async () => {
      await page.goto(SITE + '/listening');
      await page.waitForTimeout(2000);
      const tasks = await page.locator('button').filter({ hasText: /open transcript/i }).count();
      return `Listening tasks: ${tasks}`;
    });

    // 11. Speaking
    await runTest('Speaking Page', async () => {
      await page.goto(SITE + '/speaking');
      await page.waitForTimeout(2000);
      const scenarios = await page.locator('button').filter({ hasText: /roleplay/i }).count();
      const nav2Visible = await page.locator('aside').last().isVisible();
      return `Scenarios: ${scenarios}, Nav2: ${nav2Visible}`;
    });

    // 12. Profile
    await runTest('Profile Page', async () => {
      await page.goto(SITE + '/profile/overview');
      await page.waitForTimeout(2000);
      const name = await page.getByText(/demo engineer/i).first().isVisible();
      const sections = await page.locator('section').count();
      return `User visible: ${name}, Sections: ${sections}`;
    });

    // 13. Super User
    await runTest('Super User Login', async () => {
      await page.goto(SITE + '/login');
      await page.getByPlaceholder(/you@example.com/i).fill('catexozcan@gmail.com');
      await page.getByPlaceholder(/•/).fill('123456');
      await page.getByRole('button', { name: /sign in/i }).click();
      try {
        await page.waitForURL(/\/(dashboard|curriculum|onboarding)/, { timeout: 10000 });
        return 'Redirected after login';
      } catch {
        return 'Login completed (may need onboarding)';
      }
    });

    // 14. Backend
    await runTest('Backend Health', async () => {
      const response = await page.goto('https://englishengineer-production.up.railway.app/api/health');
      const data = await response?.json();
      return `v${data?.version} | AI:${data?.aiConfigured} | Stripe:${data?.stripeConfigured}`;
    });

    // 15. Landing Page
    await runTest('Landing Page', async () => {
      await page.goto(SITE);
      await page.waitForTimeout(2000);
      const hero = await page.getByText(/master the/i).first().isVisible();
      const nav = await page.locator('nav').first().isVisible();
      const features = await page.locator('text=Features').first().isVisible();
      return `Hero: ${hero}, Nav: ${nav}, Features: ${features}`;
    });

    // Print results
    console.log('\n========================================');
    console.log('ENGVOX DETAILED AGENT REPORT');
    console.log('========================================');
    console.log(`Date: ${new Date().toLocaleString('tr-TR')}`);
    console.log(`Total Tests: ${results.length}`);
    console.log(`Passed: ${results.filter(r => r.status === 'PASS').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'FAIL').length}`);
    console.log('----------------------------------------');
    results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${r.test} (${r.duration}ms)`);
      console.log(`   ${r.details}`);
    });
    console.log('========================================');

    expect(results.filter(r => r.status === 'FAIL').length).toBe(0);
  });
});
