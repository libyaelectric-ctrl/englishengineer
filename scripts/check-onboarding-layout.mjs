#!/usr/bin/env node
/**
 * check-onboarding-layout.mjs — reproducible guard for the onboarding wizard's
 * layout, in a real browser, at several viewports.
 *
 * Why it exists: the wizard stacks its two panes below `lg`, and each pane used to
 * force its tile grid to `h-[calc(100%-2.1rem)]`. On a phone-sized viewport the
 * grids were taller than the space their pane got, so the discipline grid spilled
 * out of its section and the language section painted over its lower half. Taps
 * aimed at the last four disciplines landed on language buttons instead — picking
 * "Software Engineering" switched the interface language to German
 * (docs/TECH_DEBT.md, TD-025). Any agent driving the wizard through the DOM hit it
 * too: the click coordinates were correct, the element under them was not.
 *
 * The narrow viewport then got a second problem: with both panes stacked, ten
 * disciplines plus fifteen languages made a single long page whose tail (the
 * languages) was off-screen on every phone. The wizard now stages them below `lg`
 * (one list per step, see TD-026), so this script walks the steps instead of
 * assuming every choice is on screen at once.
 *
 * What it asserts, per viewport:
 *   1. every choice button rendered at any point in the wizard is hit-testable at
 *      its own centre (scroll it into view, then `elementFromPoint` must resolve
 *      to that button);
 *   2. all 10 disciplines + 15 languages can be reached (stepping through the
 *      wizard when the layout stages them);
 *   3. picking a discipline marks exactly that tile as pressed and leaves the
 *      selected language untouched;
 *   4. the wizard then completes and hands the app over (no choice buttons left).
 *
 * Assertions 1 and 3 fail on the pre-TD-025 layout, which is what makes this a
 * verification rather than a smoke test. It also prints the scroll metrics that
 * describe the narrow-viewport problem (see `--shots` below for pixels).
 *
 * Usage:
 *   node scripts/check-onboarding-layout.mjs [url] [viewports] [discipline] [--shots=label]
 *
 * Examples:
 *   node scripts/check-onboarding-layout.mjs
 *   node scripts/check-onboarding-layout.mjs http://localhost:3000/ 390x844,1280x800 civil
 *   node scripts/check-onboarding-layout.mjs --shots=onboarding-after
 *
 * Defaults: http://localhost:3000/, `390x844,439x672,1280x800` (the middle one is
 * the Freebuff Preview tab's own viewport, where the overlap bug was observed),
 * `software`. The dev server must already be running — start it per
 * .freebuff/run.md.
 *
 * `--shots=<label>` additionally saves a PNG per viewport per step (initial state
 * and, when the layout stages, after advancing) into `.freebuff/shots/`, which is
 * how a design change is compared before/after. `--theme=dark` captures and
 * measures with `prefers-color-scheme: dark`. The browser profile is Playwright's
 * own throwaway context, so the wizard is present in a fresh profile without
 * touching the live Preview tab's seeded profile.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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
/** Mirror of AVAILABLE_INTERFACE_LANGUAGES. */
const LANGUAGE_COUNT = 15;
const TOTAL_CHOICES = DISCIPLINES.length + LANGUAGE_COUNT;

/** Choices carry `data-onboarding-choice`; the pre-TD-026 markup only had the role. */
const CHOICE_SELECTOR = 'main [data-onboarding-choice], main section button[aria-pressed]';
/** The wizard's forward CTA, marked in the app and identifiable in older markup. */
const PRIMARY_SELECTOR =
  '[data-onboarding-primary], div.fixed.inset-0 > footer button:last-of-type';
const DEFAULT_VIEWPORTS = '390x844,439x672,1280x800';
const MAX_STEPS = 4;

const argv = process.argv.slice(2);
const flags = argv.filter((arg) => arg.startsWith('--'));
const positional = argv.filter((arg) => !arg.startsWith('--'));
const shotsLabel =
  (
    flags
      .find((flag) => flag.startsWith('--shots'))
      ?.split('=')
      .slice(1)
      .join('=') ?? ''
  ).replace(/[^a-zA-Z0-9._-]+/g, '-') || null;
