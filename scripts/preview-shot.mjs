#!/usr/bin/env node
/**
 * preview-shot.mjs — before/after screenshot helper for the visual
 * verification loop (see AGENTS.md → "After every page/UI change").
 *
 * Ensures the dev server is running (starting it detached per
 * .freebuff/run.md if needed), opens the given URL at mobile + desktop
 * viewports, and saves PNGs to .freebuff/shots/.
 *
 * Usage:
 *   node scripts/preview-shot.mjs [url] [label] [light|dark]
 *
 * Examples:
 *   node scripts/preview-shot.mjs http://localhost:3000/ onboard-before
 *   node scripts/preview-shot.mjs http://localhost:3000/onboard onboard-after dark
 *
 * Run it once BEFORE making a page change and once AFTER — the output
 * paths are the before/after pair to show the user. The optional third
 * argument pins the app's stored theme mode (auto follows the OS
 * `prefers-color-scheme`), so a capture is deterministic on any host. The
 * resolved `data-theme` is printed so a capture can be proven to be the palette
 * you meant; capture both themes when a change touches theming.
 *
 * Note: `playwright-cli screenshot` produces frozen frames in this
 * environment (every capture is byte-identical), so the helper uses the
 * same Playwright engine (playwright / playwright-core) directly to
 * capture pixels. `playwright-cli` remains the manual navigation tool.
 */
import { execFileSync, spawn } from 'node:child_process';
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

const url = process.argv[2] ?? 'http://localhost:3000/';
const label = (process.argv[3] ?? 'page').replace(/[^a-zA-Z0-9._-]+/g, '-') || 'page';
const themeMode = process.argv[4] === 'dark' ? 'dark' : 'light';
const THEME_STORAGE_KEY = 'engvox-theme-mode';
const port = new URL(url).port || 3000;
const shotsDir = path.join(ROOT, '.freebuff', 'shots');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function isUp() {
  try {
    const res = await fetch(`http://localhost:${port}/`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

function startServer() {
  const log = path.join(ROOT, '.freebuff', 'preview-shot-server.log');
  const errLog = log + '.err';
  mkdirSync(path.dirname(log), { recursive: true });
  console.log(
    `[preview-shot] dev server not answering on :${port} — starting \`npm run dev\` detached…`
  );

  if (process.platform === 'win32') {
    // .freebuff/run.md recipe: PowerShell Start-Process, stdout+stderr to DIFFERENT files.
    const cmd =
      `(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' ` +
      `-RedirectStandardOutput '${log}' -RedirectStandardError '${errLog}' ` +
      `-WindowStyle Hidden -PassThru).Id`;
    try {
      const pid = execFileSync('powershell', ['-NoProfile', '-Command', cmd], {
        encoding: 'utf8',
        timeout: 15000,
      }).trim();
      console.log(`[preview-shot] started (pid ${pid}); log: ${log}`);
    } catch (e) {
      // The wrapper can time out even when the child started fine — keep polling.
      console.warn(
        `[preview-shot] start command returned late (${e.message.split('\n')[0]}); will poll the port`
      );
    }
  } else {
    const child = spawn('npm', ['run', 'dev'], { cwd: ROOT, detached: true, stdio: 'ignore' });
    child.unref();
    console.log(`[preview-shot] started detached (pid ${child.pid})`);
  }
}

async function ensureServer() {
  if (await isUp()) {
    console.log(`[preview-shot] dev server already up on :${port}`);
    return;
  }
  startServer();
  for (let i = 1; i <= 60; i++) {
    await sleep(1000);
    if (await isUp()) {
      console.log(`[preview-shot] dev server ready after ${i}s`);
      return;
    }
  }
  console.error(`[preview-shot] dev server did not answer on :${port} within 60s`);
  process.exit(1);
}

async function capture() {
  await ensureServer();
  mkdirSync(shotsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const browser = await pw.chromium.launch();
  const saved = [];
  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: themeMode,
      });
      // Pin the stored mode (auto follows the OS preference) so the capture is
      // deterministic regardless of the host's prefers-color-scheme setting.
      await page.addInitScript(
        ([key, mode]) => {
          try {
            localStorage.setItem(key, mode);
          } catch {
            /* storage unavailable — fall through and let the app decide */
          }
        },
        [THEME_STORAGE_KEY, themeMode]
      );
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      const theme = await page.evaluate(
        () => globalThis.document.documentElement.dataset.theme ?? '(unset)'
      );
      const file = path.join(shotsDir, `${label}-${ts}-${vp.name}.png`);
      await page.screenshot({ path: file });
      saved.push(file);
      console.log(`[preview-shot] ${vp.name}: mode=${themeMode} → data-theme=${theme}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`[preview-shot] saved ${saved.length} screenshot(s):`);
  for (const f of saved) console.log('  ' + f);
}

capture().catch((e) => {
  console.error('[preview-shot] FAIL', e.message);
  process.exit(1);
});
