import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [router, serviceWorker, vercel, vite] = await Promise.all([
  read('src/routes/router.tsx'),
  read('public/sw.js'),
  read('vercel.json'),
  read('vite.config.ts'),
]);

assert.match(router, /createBrowserRouter/);
assert.doesNotMatch(router, /createHashRouter/);
assert.match(vercel, /"rewrites"/);
assert.match(vercel, /"destination": "\/index\.html"/);

assert.match(serviceWorker, /request\.mode === 'navigate'/);
assert.match(serviceWorker, /fetch\(request\)\.catch/);
assert.match(serviceWorker, /caches\.match\(OFFLINE_URL\)/);
assert.match(serviceWorker, /PRIVATE_PATH_PREFIXES/);
for (const path of ['/api/', '/login', '/sign-in', '/auth']) {
  assert.ok(serviceWorker.includes(`'${path}'`), `missing private cache exclusion: ${path}`);
}
assert.match(serviceWorker, /isCacheableStaticAsset/);
assert.doesNotMatch(serviceWorker, /return cached \|\| fetchPromise/);

assert.match(vite, /sourcemap: 'hidden'/);
console.log('PHASE7_PLATFORM_CONTRACT_OK');
