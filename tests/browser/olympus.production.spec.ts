import { expect, test, type Page } from '@playwright/test';

const demoLogin = async (page: Page) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Use Demo Engineer' }).click();
  await expect(
    page.getByRole('heading', { name: /command center/i })
  ).toBeVisible();
};

const authenticatedPage = async (page: Page, path: string) => {
  await demoLogin(page);
  await page.goto(path);
};

test.describe('EngineerOS Olympus real browser verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('application startup, authentication, dashboard, persistence, and logout', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /master the emails.*rfis.*site meetings/i,
      })
    ).toBeVisible();
    await page.getByRole('link', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(/\/login/);

    await demoLogin(page);
    await expect(page.getByText(/demo engineer/i).first()).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { name: /command center/i })
    ).toBeVisible();

    await page.getByLabel(/logout/i).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('core learning routes load through the authenticated shell', async ({
    page,
  }) => {
    await authenticatedPage(page, '/reading');
    await expect(
      page.getByRole('heading', { name: /reading workspace/i })
    ).toBeVisible();
    await expect(page.getByText(/technical mission library/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'My Level', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Basic Site Safety Signs')).toBeVisible();
    await expect(page.getByText('C2', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'All Levels', exact: true }).click();
    await expect(
      page.getByText('Locked', { exact: true }).first()
    ).toBeVisible();

    await page.goto('/writing');
    await expect(
      page.getByRole('heading', { name: /writing composition/i })
    ).toBeVisible();
    await expect(page.getByText(/technical mission library/i)).toBeVisible();
    await expect(page.getByText('Simple Site Update')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'My Level', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/listening');
    await expect(
      page.getByRole('heading', { name: /listening transcript practice/i })
    ).toBeVisible();
    await expect(page.getByText(/transcript/i).first()).toBeVisible();
    await expect(page.getByText('Safe Electrical Room')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'My Level', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/speaking');
    await expect(
      page.getByRole('heading', { name: /speaking workspace/i })
    ).toBeVisible();
    await expect(
      page.getByText(/typed responses are evaluated locally/i).first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Site Introduction', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'My Level', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/vocabulary');
    await expect(
      page.getByRole('heading', { name: 'Vocabulary', exact: true })
    ).toBeVisible();
    await expect(page.getByPlaceholder(/search vocabulary/i)).toBeVisible();
    await expect(page.getByText('Lesson 1', { exact: true })).toBeVisible();
    await page.getByPlaceholder(/search vocabulary/i).fill('height');
    await page.getByRole('button', { name: /^search$/i }).click();
    await expect(page.getByText('Search Results')).toBeVisible();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await page
      .getByPlaceholder(/search vocabulary/i)
      .fill('olympus-custom-term');
    await page.getByRole('button', { name: /^search$/i }).click();
    await page.getByRole('button', { name: /add to my vocabulary/i }).click();
    const addForm = page.getByRole('form', { name: 'Add to My Vocabulary' });
    await addForm.getByLabel('Turkish meaning').fill('özel terim');
    await addForm
      .getByLabel('Example')
      .fill('Use the custom term in this report.');
    await addForm.getByLabel('Domain', { exact: true }).fill('communication');
    await addForm
      .getByRole('button', { name: /save to my vocabulary/i })
      .click();
    await expect(
      page.getByRole('heading', { name: 'olympus-custom-term', exact: true })
    ).toBeVisible();
  });

  test('assessment, AI backend unavailable, profile update, and billing state are visible', async ({
    page,
  }) => {
    await authenticatedPage(page, '/analytics');
    await expect(
      page.getByRole('heading', { name: /assessment profile/i })
    ).toBeVisible();
    await expect(
      page
        .getByText(
          /not enough assessment data yet|not an official cefr certificate/i
        )
        .first()
    ).toBeVisible();

    await page.goto('/ai');
    await expect(
      page
        .getByText(
          /mock ai is active for this demo|secure ai feedback is (?:not )?connected|protected ai connection ready/i
        )
        .first()
    ).toBeVisible();
    await expect(
      page
        .getByText(
          /mock ai demo|ai service unavailable|protected ai connection/i
        )
        .first()
    ).toBeVisible();

    await page.goto('/profile');
    await expect(
      page.getByRole('heading', { name: /profile overview/i })
    ).toBeVisible();

    // Switch to billing tab to check billing state
    await page.getByRole('button', { name: 'Billing', exact: true }).click();
    await expect(page.getByText(/billing backend/i).first()).toBeVisible();

    // Switch back to overview tab to edit profile
    await page.getByRole('button', { name: 'Overview', exact: true }).click();
    await page.getByRole('button', { name: /edit profile/i }).click();
    await page.getByLabel(/first name/i).fill('Olympus');
    await page.getByLabel(/last name/i).fill('Engineer');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(
      page.getByText(/profile overview updated successfully/i)
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Olympus Engineer' })
    ).toBeVisible();
  });

  test('network, backend, audio, speech, offline, and corrupted storage resilience', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      delete (window as Window & { SpeechRecognition?: unknown })
        .SpeechRecognition;
      delete (window as Window & { webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;
      localStorage.setItem('eos_learning_state', '{corrupted');
    });

    await page.route('**/api/**', (route) => route.abort());
    await page.route('**/audio/**', (route) => route.abort());
    await demoLogin(page);

    await page.goto('/offline');
    await expect(
      page.getByRole('heading', { name: /offline (mode|pack)/i })
    ).toBeVisible();
    await expect(page.getByText(/requires internet/i).first()).toBeVisible();

    await page.goto('/ai');
    await expect(
      page.getByRole('heading', { name: /engineering copilot/i })
    ).toBeVisible();
    await expect(page.getByText(/mock ai|backend/i).first()).toBeVisible();

    await page.goto('/listening');
    await expect(
      page.getByRole('heading', { name: /listening transcript practice/i })
    ).toBeVisible();
    await expect(page.getByText(/audio|transcript/i).first()).toBeVisible();

    await page.goto('/speaking');
    await expect(
      page
        .getByText(/no microphone required|text-based communication practice/i)
        .first()
    ).toBeVisible();
  });

  test('work tools, quick tools, and learning intelligence are wired', async ({
    page,
  }) => {
    await authenticatedPage(page, '/work-tools');
    await expect(
      page.getByRole('heading', { name: 'Tools', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Work Tools', exact: true })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(/ncr -> reply/i)).toBeVisible();

    await page.goto('/quick-tools');
    await expect(
      page.getByRole('tab', { name: 'Quick Tools', exact: true })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      page.getByText(/mock ai demo|protected ai connection ready/i).first()
    ).toBeVisible();

    await page.goto('/learning-plan');
    await expect(
      page.getByText(/today’s engineering communication tasks/i)
    ).toBeVisible();
    await expect(page.getByText(/mistake log/i)).toBeVisible();

    await page.goto('/beta-program');
    await expect(
      page.getByRole('heading', { name: /closed beta program/i })
    ).toBeVisible();
    await expect(page.getByText(/\$0-\$5 \/ month/i)).toBeVisible();

    await page.getByLabel(/open closed beta feedback/i).click();
    await expect(page.getByText(/closed beta feedback/i)).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByLabel(/open closed beta feedback/i)).toBeVisible();
    await page.getByLabel(/open closed beta feedback/i).click();
    await page.keyboard.press('Escape');
    await expect(page.getByLabel(/open closed beta feedback/i)).toBeVisible();
  });

  test('level confidence and speaking result remain explicit and light', async ({
    page,
  }) => {
    await authenticatedPage(page, '/dashboard');
    await expect(page.getByText(/starting level: a1 demo path/i)).toBeVisible();
    await expect(page.getByText(/demo default/i).first()).toBeVisible();

    await page.goto('/curriculum');
    await expect(page.getByText('Unified Review Queue')).toBeVisible();
    await expect(
      page.getByText('Lesson 1', { exact: true }).first()
    ).toBeVisible();

    await page.goto('/speaking');
    await page
      .getByPlaceholder(/typed transcript fallback/i)
      .fill(
        'Good morning team. Today we will inspect the cable tray installation before starting cable pulling. Please confirm access, approved drawings, support spacing, safety permits, and inspection records. The electrical supervisor will coordinate the work and report any technical constraint before the afternoon progress meeting.'
      );
    await page
      .getByRole('button', { name: /submit speech assessment/i })
      .or(page.getByRole('button', { name: /submit written roleplay/i }))
      .click();
    const resultPanel = page.getByTestId('speaking-result-panel');
    await expect(resultPanel).toBeVisible();
    const light = await resultPanel.evaluate((element) => {
      const color = getComputedStyle(element).backgroundColor;
      const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
      return channels.slice(0, 3).every((channel) => channel > 220);
    });
    expect(light).toBe(true);
    await page.getByRole('button', { name: /dismiss diagnostics/i }).click();
  });

  test('responsive desktop, tablet, and mobile viewports remain navigable', async ({
    page,
  }) => {
    await demoLogin(page);

    const viewports = [
      { width: 1440, height: 1000, label: 'desktop' },
      { width: 900, height: 1100, label: 'tablet' },
      { width: 390, height: 844, label: 'mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/dashboard');
      await expect(
        page.getByRole('heading', { name: /command center/i })
      ).toBeVisible();
      await expect(page.getByLabel(/toggle navigation sidebar/i)).toBeVisible();
      for (const metric of ['score', 'elo', 'done']) {
        const fits = await page
          .getByTestId(`dashboard-summary-${metric}`)
          .evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1
          );
        expect(fits, `${metric} metric should not overflow`).toBe(true);
      }
    }
  });

  test('light SaaS surfaces remain light during card hover', async ({
    page,
  }) => {
    await demoLogin(page);
    const colorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme
    );
    expect(colorScheme).toContain('light');

    const card = page.locator('main .premium-panel').first();
    await expect(card).toBeVisible();
    await card.hover();
    const isLightHover = await card.evaluate((element) => {
      const style = getComputedStyle(element);
      const color = style.backgroundColor;
      const bgImg = style.backgroundImage;
      if (
        bgImg &&
        (bgImg.includes('rgba(255, 255, 255') ||
          bgImg.includes('rgba(248, 249, 251'))
      ) {
        return true;
      }
      const values = color.match(/[\d.]+/g)?.map(Number) || [];
      if (color.startsWith('oklab') || color.startsWith('oklch')) {
        return (values[0] || 0) > 0.8;
      }
      if (color.startsWith('color(srgb')) {
        return values.slice(0, 3).every((channel) => channel > 0.8);
      }
      if (values.length >= 4 && values[3] === 0) {
        return (
          bgImg && !bgImg.includes('rgba(0, 0, 0') && !bgImg.includes('#141A22')
        );
      }
      return values.slice(0, 3).every((channel) => channel > 220);
    });
    expect(isLightHover).toBe(true);

    const primaryButton = page
      .getByRole('button', { name: /continue mission|start today/i })
      .first();
    const primaryIsNotBlack = await primaryButton.evaluate((element) => {
      const style = getComputedStyle(element);
      const color = style.backgroundColor;
      const bgImg = style.backgroundImage;
      if (
        bgImg &&
        (bgImg.includes('#617FD8') ||
          bgImg.includes('#4D6BC0') ||
          bgImg.includes('rgb('))
      ) {
        return true;
      }
      const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
      if (channels.length >= 4 && channels[3] === 0) {
        return (
          bgImg && !bgImg.includes('rgba(0, 0, 0') && !bgImg.includes('#000')
        );
      }
      return (
        channels.length < 3 ||
        channels.slice(0, 3).some((channel) => channel > 70)
      );
    });
    expect(primaryIsNotBlack).toBe(true);

    const rightPanel = page.getByTestId('dashboard-right-panel');
    await expect(rightPanel).toBeVisible();
    expect(
      await rightPanel.evaluate((element) => getComputedStyle(element).position)
    ).toBe('sticky');
    expect(
      await rightPanel.evaluate(
        (element) => getComputedStyle(element).borderLeftWidth
      )
    ).not.toBe('0px');
  });

  test('keyboard navigation exposes visible focus and primary controls', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await page.getByLabel(/email address/i).focus();
    await expect(page.getByLabel(/email address/i)).toBeFocused();

    await demoLogin(page);
    await page.getByLabel(/toggle navigation sidebar/i).focus();
    await expect(page.getByLabel(/toggle navigation sidebar/i)).toBeFocused();
    await page.keyboard.press('Tab');
    const shellFocusedTag = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(shellFocusedTag).toMatch(/INPUT|BUTTON|A/);
  });
});
