import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3017';
const output = '.freebuff/shots/audit-fixed';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const width of [360, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(base).origin) return route.abort();
      if (url.pathname.startsWith('/_vercel/'))
        return route.fulfill({ contentType: 'application/javascript', body: '' });
      return route.continue();
    });
    await page.addInitScript(() => {
      localStorage.setItem('engvox_cookie_consent', 'rejected');
      localStorage.setItem('engvox-theme-mode', 'dark');
    });
    await page.goto(base + '/pricing');
    await page.locator('article').first().waitFor();
    await page.waitForTimeout(700);
    const boxes = await page.locator('article').evaluateAll((cards) =>
      cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
      })
    );
    assert.equal(boxes.length, 5);
    for (let i = 0; i < boxes.length; i++) {
      assert.ok(boxes[i].x >= 0 && boxes[i].right <= width + 1, 'Card outside viewport');
      for (let j = i + 1; j < boxes.length; j++)
        assert.ok(
          boxes[i].right <= boxes[j].x ||
            boxes[j].right <= boxes[i].x ||
            boxes[i].bottom <= boxes[j].y ||
            boxes[j].bottom <= boxes[i].y,
          'Cards overlap'
        );
    }
    await page.screenshot({ path: output + '/pricing-' + width + '.png', fullPage: true });
    await page.getByRole('button', { name: /Yıllık|Annual/ }).click();
    await page.screenshot({ path: output + '/annual-' + width + '.png', fullPage: true });
    await page.goto(base + '/sign-in');
    const email = page.locator('input[type=email]');
    await email.waitFor();
    await email.fill('review@example.com');
    const emailBox = await email.boundingBox();
    assert.ok(emailBox.y < 900, 'Email input not in the first viewport');
    await page.screenshot({ path: output + '/signin-' + width + '.png', fullPage: true });
    await page.getByRole('button', { name: /Kayıt olmadan demo|demo/i }).click();
    await page.waitForTimeout(700);
    await page.goto(base + '/billing');
    await page.getByText('Billing & Subscriptions', { exact: true }).waitFor();
    const panelBounds = await page.getByTestId('billing-status-panel').boundingBox();
    assert.ok(
      panelBounds.x >= 0 && panelBounds.x + panelBounds.width <= width,
      'Billing panel exceeds viewport'
    );
    await page.screenshot({ path: output + '/billing-' + width + '.png', fullPage: true });
    await page.goto(base + '/billing/return?billing=success');
    const appLink = page.getByRole('link', { name: 'Open EngVox app' });
    await appLink.waitFor();
    assert.equal(await appLink.getAttribute('href'), 'com.engvox.app://billing?billing=success');
    await page.screenshot({ path: output + '/return-' + width + '.png', fullPage: true });
    console.log(
      'PASS: pricing bounds, annual view, sign-in, billing and return link at ' + width + 'px'
    );
    await page.close();
  }
} finally {
  await browser.close();
}