const theme =
  flags.find((flag) => flag.startsWith('--theme'))?.split('=')[1] === 'dark' ? 'dark' : 'light';

const url = positional[0] ?? 'http://localhost:3000/';
const viewportSpec = positional[1] ?? DEFAULT_VIEWPORTS;
const discipline = positional[2] ?? 'software';
const disciplineIndex = DISCIPLINES.indexOf(discipline);
const base = new URL(url);
const shotsDir = path.join(ROOT, '.freebuff', 'shots');

const parseViewports = (spec) =>
  spec
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [width, height] = entry.split('x').map(Number);
      if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
      return { width, height, label: entry };
    })
    .filter(Boolean);

const isUp = async () => {
  try {
    const res = await fetch(base.href, { signal: AbortSignal.timeout(1500) });
    return res.status < 500;
  } catch {
    return false;
  }
};

/** Every choice button currently rendered, with the centre each of them is drawn at. */
const tileReport = () => {
  const buttons = [
    ...globalThis.document.querySelectorAll(
      'main [data-onboarding-choice], main section button[aria-pressed]'
    ),
  ];
  return buttons.map((button, index) => {
    const rect = button.getBoundingClientRect();
    const centre = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    const hit = globalThis.document.elementFromPoint(centre.x, centre.y);
    const owner = hit && hit.closest ? hit.closest('button') : null;
    return {
      index,
      label: button.textContent.trim().replace(/\s+/g, ' ').slice(0, 32),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      },
      centre: { x: Math.round(centre.x), y: Math.round(centre.y) },
      pressed: button.getAttribute('aria-pressed') === 'true',
      hitsSelf: owner === button,
      hit: owner ? owner.textContent.trim().replace(/\s+/g, ' ').slice(0, 32) : null,
    };
  });
};

/** How much scrolling the wizard's own scroll region currently asks for. */
const measureWizard = () => {
  const pane = globalThis.document.querySelector('main');
  if (!pane) return null;
  const paneRect = pane.getBoundingClientRect();
  const choices = [
    ...pane.querySelectorAll('[data-onboarding-choice], section button[aria-pressed]'),
  ];
  const heights = choices.map((choice) => choice.getBoundingClientRect().height);
  const inFold = choices.filter((choice) => {
    const rect = choice.getBoundingClientRect();
    const centre = rect.top + rect.height / 2;
    return centre >= paneRect.top && centre <= paneRect.bottom;
  }).length;
  // `truncate` is deliberate on tile labels, so this is a diagnostic rather than a
  // failure: it is how a denser grid is proven to clip less (or not at all).
  const clipped = [...pane.querySelectorAll('.truncate')]
    .filter((node) => node.scrollWidth > node.clientWidth + 1)
    .map((node) => node.textContent.trim().replace(/\s+/g, ' ').slice(0, 24));
  return {
    choices: choices.length,
    clientHeight: pane.clientHeight,
    scrollHeight: pane.scrollHeight,
    scrollNeeded: Math.max(0, pane.scrollHeight - pane.clientHeight),
    choicesInFold: inFold,
    minTapHeight: heights.length ? Math.round(Math.min(...heights)) : 0,
    horizontalOverflow: Math.max(0, pane.scrollWidth - pane.clientWidth),
    clipped,
  };
};

