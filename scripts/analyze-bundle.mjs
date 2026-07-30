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
const LIMITS = {
  js: 1000 * 1024,   // 1MB
  css: 200 * 1024,   // 200KB
};

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

  // Report JS
  console.log('📄 JavaScript:');
  for (const file of stats.js.files) {
    const kb = (file.size / 1024).toFixed(1);
    const marker = file.size > LIMITS.js / 5 ? '⚠️' : '✅'; // Warn if >200KB
    console.log(`  ${marker} ${file.name}: ${kb} KB`);
  }
  const jsTotal = (stats.js.size / 1024).toFixed(1);
  const jsStatus = stats.js.size > LIMITS.js ? '❌ EXCEEDS' : '✅ OK';
  console.log(`  Total: ${jsTotal} KB / ${LIMITS.js / 1024} KB ${jsStatus}\n`);

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
  console.log(`  JS:  ${jsTotal} KB`);
  console.log(`  CSS: ${cssTotal} KB`);
  console.log(`  Total: ${(total / 1024).toFixed(1)} KB`);

  // CI mode
  if (process.argv.includes('--ci')) {
    const failed = stats.js.size > LIMITS.js || stats.css.size > LIMITS.css;
    if (failed) {
      console.error('\n❌ Bundle size budget exceeded!');
      process.exit(1);
    }
    console.log('\n✅ Bundle size within budget.');
  }
}

analyzeBundle();
