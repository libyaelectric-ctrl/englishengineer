#!/usr/bin/env node
/**
 * check-grammar-drill-nav.mjs — guard for TD-027.
 *
 * Why it exists: the grammar drill pins its Correct/Review/Mic bar to the bottom
 * of the viewport (`fixed inset-x-0 bottom-0 z-40 … md:hidden`) and the app shell
 * pins the mobile navigation to the same strip (`fixed inset-x-0 bottom-0 z-30 …
 * lg:hidden`). Below `md` the z-40 bar wins, so every navigation link is dead and a
 * tap aimed at "Profil" silently records the current rule as Correct/Review
 * (`recordUsage`), corrupting learning progress instead of doing nothing
 * (docs/TECH_DEBT.md, TD-027).
 *
 * The fix: the bar claims the strip through `bottom-action-bar.store`, and
 * `MobileBottomNavigation` renders nothing while a bar is on screen. This guard
 * holds both halves of that contract:
 *
 *   1. the drill bar is visible and its own buttons are hit-testable (the fix must
 *      not "win" by hiding the bar), and
 *   2. if the bottom navigation is rendered, every one of its links resolves to
 *      itself — under both `document.elementFromPoint` and Playwright's own
 *      actionability check — so nothing can sit on top of it.
 *
 * Usage:
 *   node scripts/check-grammar-drill-nav.mjs [url] [viewports] [--shots=label]
 *
 * Examples:
 *   node scripts/check-grammar-drill-nav.mjs
 *   node scripts/check-grammar-drill-nav.mjs http://localhost:3000/ 390x844,414x896
 *   node scripts/check-grammar-drill-nav.mjs --shots=drill-nav-after
 *
 * Defaults: http://localhost:3000/ and `390x844,800x900` (the conflict range below
 * `md`, plus the `md`–`lg` range where the bar is hidden and the nav must survive).
 * Exits 1 when any assertion fails, so it can gate a change. The dev server must
 * already be running (.freebuff/run.md); the browser uses Playwright's throwaway
 * profile and completes onboarding through the real UI.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pw;
try {
  pw = await import('playwright');
} catch {
  pw = await import('playwright-core');
}

/** Git Bash (MSYS) rewrites a POSIX-looking argument into a Windows path. */
const normalizeRoute = (route) => {
  const cleaned = route.replace(/^[A-Za-z]:[\\/][^,]*[\\/]/, '/').trim();
  if (!cleaned) return '';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const argv = process.argv.slice(2);
const positional = argv.filter((arg) => !arg.startsWith('--'));
const shotsLabel =
  (
    argv
      .find((flag) => flag.startsWith('--shots'))
      ?.split('=')
      .slice(1)
      .join('=') ?? ''
  ).replace(/[^a-zA-Z0-9._-]+/g, '-') || null;
const shotsDir = path.resolve(__dirname, '..', '.freebuff', 'shots');
const url = positional[0] ?? 'http://localhost:3000/';
const route = normalizeRoute(positional[1] ?? '/grammar') || '/grammar';
const viewportSpec = positional[2] ?? '390x844,800x900';
const base = new URL(url);
const NAV_SELECTOR = 'nav[aria-label="Mobile learning navigation"]';

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

/**
 * Runs in the page: locates the drill bar and the bottom navigation and hit-tests
 * them. Self-contained (no imports, plain DOM APIs).
 */
const probe = (navSelector) => {
  const describe = (element) => {
    if (!element) return 'nothing';
    const testId = element.getAttribute('data-testid');
    const classes = (element.getAttribute('class') ?? '')
      .split(/\s+/)
      .filter((token) => token && !token.includes(':'))
      .slice(0, 2)
      .join('.');
    const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 22);
    return (
      element.tagName.toLowerCase() +
      (testId ? `[data-testid=${testId}]` : '') +
      (classes ? `.${classes}` : '') +
      (text ? ` "${text}"` : '')
    );
  };

  const isRendered = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width >= 2 && rect.height >= 2;
  };

  const hitTest = (element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    const own = !!(hit && (hit === element || element.contains(hit)));
    return {
      ok: own,
      label: describe(element),
      hit: describe(hit),
      centre: { x: Math.round(x), y: Math.round(y) },
    };
  };

  // Prefer the marker; fall back to the structural signature so the guard still
  // works against the pre-fix tree, where the marker does not exist yet.
  const findBar = () => {
    const marked = document.querySelector('[data-testid="grammar-drill-bar"]');
    if (marked) return marked;
    const pinned = [...document.querySelectorAll('div')].filter((element) => {
      const style = getComputedStyle(element);
      if (style.position !== 'fixed') return false;
      if (style.display === 'none') return false;
      if (Math.abs(element.getBoundingClientRect().bottom - window.innerHeight) > 2) return false;
      return /correct/i.test(element.textContent ?? '');
    });
    return pinned[pinned.length - 1] ?? null;
  };

  const bar = findBar();
  const barVisible = isRendered(bar);
  const nav = document.querySelector(navSelector);
  const navVisible = isRendered(nav);

  const overlap =
    barVisible && navVisible
      ? (() => {
          const a = bar.getBoundingClientRect();
          const b = nav.getBoundingClientRect();
          const vertical = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          const horizontal = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          return vertical > 0 && horizontal > 0
            ? { vertical: Math.round(vertical), horizontal: Math.round(horizontal) }
            : null;
        })()
      : null;

  const barButtons = bar ? [...bar.querySelectorAll('button, a[href], [role="button"]')] : [];
  const navLinks = nav ? [...nav.querySelectorAll('a[href]')] : [];

  return {
    barVisible,
    barLabel: describe(bar),
    navVisible,
    navLabel: describe(nav),
    overlap,
    barButtonCount: barButtons.length,
    // Only hit-test the bar's own controls while it is on screen: above `md` its
    // rect is 0x0, and testing an invisible element would report its centre as
    // (0,0) and flag whatever happens to sit in the top-left corner.
    barButtons: (barVisible ? barButtons : []).map(hitTest),
    navLinks: navLinks.map(hitTest),
    viewport: { w: window.innerWidth, h: window.innerHeight },
  };
};