const shot = async (page, viewport, stage) => {
  mkdirSync(shotsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(shotsDir, `${shotsLabel}-${ts}-${viewport.label}-${stage}.png`);
  await page.screenshot({ path: file });
  console.log(`[onboarding-layout]   shot → ${path.relative(ROOT, file)}`);
};

const checkViewport = async (browser, viewport, seenLabels) => {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: theme,
  });
  const failures = [];
  const steps = [];
  let taps = 0;
  let completions = 0;
  try {
    // The cookie banner is a fixed z-50 overlay; pin consent so it cannot
    // intercept anything (same trick as preview-shot.mjs does for the theme).
    await page.addInitScript(() => {
      try {
        globalThis.localStorage.setItem('engvox_cookie_consent', 'accepted');
      } catch {
        /* storage unavailable */
      }
    });
    await page.goto(new URL('/start', base).href, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page
      .locator('main')
      .getByRole('button', { name: /demo mühendis/i })
      .first()
      .click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await page.locator(CHOICE_SELECTOR).first().waitFor({ state: 'visible', timeout: 20_000 });

    let disciplinePicked = false;
    let stepIndex = 0;

    while (stepIndex < MAX_STEPS) {
      stepIndex += 1;
      const tiles = page.locator(CHOICE_SELECTOR);
      const count = await tiles.count();

      // 1. Hit-testing: bring each choice into view first, the way a user would
      // have to, then check that its own centre belongs to it.
      const misses = [];
      for (let index = 0; index < count; index += 1) {
        await tiles.nth(index).scrollIntoViewIfNeeded();
        const report = await page.evaluate(tileReport);
        const tile = report[index];
        if (!tile?.hitsSelf) misses.push(tile);
      }
      if (misses.length > 0) {
        failures.push(
          `step ${stepIndex}: ${misses.length}/${count} choice button(s) are covered at their own ` +
            `centre: ` +
            misses
              .map((tile) => `[${tile.index}] "${tile.label}" → ${tile.hit ?? 'nothing'}`)
              .join('; ')
        );
      }

      const metrics = await page.evaluate(measureWizard);
      const report = await page.evaluate(tileReport);
      const labels = report.map((tile) => tile.label);
      labels.forEach((label) => seenLabels.add(label));
      steps.push({
        step: stepIndex,
        choices: count,
        scrollNeeded: metrics?.scrollNeeded ?? null,
        choicesInFold: metrics?.choicesInFold ?? null,
        minTapHeight: metrics?.minTapHeight ?? null,
        horizontalOverflow: metrics?.horizontalOverflow ?? null,
        clipped: metrics?.clipped ?? [],
      });

      if (shotsLabel) await shot(page, viewport, `step${stepIndex}`);
      if (shotsLabel && (metrics?.scrollNeeded ?? 0) > 0) {
        await page.evaluate(() => {
          const pane = globalThis.document.querySelector('main');
          if (pane) pane.scrollTop = pane.scrollHeight;
        });
        await shot(page, viewport, `step${stepIndex}-scrolled`);
        await page.evaluate(() => {
          const pane = globalThis.document.querySelector('main');
          if (pane) pane.scrollTop = 0;
        });
      }

      // 3. Interaction: the discipline tile must win its own tap, and the
      // language selection must not move because of it. Playwright's own
      // actionability check aborts when another element covers the target, so
      // that refusal is a failure to record rather than an error to crash on.
      if (!disciplinePicked) {
        // Plain case-insensitive substring, never a pattern built from the argv
        // value: a `new RegExp(discipline)` here is a regex-injection finding
        // (CodeQL `js/regex-injection`, high) and it also made `.` and `*` in an
        // argument behave as wildcards rather than as characters.
        const wanted = discipline.toLowerCase();
        const target =
          report.find((tile) => tile.index === disciplineIndex) ??
          report.find((tile) => tile.label.toLowerCase().includes(wanted));
        if (target) {
          const languageBefore = report
            .filter((tile) => tile.index >= DISCIPLINES.length && tile.pressed)
            .map((tile) => tile.index);
          let clickError = null;
          try {
            await tiles.nth(target.index).click({ timeout: 10_000 });
            taps += 1;
          } catch (error) {
            clickError = String(error.message).split('\n')[0];
          }
          const afterClick = await page.evaluate(tileReport);
          if (clickError) {
            failures.push(`clicking the "${discipline}" tile was blocked: ${clickError}`);
          } else if (!afterClick[target.index]?.pressed) {
            failures.push(
              `clicking the "${discipline}" tile left it unpressed ` +
                `(hit ${afterClick[target.index]?.hit ?? 'nothing'})`
            );
          }
          const languageAfter = afterClick
            .filter((tile) => tile.index >= DISCIPLINES.length && tile.pressed)
            .map((tile) => tile.index);
          if (languageAfter.join(',') !== languageBefore.join(',')) {
            failures.push(
              `the tap changed the selected language: ${languageBefore.join(',') || 'none'} → ` +
                `${languageAfter.join(',') || 'none'}`
            );
          }
          disciplinePicked = true;
        }
      }

      if (seenLabels.size >= TOTAL_CHOICES) break;

      // 2. Step through the wizard: unreachable choices mean the layout staged
      // them behind a CTA, so press it and look again.
      const primary = page.locator(PRIMARY_SELECTOR).last();
      if ((await primary.count()) === 0) {
        failures.push(
          `step ${stepIndex}: no forward control, ${seenLabels.size} choice(s) reached`
        );
        break;
      }
      let advanceError = null;
      try {
        await primary.click({ timeout: 10_000 });
        taps += 1;
      } catch (error) {
        advanceError = String(error.message).split('\n')[0];
      }
      if (advanceError) {
        failures.push(`advancing past step ${stepIndex} failed: ${advanceError}`);
        break;
      }
      await page.waitForTimeout(500);
    }

    if (seenLabels.size < TOTAL_CHOICES) {
      failures.push(
        `only ${seenLabels.size}/${TOTAL_CHOICES} choices were reachable within ${MAX_STEPS} steps`
      );
    }

    // 4. Completion: the wizard must hand the app over (its choices disappear).
    const primary = page.locator(PRIMARY_SELECTOR).last();
    try {
      await primary.click({ timeout: 10_000 });
      taps += 1;
      await page.locator(CHOICE_SELECTOR).first().waitFor({ state: 'detached', timeout: 15_000 });
      completions += 1;
    } catch (error) {
      failures.push(`the wizard did not complete: ${String(error.message).split('\n')[0]}`);
    }

    return { label: viewport.label, steps, taps, completions, failures };
  } catch (error) {
    failures.push(String(error.message).split('\n')[0]);
    return { label: viewport.label, steps, taps, completions, failures };
  } finally {
    await page.close();
  }
};

