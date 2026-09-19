#!/usr/bin/env node
/**
 * preview-seed-onboarding.mjs — get a throwaway browser profile past onboarding
 * so the learning pages can be opened directly while previewing.
 *
 * `OnboardingGate` (src/features/profile/OnboardingGate.tsx) replaces the whole
 * authenticated app with the "pick a discipline / pick a language" wizard until
 * the learning profile carries `onboardingCompleted` plus a valid discipline and
 * interface language, so /vocabulary, /grammar and the other learning routes all
 * render the wizard instead of the page you asked for. A visitor without a
 * session never even reaches them: /dashboard and friends redirect to /sign-in.
 *
 * This walks the same path a user walks — the demo entry on /start, then the
 * wizard — so the profile is written through LearningProfileRepository exactly
 * as a real completion would (discipline lock included). Writing those keys by
 * hand means re-deriving the identity-scoped namespace from
 * src/shared/storage/index.ts; the wizard needs no such guess. It then proves
 * the learning routes open without the wizard, and exits non-zero if they don't.
 *
 * Usage:
 *   node scripts/preview-seed-onboarding.mjs [url] [discipline]
 *
 * Examples:
 *   node scripts/preview-seed-onboarding.mjs
 *   node scripts/preview-seed-onboarding.mjs http://localhost:3000/ software
 *
 * `discipline` is one of ENGINEERING_DISCIPLINES (src/shared/constants/
 * engineering-disciplines.ts); the default is `software`. The dev server must
 * already be running — start it per .freebuff/run.md.
 *
 * Note: the browser profile here is Playwright's own throwaway context, which is
 * what makes the verification repeatable. It does NOT touch an already open
 * Preview tab, whose profile the app is rendering from — see .freebuff/run.md
 * for seeding that one.
 */
let pw;
try {
  pw = await import('playwright');
} catch {
  pw = await import('playwright-core');
}

/** Mirror of ENGINEERING_DISCIPLINES — the wizard renders its tiles in this order. */
const DISCIPLINES = [
  'architecture',
  'chemical',
  'civil',
  'electrical',
  'electronics',
  'hse',
  'industrial',
  'mechanical',
  'mechatronics',
  'software',
];

/** The wizard's choice tiles, and its single "next" button. */
const WIZARD_TILES = 'main section button[aria-pressed]';
const WIZARD_NEXT = 'footer button';
/**
 * /start's demo entry. Its label is a hardcoded Turkish string
 * (src/pages/StartPage/index.tsx), unlike the navbar's translated demo button,
 * so matching it keeps the flow independent of the interface language.
 */
const DEMO_ENTRY = /demo mühendis/i;
/** /vocabulary marks every word card, so the count is the page's own contract. */
const VOCABULARY_CARD = '[data-testid="vocabulary-word-card"]';

const url = process.argv[2] ?? 'http://localhost:3000/';
const discipline = process.argv[3] ?? 'software';
const disciplineIndex = DISCIPLINES.indexOf(discipline);
const base = new URL(url);

const isUp = async () => {
  try {
    const res = await fetch(base.href, { signal: AbortSignal.timeout(1500) });
    return res.status < 500;
  } catch {
    return false;
  }
};

const run = async () => {
  if (disciplineIndex < 0) {
    console.error(
      `[preview-seed] unknown discipline "${discipline}" — expected one of ${DISCIPLINES.join(', ')}`
    );
    return 1;
  }
  if (!(await isUp())) {
    console.error(
      `[preview-seed] no dev server answering on ${base.origin} — start it first (see .freebuff/run.md)`
    );
    return 1;
  }

  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  // The cookie banner is a fixed z-50 overlay that would intercept the wizard's
  // next button (and its accept button reloads the app). Pin consent up front,
  // the same way preview-shot.mjs pins the theme.
  await page.addInitScript(() => {
    try {
      globalThis.localStorage.setItem('engvox_cookie_consent', 'accepted');
    } catch {
      /* storage unavailable — the banner may show, and the click below will say so */
    }
  });

  try {
    await page.goto(new URL('/start', base).href, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.locator('main').getByRole('button', { name: DEMO_ENTRY }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    const tiles = page.locator(WIZARD_TILES).first();
    const wizardShown = await tiles
      .waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => true)
      .catch(() => false);

    if (!wizardShown) {
      console.log('[preview-seed] no onboarding wizard for this session — nothing to seed');
    } else {
      await page.locator(WIZARD_TILES).nth(disciplineIndex).click();
      const next = page.locator(WIZARD_NEXT);
      if (!(await next.isEnabled())) {
        throw new Error('the wizard kept its next button disabled after a discipline was picked');
      }
      await next.click();
      await page.waitForFunction(
        (selector) => !globalThis.document.querySelector(selector),
        WIZARD_NEXT,
        { timeout: 15_000 }
      );
      console.log(`[preview-seed] onboarding completed (discipline: ${discipline})`);
    }

    // /vocabulary renders word cards once the seed content has loaded.
    await page.goto(new URL('/vocabulary', base).href, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForFunction(
      (selector) => globalThis.document.querySelectorAll(selector).length > 0,
      VOCABULARY_CARD,
      { timeout: 60_000 }
    );
    const cards = await page.locator(VOCABULARY_CARD).count();
    if ((await page.locator(WIZARD_NEXT).count()) > 0) {
      throw new Error('/vocabulary still renders the onboarding wizard');
    }
    console.log(`[preview-seed] /vocabulary: ${cards} word cards, no wizard`);

    // /grammar titles its page header with a literal "Grammar", so the marker
    // does not depend on the interface language.
    await page.goto(new URL('/grammar', base).href, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForFunction(
      () =>
        [...globalThis.document.querySelectorAll('h1')].some(
          (heading) => heading.textContent.trim() === 'Grammar'
        ),
      null,
      { timeout: 60_000 }
    );
    if ((await page.locator(WIZARD_NEXT).count()) > 0) {
      throw new Error('/grammar still renders the onboarding wizard');
    }
    console.log('[preview-seed] /grammar: header rendered, no wizard');
  } catch (error) {
    console.error(`[preview-seed] FAIL ${error.message}`);
    for (const pageError of pageErrors) console.error(`[preview-seed] page error: ${pageError}`);
    return 1;
  } finally {
    await browser.close();
  }

  console.log('[preview-seed] OK — learning routes open without onboarding');
  return 0;
};

process.exit(await run());
