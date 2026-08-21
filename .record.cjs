const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: 'C:/Users/User/AppData/Local/Temp/opencode/video', size: { width: 1440, height: 900 } },
  });
  page.on('pageerror', (e) => console.log('PAGEERROR: ' + String(e).slice(0, 200)));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Mid-flight pixel proof: read the badge atom canvas while atoms are flying.
  const midflight = await page.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 700));
    const canvases = [...document.querySelectorAll('canvas')].filter(
      (c) => c.style.pointerEvents === 'none' && c.style.position === 'absolute',
    );
    const stats = [];
    for (const c of canvases.filter((x) => x.width > 200)) {
      const ctx = c.getContext('2d');
      if (!ctx) continue;
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let lit = 0;
      const total = d.length / 4;
      for (let i = 3; i < d.length; i += 16) {
        if (d[i] > 40) lit++;
      }
      stats.push({ w: c.width, litRatio: (lit / (total / 4)).toFixed(3) });
    }
    return {
      atomCanvasCount: canvases.length,
      canvasStats: stats.slice(0, 4),
      badgeText: document.querySelector('[data-hero="badge"]')?.textContent?.replace(/\s+/g, ' ').trim(),
    };
  });
  console.log('MIDFLIGHT ATOM CANVASES:');
  console.log(JSON.stringify(midflight, null, 2));

  // Let titles finish assembling (~2.5s), then scroll to disciplines & features so
  // the atom texts recreate as the user scrolls, then scroll back up to replay.
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, 2200);
  await page.waitForTimeout(2200);
  await page.mouse.wheel(0, -4000);
  await page.waitForTimeout(3500);

  // Final state: titles should be visible (opacity 1).
  const final = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('h1 span')];
    return spans.map((s) => ({ t: s.textContent.slice(0, 18), o: getComputedStyle(s).opacity }));
  });
  console.log('FINAL H1 SPAN OPACITIES:');
  console.log(JSON.stringify(final, null, 2));

  await page.waitForTimeout(800);
  await browser.close();
  console.log('DONE');
})();