const run = async () => {
  const viewports = parseViewports(viewportSpec);
  if (disciplineIndex < 0) {
    console.error(
      `[onboarding-layout] unknown discipline "${discipline}" — expected one of ${DISCIPLINES.join(', ')}`
    );
    return 1;
  }
  if (viewports.length !== viewportSpec.split(',').filter(Boolean).length) {
    console.error(`[onboarding-layout] could not parse viewports "${viewportSpec}" (use WxH,WxH)`);
    return 1;
  }
  if (!(await isUp())) {
    console.error(
      `[onboarding-layout] no dev server answering on ${base.origin} — start it first (see .freebuff/run.md)`
    );
    return 1;
  }
  if (shotsLabel)
    console.log(`[onboarding-layout] capturing into .freebuff/shots/ as "${shotsLabel}"`);

  const browser = await pw.chromium.launch();
  let failed = 0;
  try {
    for (const viewport of viewports) {
      const seenLabels = new Set();
      const result = await checkViewport(browser, viewport, seenLabels);
      const steps = result.steps
        .map(
          (step) =>
            `step ${step.step}: ${step.choices} choices, ` +
            `${step.choicesInFold} in view, scroll ${step.scrollNeeded}px, ` +
            `min tap ${step.minTapHeight}px, ` +
            `${step.clipped.length} clipped` +
            (step.clipped.length > 0 ? ` [${step.clipped.slice(0, 3).join(' | ')}]` : '')
        )
        .join(' | ');
      const overflow = Math.max(0, ...result.steps.map((step) => step.horizontalOverflow ?? 0));
      const summary =
        `${steps} | ${seenLabels.size}/${TOTAL_CHOICES} choices reached, ` +
        `${result.taps} taps, ${result.completions} completion(s), ` +
        `${overflow}px horizontal overflow`;

      if (result.failures.length > 0) {
        failed += 1;
        console.error(`[onboarding-layout] ${result.label}: FAIL (${summary})`);
        for (const failure of result.failures) console.error(`[onboarding-layout]   ${failure}`);
      } else {
        console.log(`[onboarding-layout] ${result.label}: OK (${summary})`);
      }
    }
  } finally {
    await browser.close();
  }

  if (failed > 0) {
    console.error(`[onboarding-layout] FAIL — ${failed}/${viewports.length} viewport(s)`);
    return 1;
  }
  console.log(`[onboarding-layout] OK — all ${viewports.length} viewport(s) pass`);
  return 0;
};

process.exit(await run());
