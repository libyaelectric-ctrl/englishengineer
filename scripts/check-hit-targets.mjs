#!/usr/bin/env node
/**
 * check-hit-targets.mjs — the generalised version of the check that found TD-025.
 *
 * Why it exists: TD-025 was a pane with a fixed height (`h-[calc(100dvh-7rem)]`)
 * whose children declared their own heights, so on a phone one section painted over
 * the other and taps landed on the wrong control — the coordinates were right, the
 * element under them was not. TD-026 fixed the wizard; this script exists to ask
 * whether the same pattern (fixed-height container + grid that does not fit) hides
 * choices on the rest of the app.
 *
 * For every route (and every `role="tab"` panel it can switch to), each viewport
 * gets one pass over *every* interactive element, classified as:
 *   - `covered`     — the element's own centre resolves to a different control
 *                     through `document.elementFromPoint` (a mis-targeted tap);
 *   - `unreachable` — the centre is outside the viewport even after
 *                     `scrollIntoViewIfNeeded` (scrolling cannot reveal it);
 *   - `clipped`     — an `overflow: hidden|clip` ancestor cuts the element off
 *                     (hidden content, even when the visible sliver still clicks).
 * Scrollable ancestors are *not* clipping: being below the fold of a scroll region
 * is normal, so only a container that cannot scroll to reveal the element counts.
 *
 * Usage:
 *   node scripts/check-hit-targets.mjs [url] [routes] [viewports] [--shots=label] [--theme=dark]
 *
 * Examples:
 *   node scripts/check-hit-targets.mjs
 *   node scripts/check-hit-targets.mjs http://localhost:3000/ /dashboard,/vocabulary 390x844
 *   node scripts/check-hit-targets.mjs --theme=dark --shots=hit-targets-dark
 *
 * Defaults: http://localhost:3000/, the dashboard + learning routes,
 * `390x844,1280x800`, light theme. Exits 1 when any `covered` or `unreachable`
 * element is found (so it can gate a change); `clipped` alone is reported, not
 * failed, because a deliberately ellipsised label is also clipped.
 *
 * The dev server must already be running (.freebuff/run.md). The browser uses
 * Playwright's throwaway profile and completes onboarding through the real UI, so
 * the live Preview tab's seeded profile is untouched.
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

const DEFAULT_ROUTES = [
  '/dashboard',
  '/vocabulary',
  '/grammar',
  '/reading',
  '/listening',
  '/writing',
  '/speaking',
  '/profile',
  '/settings',
].join(',');

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

/**
 * Git Bash (MSYS) rewrites an argument that looks like a POSIX path into a Windows
 * one, so `/dashboard,/vocabulary` arrives as `C:/Program Files/Git/dashboard,...`.
 * Undo the mangling here, and accept `dashboard` without the slash, so the command
 * behaves the same in every shell.
 */
