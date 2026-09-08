#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const dist = path.join(root, 'dist');
const indexHtml = await readFile(path.join(dist, 'index.html'), 'utf8');
const assetReferences = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)].map(
  (match) => match[1]
);
const uniqueAssets = [...new Set(assetReferences)].map((urlPath) =>
  path.join(dist, urlPath.replace(/^\.?\//, ''))
);
const totals = { js: 0, css: 0 };
for (const file of uniqueAssets) {
  const bytes = await readFile(file);
  const kind = file.endsWith('.css') ? 'css' : 'js';
  totals[kind] += gzipSync(bytes, { level: 9 }).byteLength;
}

async function findSourceMaps(directory) {
  const maps = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) maps.push(...(await findSourceMaps(fullPath)));
    else if (entry.name.endsWith('.map')) maps.push(fullPath);
  }
  return maps;
}

await stat(dist);
const publicMaps = await findSourceMaps(dist);
const limits = {
  js: Number(process.env.INITIAL_JS_GZIP_LIMIT_BYTES || 614_400),
  css: Number(process.env.INITIAL_CSS_GZIP_LIMIT_BYTES || 122_880),
};
console.log(`Initial route gzip: JS=${totals.js}B/${limits.js}B CSS=${totals.css}B/${limits.css}B`);
if (publicMaps.length > 0) {
  console.error(`Public source maps found: ${publicMaps.join(', ')}`);
  process.exitCode = 1;
}
if (totals.js > limits.js || totals.css > limits.css) process.exitCode = 1;
if (!process.exitCode) console.log('INITIAL_ROUTE_BUDGET_OK');
