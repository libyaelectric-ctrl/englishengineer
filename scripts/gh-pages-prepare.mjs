// Stages `dist/` for GitHub Pages: adds CNAME (custom domain), .nojekyll,
// and a 404.html that (a) acts as the classic SPA fallback and (b) replays
// the HTTP redirects that vercel.json performs on Vercel, because Pages has
// no redirect engine. Output goes to `page-site/`, which the workflow hands
// to actions/upload-pages-artifact.
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const site = join(root, 'page-site');

if (!existsSync(join(dist, 'index.html'))) {
  throw new Error('[gh-pages-prepare] run `npm run build` first: dist/index.html missing');
}

rmSync(site, { recursive: true, force: true });
cpSync(dist, site, { recursive: true });

const vercelJson = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
// Only the static, non-host-conditional redirects apply on Pages; the
// catch-all rewrite is exactly what 404.html + history routing reproduces.
const redirectMap = (vercelJson.redirects || [])
  .filter((r) => !r.has && !r.source.includes(':path*'))
  .map((r) => [r.source, r.destination]);

const indexHtml = readFileSync(join(site, 'index.html'), 'utf8');
const redirectScript = `
    <script>
      // Verbatim port of the vercel.json edge redirects (minus the
      // host-scoped eng-vox.vercel.app rule, which dies with the old host).
      (function () {
        var map = ${JSON.stringify(Object.fromEntries(redirectMap))};
        var path = location.pathname.replace(/\\/$$/, '') || '/';
        // /demo is a temporary redirect; everything else is permanent -
        // client-side both are an instant replace before the app boots.
        if (map[path]) location.replace(map[path] + location.search + location.hash);
      })();
    </script>
`;

const notFoundHtml = redirectScript
  ? indexHtml.replace('<head>', `<head>${redirectScript}`)
  : indexHtml;

writeFileSync(join(site, '404.html'), notFoundHtml);
writeFileSync(join(site, 'CNAME'), 'engvox.com');
writeFileSync(join(site, '.nojekyll'), '');

const fileCount = readdirSync(site, { recursive: true }).filter(
  (f) => typeof f === 'string' && f.includes('.')
).length;
console.log(
  `[gh-pages-prepare] page-site ready: ${fileCount} files, ${redirectMap.length} redirect rules replayed in 404.html`
);