const normalizeRoute = (route) => {
  const cleaned = route.replace(/^[A-Za-z]:[\\/][^,]*[\\/]/, '/').trim();
  if (!cleaned) return '';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const url = positional[0] ?? 'http://localhost:3000/';
const routes = (positional[1] ?? DEFAULT_ROUTES).split(',').map(normalizeRoute).filter(Boolean);
const viewportSpec = positional[2] ?? '390x844,1280x800';
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

/**
 * Runs in the page. Collects every visible interactive element and classifies it;
 * must stay self-contained (no imports, plain DOM APIs).
 */
const scanInteractive = () => {
  const INTERACTIVE =
    'a[href], button, [role="button"], [role="tab"], [role="switch"], [role="radio"], ' +
    '[role="checkbox"], [role="option"], [role="menuitem"], [role="link"], input, select, ' +
    'textarea, summary, [tabindex]:not([tabindex="-1"])';

  const describe = (element) => {
    const testId = element.getAttribute('data-testid');
    const classes = (element.getAttribute('class') ?? '')
      .split(/\s+/)
      .filter((token) => token && !token.includes(':'))
      .slice(0, 2)
      .join('.');
    const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 26);
    return (
      element.tagName.toLowerCase() +
      (testId ? `[data-testid=${testId}]` : '') +
      (classes ? `.${classes}` : '') +
      (text ? ` "${text}"` : '')
    );
  };

  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    const style = getComputedStyle(element);
    return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
  };

  /** Inside a closed drawer: `aria-hidden` / `inert` subtrees are off duty by design. */
  const isInert = (element) => {
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      if (node.getAttribute?.('aria-hidden') === 'true') return true;
      if (node.hasAttribute?.('inert')) return true;
    }
    return false;
  };

  /** A full-viewport fixed layer (modal or drawer scrim) is on top of everything. */
  const fullViewportScrim = () => {
    for (const node of document.querySelectorAll('div, button, [role="presentation"]')) {
      const style = getComputedStyle(node);
      if (style.position !== 'fixed' || style.display === 'none') continue;
      const rect = node.getBoundingClientRect();
      if (rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9) {
        return describe(node);
      }
    }
    return null;
  };

  /** Off-canvas on purpose: skip links and `sr-only` controls park outside the viewport
      and come back on focus — reported separately so they never read as a defect. */
  const isDeliberatelyOffscreen = (element) => {
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      const className = String(node.getAttribute?.('class') ?? '');
      if (/skip-link|sr-only/.test(className)) return true;
    }
    return false;
  };

  /** Nearest ancestor that could cut this element off, if it actually does. */
  const clippingAncestor = (element) => {
    const own = element.getBoundingClientRect();
    let ancestor = element.parentElement;
    for (let depth = 0; ancestor && depth < 14; depth += 1, ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const overflowX = style.overflowX;
      const overflowY = style.overflowY;
      const hidesX = overflowX === 'hidden' || overflowX === 'clip';
      const hidesY = overflowY === 'hidden' || overflowY === 'clip';
      const scrollsX = overflowX === 'auto' || overflowX === 'scroll';
      const scrollsY = overflowY === 'auto' || overflowY === 'scroll';
      if (!hidesX && !hidesY && !scrollsX && !scrollsY) continue;
      const rect = ancestor.getBoundingClientRect();
      const cut =
        own.bottom > rect.bottom + 1 ||
        own.top < rect.top - 1 ||
        own.right > rect.right + 1 ||
        own.left < rect.left - 1;
      if (!cut) return null;
      // A scroll region can still bring the element into view — unless it is out
      // of room on that axis (scrollHeight === clientHeight) or the axis is hidden.
      const canScrollY = ancestor.scrollHeight > ancestor.clientHeight + 1;
      const canScrollX = ancestor.scrollWidth > ancestor.clientWidth + 1;
      const unreachableY = hidesY || (scrollsY && !canScrollY);
      const unreachableX = hidesX || (scrollsX && !canScrollX);
      const verticalCut = own.bottom > rect.bottom + 1 || own.top < rect.top - 1;
      const horizontalCut = own.right > rect.right + 1 || own.left < rect.left - 1;
      if ((verticalCut && unreachableY) || (horizontalCut && unreachableX)) {
        return {
          selector: describe(ancestor),
          overflow: `${overflowX}/${overflowY}`,
          container: {
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          },
        };
      }
      return null;
    }
    return null;
  };

  const scrim = fullViewportScrim();
  const nodes = [...document.querySelectorAll(INTERACTIVE)].filter(
    (element) => isVisible(element) && !isInert(element)
  );
  const seen = new Set();
  const covered = [];
  const clipped = [];
  const unreachable = [];
  const offCanvas = [];
  const focusRevealed = [];
  const offscreenByDesign = [];
  const startScroll = {
    x: window.scrollX,
    y: window.scrollY,
  };

  for (const node of nodes) {
    const key = `${node.tagName}|${describe(node)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Bring the element into view the way a user or a driving agent would have to
    // before judging it: an element below the fold is not yet a bug.
    node.scrollIntoView({ block: 'center', inline: 'nearest' });
    let rect = node.getBoundingClientRect();
    let centre = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    const inViewport = () =>
      centre.x >= 0 &&
      centre.y >= 0 &&
      centre.x <= window.innerWidth &&
      centre.y <= window.innerHeight;

    if (!inViewport()) {
      if (isDeliberatelyOffscreen(node)) {
        offscreenByDesign.push({ broken: describe(node) });
        continue;
      }
      // Off-canvas on focus (collapsed drawers) reveals itself when focused —
      let revealed;
      try {
        node.focus({ preventScroll: true });
        rect = node.getBoundingClientRect();
        centre = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        revealed = inViewport();
      } catch {
        revealed = false;
      }
      if (revealed) {
        focusRevealed.push({ broken: describe(node) });
        continue;
      }
      // Off-screen horizontally means a closed drawer/panel (opened by its own
      // control) rather than a page that cannot be scrolled; only the vertical axis
      // describes content the user cannot reach.
      const axis = centre.x < 0 || centre.x > window.innerWidth ? 'horizontal' : 'vertical';
      const entry = {
        broken: describe(node),
        axis,
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        },
        viewport: { w: window.innerWidth, h: window.innerHeight },
        clippedBy: clippingAncestor(node),
      };
      if (axis === 'horizontal') offCanvas.push(entry);
      else unreachable.push(entry);
      continue;
    }
    const hit = document.elementFromPoint(centre.x, centre.y);
    const owner = hit && hit.closest ? hit.closest(INTERACTIVE) : null;
    if (owner !== node && !node.contains(hit)) {
      const covering = owner ? describe(owner) : hit ? describe(hit) : 'nothing';
      // Behind an open scrim the whole page reads as covered; that is one modal
      // state, not hundreds of overlaps, so it is reported once and skipped.
      if (scrim && covering.startsWith('div') && /fixed/.test(covering)) continue;
      covered.push({
        broken: describe(node),
        covering,
        centre: { x: Math.round(centre.x), y: Math.round(centre.y) },
        rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
        clippedBy: clippingAncestor(node),
      });
      continue;
    }
    const clip = clippingAncestor(node);
    if (clip) {
      clipped.push({
        broken: describe(node),
        rect: { w: Math.round(rect.width), h: Math.round(rect.height) },
        clippedBy: clip,
      });
    }
  }

  window.scrollTo(startScroll.x, startScroll.y);

  return {
    route: location.pathname,
    interactive: nodes.length,
    horizontalOverflow: Math.max(
      0,
      document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth
    ),
    covered,
    unreachable,
    offCanvas,
    scrim,
    clipped,
    focusRevealed,
    offscreenByDesign,
  };
};

/** Every `role="tab"` control, so a panel only rendered when its tab is active is scanned too. */
const listTabs = () => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  return tabs
    .filter((tab) => !tab.disabled && tab.getAttribute('aria-disabled') !== 'true')
    .map((tab) => (tab.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 24));
};

/**
 * Closes a full-viewport fixed layer (drawer/modal scrim) by clicking it, the same
 * gesture its handler expects. Without this, one stray scrim makes every element
 * behind it read as "covered" and the sweep reports hundreds of false overlaps.
 */
const closeOverlays = () => {
  for (const node of document.querySelectorAll('button, [role="presentation"], div')) {
    const style = getComputedStyle(node);
    if (style.position !== 'fixed' || style.display === 'none') continue;
    const rect = node.getBoundingClientRect();
    if (rect.width < window.innerWidth * 0.9 || rect.height < window.innerHeight * 0.9) continue;
    node.click?.();
    return true;
  }
  return false;
};

const clickTab = (label) => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const tab = tabs.find(
    (candidate) => (candidate.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 24) === label
  );
  if (!tab) return false;
  tab.click();
  return true;
};

const shot = async (page, viewport, route, stage) => {
  mkdirSync(shotsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeRoute = route.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'root';
  const file = path.join(
    shotsDir,
    `${shotsLabel}-${ts}-${viewport.label}-${safeRoute}-${stage}.png`
  );
  await page.screenshot({ path: file });
  console.log(`[hit-targets]   shot → ${path.relative(ROOT, file)}`);
}; /**
 * Demo sign-in plus the onboarding wizard, through the real UI.
 *
 * It picks a *discipline* and never a language tile: the language grid is prefilled
 * with the current interface language, so clicking its first entry would silently
 * switch the whole app to Arabic and make every later measurement read the wrong
 * layout. The discipline grid is the first one and holds ten choices, so "ten or
 * fewer choices" is the only state in which this may click at all.
 */
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
    // 10 choices = the staged discipline grid, 25 = the two-pane layout; 15 is the
    // staged language grid, which is prefilled and must not be clicked.
    const canPickDiscipline = total <= 10 || total >= 25;
    const picked = await choices.first().getAttribute('aria-pressed');
    if (canPickDiscipline && picked !== 'true') {
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
  const language = await page.evaluate(() => {
    try {
      return globalThis.localStorage.getItem('eos_EngVox_interface_language') ?? '(unset)';
    } catch {
      return '(storage unavailable)';
    }
  });
  console.log(`[hit-targets]   onboarding complete, interface language = ${language}`);
  await page.waitForTimeout(600);
};

/** Drops transient overlays (menus, drawer scrims) so a scan sees the resting page. */
const settle = async (page) => {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);
  const closed = await page.evaluate(closeOverlays).catch(() => false);
  if (closed) await page.waitForTimeout(350);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);
};

const scanRoute = async (page, viewport, route) => {
  const findings = [];
  const push = (stage, report) => {
    const total = report.covered.length + report.unreachable.length + report.clipped.length;
    if (total === 0 && report.horizontalOverflow === 0) return;
    findings.push({ stage, report });
  };

  await page.goto(new URL(route, base).href, { waitUntil: 'networkidle', timeout: 45_000 });
  await page.waitForTimeout(800);
  await settle(page);
  push('page', await page.evaluate(scanInteractive));
  if (shotsLabel) await shot(page, viewport, route, 'page');

  const tabs = await page.evaluate(listTabs);
  for (const label of [...new Set(tabs)]) {
    const clicked = await page.evaluate(clickTab, label);
    if (!clicked) continue;
    await page.waitForTimeout(700);
    await settle(page);
    push(`tab:${label}`, await page.evaluate(scanInteractive));
    if (shotsLabel) await shot(page, viewport, route, `tab-${label}`);
  }
  return findings;
};

const run = async () => {
  const viewports = parseViewports(viewportSpec);
  if (viewports.length !== viewportSpec.split(',').filter(Boolean).length) {
    console.error(`[hit-targets] could not parse viewports "${viewportSpec}" (use WxH,WxH)`);
    return 1;
  }
  if (routes.length === 0) {
    console.error('[hit-targets] no routes to scan');
    return 1;
  }
  if (!(await isUp())) {
    console.error(
      `[hit-targets] no dev server answering on ${base.origin} — start it first (see .freebuff/run.md)`
    );
    return 1;
  }

  const browser = await pw.chromium.launch();
  const printed = new Set();
  let covered = 0;
  let unreachable = 0;
  let clipped = 0;
  let scanned = 0;
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme,
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
        for (const route of routes) {
          scanned += 1;
          const findings = await scanRoute(page, viewport, route);
          const routeCovered = findings.reduce((sum, f) => sum + f.report.covered.length, 0);
          const routeUnreachable = findings.reduce(
            (sum, f) => sum + f.report.unreachable.length,
            0
          );
          const routeClipped = findings.reduce((sum, f) => sum + f.report.clipped.length, 0);
          covered += routeCovered;
          unreachable += routeUnreachable;
          clipped += routeClipped;
          const overflowMax = Math.max(0, ...findings.map((f) => f.report.horizontalOverflow));
          const focusRevealed = findings.reduce(
            (sum, finding) => sum + finding.report.focusRevealed.length,
            0
          );
          const offscreen = findings.reduce(
            (sum, finding) => sum + finding.report.offscreenByDesign.length,
            0
          );
          const offCanvas = findings.reduce(
            (sum, finding) => sum + finding.report.offCanvas.length,
            0
          );
          console.log(
            `[hit-targets] ${viewport.label} ${route}: ` +
              `${routeCovered} covered, ${routeUnreachable} unreachable, ` +
              `${routeClipped} clipped, ${focusRevealed} focus-revealed, ` +
              `${offscreen} off-canvas-by-design, ${offCanvas} in closed drawers, ` +
              `${overflowMax}px horizontal overflow` +
              (findings.length > 1 ? ` (${findings.length} stages)` : '')
          );
          for (const finding of findings) {
            // Dedupe by kind + element signature: the same covered button on every
            // tab panel is one finding, not five.
            for (const item of finding.report.covered.slice(0, 4)) {
              const signature = `COVERED|${item.broken}|${item.covering}`;
              if (printed.has(signature)) continue;
              printed.add(signature);
              console.error(
                `[hit-targets]   COVERED [${finding.stage}] ${item.broken} → ` +
                  `${item.covering} @${item.centre.x},${item.centre.y}` +
                  (item.clippedBy ? ` (clipped by ${item.clippedBy.selector})` : '')
              );
            }
            if (finding.report.scrim && !printed.has(`SCRIM|${finding.stage}`)) {
              printed.add(`SCRIM|${finding.stage}`);
              console.error(
                `[hit-targets]   NOTE [${finding.stage}] a fixed full-viewport layer is open ` +
                  `(${finding.report.scrim}); elements behind it are not counted as covered`
              );
            }
            for (const item of finding.report.unreachable.slice(0, 4)) {
              const signature = `UNREACHABLE|${item.broken}`;
              if (printed.has(signature)) continue;
              printed.add(signature);
              console.error(
                `[hit-targets]   UNREACHABLE [${finding.stage}] ${item.broken} ` +
                  `y=${item.rect.y} h=${item.rect.h} viewport=${item.viewport.w}x${item.viewport.h}` +
                  (item.clippedBy ? ` (clipped by ${item.clippedBy.selector})` : '')
              );
            }
            for (const item of finding.report.clipped.slice(0, 4)) {
              const signature = `CLIPPED|${item.broken}|${item.clippedBy.selector}`;
              if (printed.has(signature)) continue;
              printed.add(signature);
              console.error(
                `[hit-targets]   CLIPPED [${finding.stage}] ${item.broken} ` +
                  `by ${item.clippedBy.selector} [${item.clippedBy.overflow}]`
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `[hit-targets] ${viewport.label}: FAILED — ${String(error.message).split('\n')[0]}`
        );
        return 1;
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(
    `[hit-targets] scanned ${scanned} route/viewport pairs — ` +
      `${covered} covered, ${unreachable} unreachable, ${clipped} clipped`
  );
  if (covered > 0 || unreachable > 0) {
    console.error('[hit-targets] FAIL — covered or unreachable interactive elements found');
    return 1;
  }
  console.log('[hit-targets] OK — no covered or unreachable interactive elements');
  return 0;
};

process.exit(await run());
