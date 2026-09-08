import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [router, serviceWorker, vercel, vite, main, deepLinks, manifest, browserTest] =
  await Promise.all([
    read('src/routes/router.tsx'),
    read('public/sw.js'),
    read('vercel.json'),
    read('vite.config.ts'),
    read('src/main.tsx'),
    read('src/bootstrap/capacitor-deep-links.ts'),
    read('android/app/src/main/AndroidManifest.xml'),
    read('tests/browser/history-routing.spec.ts'),
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
assert.match(main, /registerCapacitorDeepLinks/);
assert.match(deepLinks, /appUrlOpen/);
assert.match(deepLinks, /getLaunchUrl/);
assert.match(deepLinks, /WEB_DEEP_LINK_HOSTS/);
assert.match(manifest, /android:autoVerify="true"/);
assert.match(manifest, /android:host="engvox\.com"/);
assert.match(manifest, /android:scheme="com\.engvox\.app"/);
assert.match(browserTest, /page\.reload\(\)/);
assert.match(browserTest, /callback&oobCode/);
assert.match(vite, /sourcemap: 'hidden'/);
assert.match(vite, /privateSourceMapsPlugin/);
assert.match(vite, /\.artifacts\/sourcemaps/);
console.log('PHASE7_PLATFORM_CONTRACT_OK');
