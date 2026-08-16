import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  type QaFinding,
  type QaPageReport,
  attachErrorCollectors,
  findOverflow,
  renderMarkdown,
  scanAccessibility,
  scanDeadControls,
  scanEmptyState,
} from './qa-helpers';

const REPORT_DIR = resolve('qa-report');
const SHOTS_DIR = resolve(REPORT_DIR, 'shots');

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/business',
  '/login',
  '/signup',
  '/legal/privacy',
  '/offline',
  '/404-route',
];

const AUTHED_ROUTES = [
  '/dashboard',
  '/vocabulary',
  '/grammar',
  '/reading',
  '/writing',
  '/listening',
  '/speaking',
  '/ai',
  '/analytics',
  '/progress',
  '/curriculum',
  '/translator',
  '/placement',
  '/tools',
  '/gamification',
  '/profile',
  '/billing',
];

const reports: QaPageReport[] = [];

function safeName(route: string): string {
  return route.replace(/[^\w-]/g, '_') || 'root';
}

async function auditPage(
  page: import('@playwright/test').Page,
  route: string,
  screenshot: boolean
): Promise<QaPageReport> {
  const title = await page.title().catch(() => '');
  const findings: QaFinding[] = [];

  // Give async errors a moment to surface in the console.
  await page.waitForTimeout(800);

  const overflows = await findOverflow(page);
  if (overflows.length > 0) {
    findings.push({
      severity: 'bug',
      category: 'responsive',
      message: 'Yatay taşma tespit edildi',
      detail: overflows.join(' | '),
      url: page.url(),
    });
  }

  const a11y = await scanAccessibility(page);
  for (const issue of a11y) {
    findings.push({
      severity: 'warning',
      category: 'accessibility',
      message: issue,
      url: page.url(),
    });
  }

  const dead = await scanDeadControls(page);
  for (const d of dead) {
    findings.push({ severity: 'warning', category: 'dead-button', message: d, url: page.url() });
  }

  const empty = await scanEmptyState(page);
  for (const e of empty) {
    findings.push({ severity: 'warning', category: 'empty-state', message: e, url: page.url() });
  }

  const screenshotPath = screenshot ? resolve(SHOTS_DIR, `${safeName(route)}.png`) : undefined;
  if (screenshotPath) {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }

  const report: QaPageReport = {
    route,
    title,
    findings,
    screenshotPath: screenshotPath ? screenshotPath.replace(/\\/g, '/') : undefined,
    checkedAt: new Date().toISOString(),
  };
  reports.push(report);
  return report;
}

