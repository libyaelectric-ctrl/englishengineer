import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  attachErrorCollectors,
  findOverflow,
  renderMarkdown,
  scanAccessibility,
  scanDeadControls,
  scanEmptyState,
  type QaFinding,
  type QaPageReport,
} from './qa-helpers';

const REPORT_DIR = resolve('qa-report');
const SHOTS_DIR = resolve(REPORT_DIR, 'shots');

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/business',
  '/login',
  '/signup',
  '/welcome',
  '/onboarding',
  '/onboarding/branch',
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
    findings.push({ severity: 'warning', category: 'accessibility', message: issue, url: page.url() });
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
      const demoBtn = page.getByRole('button', { name: /launch instant demo|try demo|demo/i }).first();
      if (await demoBtn.isVisible()) {
        await demoBtn.click();
      }
      await page.waitForURL(/\/dashboard|\/welcome|\/curriculum/, { timeout: 20000 }).catch(() => {});
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

    // C1. Onboarding akışı: meslek seç → dil adımı → ileri butonu aktif.
    await test.step('Onboarding akışı', async () => {
      await page.goto('/onboarding/branch', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      const continueBtn = page.getByRole('button', { name: /continue|devam/i }).first();
      const isDisabled = await continueBtn.isDisabled().catch(() => true);
      if (isDisabled) {
        // Kullanıcı önce bir dal seçmek zorunda.
        const branch = page.locator('button').filter({ hasText: /civil|mechanical|electrical/i }).first();
        if (await branch.isVisible()) {
          await branch.click();
          await page.waitForTimeout(400);
        }
        const after = await continueBtn.isDisabled().catch(() => true);
        if (after) {
          reports.push({
            route: '/onboarding/branch',
            title: 'Onboarding',
            findings: [
              {
                severity: 'bug',
                category: 'form',
                message: 'Dal seçildikten sonra bile Continue butonu hâlâ disabled.',
                url: page.url(),
              },
            ],
            checkedAt: new Date().toISOString(),
          });
        }
      }
    });

    // C2. Vocabulary arama: inputa yazıp sonuç görmek.
    await test.step('Vocabulary arama', async () => {
      await page.goto('/vocabulary', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const search = page.locator('input[type="search"], input[placeholder*="earch"], input[placeholder*="ara"]').first();
      if (await search.isVisible().catch(() => false)) {
        await search.fill('pump');
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
              severity: 'improvement',
              category: 'form',
              message: 'Sayfada arama inputu bulunamadı.',
              url: page.url(),
            },
          ],
          checkedAt: new Date().toISOString(),
        });
      }
    });

    // C3. Login form validation: boş submit denemesi.
    await test.step('Login form validation', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const submitBtn = page.getByRole('button', { name: /sign in|log in|giriş/i }).first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        const hasValidation = await page.evaluate(() => {
          const invalid = document.querySelectorAll('[aria-invalid="true"]');
          const errText = (document.body.innerText || '').match(/required|geçerli|zorunlu|invalid|hatal/i);
          return invalid.length > 0 || Boolean(errText);
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
