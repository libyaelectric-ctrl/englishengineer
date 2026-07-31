#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * Analyzes the production build bundle and reports sizes.
 * Run: node scripts/analyze-bundle.mjs
 *
 * CI Usage: node scripts/analyze-bundle.mjs --ci
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const DIST_DIR = resolve(process.cwd(), 'dist/assets');
const DIST_ROOT = resolve(process.cwd(), 'dist');
const LIMITS = {
  // This budget applies to INITIAL-LOAD JS only (the entry script + the
  // modulepreload chunks actually listed in dist/index.html) -- not the
  // sum of every file in dist/assets/. This app uses React.lazy()
  // route-based code splitting (see src/routes/router.tsx), so most
  // per-page chunks are never downloaded together; summing them all
  // produces a number the browser never actually has to load and grows
  // unboundedly as content-heavy pages are added.
  js: 2000 * 1024, // 2MB, matches .github/workflows/ci.yml and deploy-production.yml
  css: 200 * 1024, // 200KB
};

function getInitialLoadFileNames() {
  const indexHtmlPath = join(DIST_ROOT, 'index.html');
  if (!exists(indexHtmlPath)) return null;
  const html = readFileSync(indexHtmlPath, 'utf-8');
  const matches = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)];
  return new Set(matches.map((m) => m[1]));
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function analyzeBundle() {
  console.log('📦 EngineerOS Bundle Analysis');
  console.log('==============================\n');

  if (!exists(DIST_DIR)) {
    console.error('❌ dist/assets not found. Run npm run build first.');
    process.exit(1);
  }

  const files = readdirSync(DIST_DIR);
  const stats = {
    js: { size: 0, files: [] },
    css: { size: 0, files: [] },
    other: { size: 0, files: [] },
  };

  for (const file of files) {
    const filePath = join(DIST_DIR, file);
    const fileStat = statSync(filePath);
    const size = fileStat.size;

    if (file.endsWith('.js')) {
      stats.js.size += size;
      stats.js.files.push({ name: file, size });
    } else if (file.endsWith('.css')) {
      stats.css.size += size;
      stats.css.files.push({ name: file, size });
    } else {
      stats.other.size += size;
      stats.other.files.push({ name: file, size });
    }
  }

  // Sort by size descending
  stats.js.files.sort((a, b) => b.size - a.size);
  stats.css.files.sort((a, b) => b.size - a.size);

  const initialLoadNames = getInitialLoadFileNames();
  const initialLoadJs = initialLoadNames
    ? stats.js.files.filter((f) => initialLoadNames.has(f.name))
    : stats.js.files;
  const initialLoadJsSize = initialLoadJs.reduce((sum, f) => sum + f.size, 0);

  // Report JS
  console.log('📄 JavaScript (🚀 initial load, 💤 lazy-loaded on demand):');
  for (const file of stats.js.files) {
    const kb = (file.size / 1024).toFixed(1);
    const isInitial = initialLoadNames ? initialLoadNames.has(file.name) : true;
    const marker = isInitial ? '🚀' : '💤';
    console.log(`  ${marker} ${file.name}: ${kb} KB`);
  }
  const jsTotal = (stats.js.size / 1024).toFixed(1);
  const initialLoadTotal = (initialLoadJsSize / 1024).toFixed(1);
  const jsStatus = initialLoadJsSize > LIMITS.js ? '❌ EXCEEDS' : '✅ OK';
  console.log(`  All chunks total: ${jsTotal} KB`);
  console.log(
    `  Initial-load total: ${initialLoadTotal} KB / ${LIMITS.js / 1024} KB ${jsStatus}\n`
  );

  // Report CSS
  console.log('🎨 CSS:');
  for (const file of stats.css.files) {
    const kb = (file.size / 1024).toFixed(1);
    console.log(`  ✅ ${file.name}: ${kb} KB`);
  }
  const cssTotal = (stats.css.size / 1024).toFixed(1);
  const cssStatus = stats.css.size > LIMITS.css ? '❌ EXCEEDS' : '✅ OK';
  console.log(`  Total: ${cssTotal} KB / ${LIMITS.css / 1024} KB ${cssStatus}\n`);

  // Report other
  if (stats.other.files.length > 0) {
    console.log('📎 Other:');
    for (const file of stats.other.files) {
      const kb = (file.size / 1024).toFixed(1);
      console.log(`  ℹ️  ${file.name}: ${kb} KB`);
    }
    console.log();
  }

  // Summary
  const total = stats.js.size + stats.css.size + stats.other.size;
  console.log('📊 Summary:');
  console.log(`  JS (initial load): ${initialLoadTotal} KB`);
  console.log(`  JS (all chunks):   ${jsTotal} KB`);
  console.log(`  CSS: ${cssTotal} KB`);
  console.log(`  Total on disk: ${(total / 1024).toFixed(1)} KB`);

  // CI mode
  if (process.argv.includes('--ci')) {
    const failed = initialLoadJsSize > LIMITS.js || stats.css.size > LIMITS.css;
    if (failed) {
      console.error('\n❌ Bundle size budget exceeded!');
      process.exit(1);
    }
    console.log('\n✅ Bundle size within budget.');
  }
}

analyzeBundle();