const completeOnboarding = async (page) => {
  await page.goto(new URL('/start', base).href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page
    .locator('main')
    .getByRole('button', { name: /demo mühendis/i })
    .first()
    .click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  const choices = page.locator('main [data-onboarding-choice], main section button[aria-pressed]');
  await choices
    .first()
    .waitFor({ state: 'visible', timeout: 20_000 })
    .catch(() => {});
  for (let pass = 0; pass < 4; pass += 1) {
    const total = await choices.count();
    if (total === 0) break;
    // 10 = the staged discipline grid, 25 = the two-pane layout; 15 is the staged
    // language grid, which is prefilled and must not be clicked (it would switch
    // the whole interface language).
    const canPickDiscipline = total <= 10 || total >= 25;
    if (canPickDiscipline && (await choices.first().getAttribute('aria-pressed')) !== 'true') {
      await choices
        .first()
        .click({ timeout: 10_000 })
        .catch(() => {});
    }
    const primary = page.locator('[data-onboarding-primary]').last();
    if ((await primary.count()) === 0) break;
    await primary.click({ timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(600);
};

/** Playwright's own actionability check: it fails when something else receives a click. */
const trialClick = async (locator) => {
  try {
    await locator.click({ trial: true, timeout: 2500 });
    return null;
  } catch (error) {
    return String(error.message)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)[0];
  }
};

const checkViewport = async (browser, viewport) => {
  const failures = [];
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });
  await page.addInitScript(() => {
    try {
      globalThis.localStorage.setItem('engvox_cookie_consent', 'accepted');
    } catch {
      /* storage unavailable */
    }
  });
  try {
    await completeOnboarding(page);
    await page.goto(new URL(route, base).href, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.waitForSelector('[data-testid="grammar-drill-bar"]', {
      state: 'attached',
      timeout: 20_000,
    });
    await page.waitForTimeout(800);

    const result = await page.evaluate(probe, NAV_SELECTOR);
    const tag = `[drill-nav] ${viewport.label} ${route}`;

    if (!result.barVisible) {
      // Below `md` the drill bar must exist; above it the CSS hides it by design.
      if (viewport.width < 768) {
        failures.push(
          `${tag}: the drill bar is not visible at ${viewport.width}px (${result.barLabel})`
        );
      }
    }
    for (const button of result.barButtons) {
      if (!button.ok) {
        failures.push(
          `${tag}: the bar's ${button.label} resolves to ${button.hit} @${button.centre.x},${button.centre.y}`
        );
      }
    }
    if (result.overlap && result.navVisible) {
      failures.push(
        `${tag}: the bar and the bottom navigation overlap by ${result.overlap.vertical}px vertically`
      );
    }
    if (result.navVisible) {
      for (const link of result.navLinks) {
        if (!link.ok) {
          failures.push(
            `${tag}: nav link ${link.label} resolves to ${link.hit} @${link.centre.x},${link.centre.y}`
          );
        }
      }
      // Independent arbiter: geometric hit-testing can be fooled by stacking
      // contexts, but Playwright refuses to click an intercepted element outright.
      const links = page.locator(`${NAV_SELECTOR} a[href]`);
      const count = await links.count();
      for (let index = 0; index < count; index += 1) {
        const reason = await trialClick(links.nth(index));
        if (reason) {
          failures.push(`${tag}: Playwright refuses nav link #${index + 1} — ${reason}`);
        }
      }
    }

    console.log(
      `${tag}: bar ${result.barVisible ? 'visible' : 'hidden'}, ` +
        `nav ${result.navVisible ? `visible (${result.navLinks.length} links)` : 'not rendered'}, ` +
        `overlap ${result.overlap ? `${result.overlap.vertical}px` : 'none'}`
    );
    if (shotsLabel) {
      mkdirSync(shotsDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const file = path.join(shotsDir, `${shotsLabel}-${ts}-${viewport.label}.png`);
      await page.screenshot({ path: file });
      console.log(`[drill-nav]   shot → ${path.relative(path.resolve(__dirname, '..'), file)}`);
    }
    return failures;
  } finally {
    await page.close();
  }
};

const run = async () => {
  const viewports = parseViewports(viewportSpec);
  if (viewports.length === 0) {
    console.error(`[drill-nav] could not parse viewports "${viewportSpec}" (use WxH,WxH)`);
    return 1;
  }
  if (!(await isUp())) {
    console.error(
      `[drill-nav] no dev server answering on ${base.origin} — start it first (see .freebuff/run.md)`
    );
    return 1;
  }

  const browser = await pw.chromium.launch();
  const failures = [];
  try {
    for (const viewport of viewports) {
      try {
        failures.push(...(await checkViewport(browser, viewport)));
      } catch (error) {
        failures.push(
          `[drill-nav] ${viewport.label}: probe failed — ${String(error.message).split('\n')[0]}`
        );
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`[drill-nav] FAIL — ${failure}`);
    return 1;
  }
  console.log(
    `[drill-nav] OK — the drill bar is usable and nothing covers the mobile navigation ` +
      `(${viewports.map((v) => v.label).join(', ')})`
  );
  return 0;
};

process.exit(await run());