test.describe('QA Agent — insan gibi sayfa sayfa denetim', () => {
  test.setTimeout(300_000);

  test.beforeAll(() => {
    mkdirSync(SHOTS_DIR, { recursive: true });
  });

  test('A) Herkese açık sayfalar denetlenir', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await test.step(`Gezinme: ${route}`, async () => {
        const collector = attachErrorCollectors(page);
        const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(600);
        const report = await auditPage(page, route, true);
        report.findings.push(...collector.findings);
        if (response && response.status() === 404) {
          report.findings.push({
            severity: 'bug',
            category: 'navigation',
            message: 'Route returned HTTP 404',
            url: page.url(),
          });
        }
        collector.detach();
      });
    }
  });

  test('B) Demo kullanıcı ile giriş yapılıp ürün sayfaları denetlenir', async ({ page }) => {
    await test.step('Demo girişi', async () => {
      const collector = attachErrorCollectors(page);
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      const demoBtn = page
        .getByRole('button', { name: /launch instant demo|try demo|demo/i })
        .first();
      if (await demoBtn.isVisible()) {
        await demoBtn.click();
      }
      await page
        .waitForURL(/\/dashboard|\/welcome|\/curriculum/, { timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(1500);
      const current = new URL(page.url()).pathname;
      const report = await auditPage(page, current, true);
      report.findings.push(...collector.findings);
      collector.detach();
    });

    for (const route of AUTHED_ROUTES) {
      await test.step(`Giriş sonrası: ${route}`, async () => {
        const collector = attachErrorCollectors(page);
        const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(600);
        const report = await auditPage(page, route, true);
        report.findings.push(...collector.findings);
        if (response && response.status() === 404) {
          report.findings.push({
            severity: 'bug',
            category: 'navigation',
            message: 'Route returned HTTP 404',
            url: page.url(),
          });
        }
        collector.detach();
      });
    }
  });

  test('C) Kritik kullanıcı akışları işlevselliği', async ({ page }) => {
    const collector = attachErrorCollectors(page);

    // C1. Onboarding akışı: /welcome üzerinde meslek + dil tek ekranda seçilip bitirilir.
    await test.step('Onboarding akışı', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      const demoBtn = page
        .getByRole('button', { name: /launch instant demo|try demo|demo/i })
        .first();
      if (await demoBtn.isVisible().catch(() => false)) {
        await demoBtn.click();
      }
      await page
        .waitForURL(/\/dashboard|\/welcome|\/curriculum/, { timeout: 20000 })
        .catch(() => {});
      await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const disciplineBtn = page
        .locator('button')
        .filter({ hasText: /civil|mechanical|electrical/i })
        .first();
      if (await disciplineBtn.isVisible().catch(() => false)) {
        await disciplineBtn.click();
        await page.waitForTimeout(400);
      }

      const startBtn = page.getByRole('button', { name: /start|başla|devam|continue/i }).first();
      const startDisabled = await startBtn.isDisabled().catch(() => true);
      if (startDisabled) {
        reports.push({
          route: '/welcome',
          title: 'Onboarding',
          findings: [
            {
              severity: 'bug',
              category: 'form',
              message: 'Disiplin seçildikten sonra bile Başla butonu hâlâ disabled.',
              url: page.url(),
            },
          ],
          checkedAt: new Date().toISOString(),
        });
      } else {
        await startBtn.click();
        await page.waitForTimeout(800);
      }
    });

    // C2. Vocabulary arama: Search butonu -> modal -> inputa yazıp sonuç görmek.
    await test.step('Vocabulary arama', async () => {
      // Vocabulary ürün sayfası olduğu için önce demo girişi gerekir.
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      const demoBtn = page
        .getByRole('button', { name: /launch instant demo|try demo|demo/i })
        .first();
      if (await demoBtn.isVisible().catch(() => false)) {
        await demoBtn.click();
      }
      await page
        .waitForURL(/\/dashboard|\/welcome|\/curriculum/, { timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(800);
      await page.goto('/vocabulary', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);
      // Demo oturumu yeni context'te welcome'a düşer; bazen auth tam oturmadan
      // ürün sayfasına gidilince login'e döner. Login'e düştüysek tekrar dene.
      if (new URL(page.url()).pathname === '/login') {
        const demoBtn2 = page
          .getByRole('button', { name: /launch instant demo|try demo|demo/i })
          .first();
        if (await demoBtn2.isVisible().catch(() => false)) {
          await demoBtn2.click();
        }
        await page
          .waitForURL(/\/dashboard|\/welcome|\/curriculum/, { timeout: 20000 })
          .catch(() => {});
        await page.goto('/vocabulary', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1200);
      }
      // Arama bir modal üzerinden açılır: "Search vocabulary" butonu -> input.
      const searchBtn = page.getByTitle('Search vocabulary');
      let searchVisible = false;
      try {
        await searchBtn.waitFor({ state: 'visible', timeout: 5000 });
        searchVisible = true;
      } catch {
        searchVisible = false;
      }
      if (searchVisible) {
        await searchBtn.click();
        await page.waitForTimeout(600);
        const modalInput = page
          .locator(
            'input[type="search"], input[placeholder*="Type a word" i], input[placeholder*="earch" i], input[placeholder*="ara" i]'
          )
          .first();
        if (await modalInput.isVisible().catch(() => false)) {
          await modalInput.fill('pump');
          await page.waitForTimeout(800);
          const results = await page.evaluate(() => document.body.innerText.length);
          if (results < 30) {
            reports.push({
              route: '/vocabulary',
              title: 'Vocabulary arama',
              findings: [
                {
                  severity: 'warning',
                  category: 'form',
                  message: 'Arama sonrası sayfa içeriği çok az görünüyor, muhtemelen sonuç yok.',
                  url: page.url(),
                },
              ],
              checkedAt: new Date().toISOString(),
            });
          }
        } else {
          reports.push({
            route: '/vocabulary',
            title: 'Vocabulary arama',
            findings: [
              {
                severity: 'warning',
                category: 'form',
                message: 'Search butonu modal açtı ama içinde arama inputu bulunamadı.',
                url: page.url(),
              },
            ],
            checkedAt: new Date().toISOString(),
          });
        }
      } else {
        reports.push({
          route: '/vocabulary',
          title: 'Vocabulary arama',
          findings: [
            {
              severity: 'improvement',
              category: 'form',
              message: 'Sayfada "Search vocabulary" butonu bulunamadı.',
              url: page.url(),
            },
          ],
          checkedAt: new Date().toISOString(),
        });
      }
    });

    // C3. Login form validation: boş submit denemesi -> native veya React uyarı.
    await test.step('Login form validation', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const submitBtn = page.getByRole('button', { name: /sign in|log in|giriş/i }).first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(600);
        const hasValidation = await page.evaluate(() => {
          // Native HTML5 validation marka required/boş alanlar invalid olur.
          const invalidNative = document.querySelectorAll('input:invalid').length;
          const invalid = document.querySelectorAll('[aria-invalid="true"]');
          const errText = (document.body.innerText || '').match(
            /required|geçerli|zorunlu|invalid|hatal|fill in|eksik|alan/i
          );
          const alertBox = document.querySelector('[role="alert"]');
          return invalidNative > 0 || invalid.length > 0 || Boolean(errText) || Boolean(alertBox);
        });
        if (!hasValidation) {
          reports.push({
            route: '/login',
            title: 'Login form validation',
            findings: [
              {
                severity: 'improvement',
                category: 'form',
                message: 'Boş gönderimde görünür bir validation mesajı tespit edilemedi.',
                url: page.url(),
              },
            ],
            checkedAt: new Date().toISOString(),
          });
        }
      }
    });

    collector.detach();
  });

  test('D) Rapor üretimi', async () => {
    const md = [
      '# QA Ajan Raporu — İnsan Gibi Test',
      '',
      `- Üretim zamanı: ${new Date().toLocaleString('tr-TR')}`,
      `- Denetlenen sayfa sayısı: ${reports.length}`,
      '',
      '## Özet',
      '',
      '| Durum | Sayfa |',
      '| --- | --- |',
    ];

    for (const r of reports) {
      const worst = r.findings.some((f) => f.severity === 'bug')
        ? '❌ bug'
        : r.findings.length > 0
          ? '⚠️ uyarı'
          : '✅ temiz';
      md.push(`| ${worst} | \`${r.route}\` |`);
    }

    md.push('');
    md.push('---');
    md.push('');
    for (const r of reports) {
      md.push(renderMarkdown(r));
    }

    writeFileSync(resolve(REPORT_DIR, 'qa-report.md'), md.join('\n'), 'utf8');
    console.log(`\nRapor: ${resolve(REPORT_DIR, 'qa-report.md')}`);
    expect(reports.length).toBeGreaterThan(0);
  });
});
