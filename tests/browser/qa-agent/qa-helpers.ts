import type { Page } from '@playwright/test';

export interface QaFinding {
  severity: 'bug' | 'warning' | 'improvement';
  category:
    | 'console'
    | 'network'
    | 'navigation'
    | 'dead-button'
    | 'form'
    | 'empty-state'
    | 'responsive'
    | 'accessibility'
    | 'runtime';
  message: string;
  detail?: string;
  url?: string;
}

export interface QaPageReport {
  route: string;
  title: string;
  findings: QaFinding[];
  screenshotPath?: string;
  checkedAt: string;
}

export interface QaCollector {
  findings: QaFinding[];
  detach: () => void;
}

/** Attaches one console/network/runtime collector to a page.
 *  Call once per page navigation; the returned findings fill over time. */
export function attachErrorCollectors(page: Page): QaCollector {
  const findings: QaFinding[] = [];
  const currentUrl = () => page.url();

  const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Known dev-environment noise: missing backend/API env vars produce
      // console.error banners on every page. Not actionable bugs.
      if (/VITE_AI_PROVIDER|VITE_BILLING_API_URL|requires VITE_|Missing .* env/i.test(text)) return;
      findings.push({
        severity: 'bug',
        category: 'console',
        message: text,
        url: currentUrl(),
      });
    }
  };
  const onPageError = (err: Error) => {
    findings.push({
      severity: 'bug',
      category: 'runtime',
      message: err.message,
      url: currentUrl(),
    });
  };
  const onRequestFailed = (req: import('@playwright/test').Request) => {
    const url = req.url();
    if (/supabase|railway|googleapis|sentry|analytics|gstatic|fonts/.test(url)) return;
    findings.push({
      severity: 'warning',
      category: 'network',
      message: `Request failed: ${url}`,
      detail: req.failure()?.errorText,
      url: currentUrl(),
    });
  };
  const onResponse = (res: import('@playwright/test').Response) => {
    if (res.status() >= 400) {
      const url = res.url();
      if (/supabase|railway|googleapis|sentry|analytics|gstatic|fonts/.test(url)) return;
      findings.push({
        severity: res.status() >= 500 ? 'bug' : 'warning',
        category: 'network',
        message: `HTTP ${res.status()} ${res.request().method()} ${url}`,
        url: currentUrl(),
      });
    }
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);
  page.on('response', onResponse);

  return {
    findings,
    detach: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
      page.off('response', onResponse);
    },
  };
}

/** Finds horizontal overflow at the current viewport. */
export async function findOverflow(page: Page): Promise<string[]> {
  const offenders = await page.evaluate(() => {
    const vw = window.innerWidth;
    const doc = document.documentElement;
    const max = Math.max(doc.scrollWidth, document.body ? document.body.scrollWidth : 0);
    if (max <= vw + 1) return [];
    const out: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        out.push(
          `${el.tagName}${el.id ? '#' + el.id : ''}.${(typeof el.className === 'string' ? el.className : '').split(' ').slice(0, 2).join('.')} → right:${Math.round(r.right)}`
        );
      }
    });
    return out.slice(0, 6);
  });
  return offenders;
}

/** Basic accessibility scan: unlabeled buttons and images without alt. */
export async function scanAccessibility(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const issues: string[] = [];
    document.querySelectorAll('button').forEach((b) => {
      const hasLabel =
        b.getAttribute('aria-label') ||
        b.getAttribute('title') ||
        (b.textContent || '').trim().length > 0;
      if (!hasLabel) issues.push(`Unlabeled button: <${b.outerHTML.slice(0, 80)}>`);
    });
    document.querySelectorAll('img').forEach((img) => {
      const alt = img.getAttribute('alt');
      if (alt === null) issues.push(`Image without alt: ${img.getAttribute('src')?.slice(0, 60)}`);
    });
    return issues.slice(0, 8);
  });
}

/** Detects links with dead hrefs (href="#", href=""). */
export async function scanDeadControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const dead: string[] = [];
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '' || href === 'javascript:void(0)') {
        dead.push(`Dead link href="${href}" label="${(a.textContent || '').trim().slice(0, 40)}"`);
      }
    });
    return dead.slice(0, 8);
  });
}

/** Sniffs empty/loading states: page with virtually no visible content. */
export async function scanEmptyState(page: Page): Promise<string[]> {
  const hasContent = await page.evaluate(() => {
    const headings = document.querySelectorAll('h1,h2,h3').length;
    const buttons = document.querySelectorAll('button').length;
    const links = document.querySelectorAll('a').length;
    const textLen = (document.body ? document.body.innerText : '').trim().length;
    return { headings, buttons, links, textLen };
  });
  const issues: string[] = [];
  if (hasContent.textLen < 20 && hasContent.headings === 0) {
    issues.push(
      `Sayfa boş görünüyor (metin:${hasContent.textLen}, başlık:${hasContent.headings}, buton:${hasContent.buttons}, link:${hasContent.links})`
    );
  }
  return issues;
}

/** Builds a compact markdown report section for one page. */
export function renderMarkdown(report: QaPageReport): string {
  const lines: string[] = [];
  lines.push(`## ${report.title || report.route}`);
  lines.push('');
  lines.push(`- **Route:** \`${report.route}\``);
  lines.push(`- **Kontrol zamanı:** ${report.checkedAt}`);
  lines.push(`- **Bulgu sayısı:** ${report.findings.length}`);
  if (report.screenshotPath) lines.push(`- **Ekran görüntüsü:** \`${report.screenshotPath}\``);
  lines.push('');

  if (report.findings.length === 0) {
    lines.push('✅ Sorun bulunamadı.');
    lines.push('');
    return lines.join('\n');
  }

  const groups: Record<string, QaFinding[]> = {};
  for (const f of report.findings) {
    (groups[f.category] ??= []).push(f);
  }

  for (const [category, items] of Object.entries(groups)) {
    const icon = items.some((i) => i.severity === 'bug')
      ? '❌'
      : items.some((i) => i.severity === 'warning')
        ? '⚠️'
        : '💡';
    lines.push(`### ${icon} ${category} (${items.length})`);
    lines.push('');
    for (const item of items.slice(0, 10)) {
      lines.push(`- [${item.severity}] ${item.message}`);
      if (item.detail) lines.push(`  - ${item.detail.slice(0, 200)}`);
    }
    if (items.length > 10) lines.push(`- …ve ${items.length - 10} tane daha`);
    lines.push('');
  }
  return lines.join('\n');
}
