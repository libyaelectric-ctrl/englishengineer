#!/usr/bin/env node

/**
 * Bundle Size Check — CI script
 *
 * Checks the built bundle size against configured thresholds.
 * Fails the CI pipeline if any chunk exceeds its limit.
 *
 * Usage: node scripts/check-bundle-size.mjs [--json] [--verbose]
 *
 * Thresholds are configured in the BUNDLE_LIMITS object below.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const JSON_OUTPUT = args.includes('--json');
const VERBOSE = args.includes('--verbose');

const DIST_DIR = resolve(process.cwd(), 'dist');

// Bundle size limits (in KB)
const BUNDLE_LIMITS = {
  // Total JS bundle
  assets: {
    totalJs: 100000, // 100MB total JS (translation corpora + vocab seeds are large)
    totalCss: 500, // 500KB total CSS
    maxChunk: 10000, // 10MB per chunk (lazy data chunks)
    maxAsset: 1000, // 1MB per non-JS/CSS asset
  },
  // Specific chunk limits (app-only, excludes data chunks)
  chunks: {
    vendor: 2000, // Vendor chunks
    main: 500, // Main app chunk
    pages: 200, // Per-page chunks
  },
  // Chunks to exclude from size checks (data-heavy lazy chunks)
  excludedChunks: ['translation-corpus-', 'vocab-seed-'],
};

const WARN_THRESHOLD = 0.8; // 80% of limit = warning

/**
 * Get all files in a directory recursively.
 */
async function getFilesRecursive(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await getFilesRecursive(fullPath)));
      } else {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return files;
}

/**
 * Get file size in KB.
 */
async function getFileSizeKB(filePath) {
  try {
    const stats = await stat(filePath);
    return Math.round((stats.size / 1024) * 100) / 100;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human readable.
 */
function formatSize(kb) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(2)} MB`;
  return `${kb} KB`;
}

/**
 * Main bundle check function.
 */
async function checkBundleSize() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    passed: true,
    warnings: [],
  };

  // Check if dist directory exists
  try {
    await stat(DIST_DIR);
  } catch {
    if (JSON_OUTPUT) {
      console.log(JSON.stringify({ error: 'dist directory not found', passed: false }));
    } else {
      console.error('❌ dist/ directory not found. Run "npm run build" first.');
    }
    process.exit(1);
  }

  const allFiles = await getFilesRecursive(DIST_DIR);
  const jsFiles = allFiles.filter((f) => f.endsWith('.js') && !f.endsWith('.js.map'));
  const cssFiles = allFiles.filter((f) => f.endsWith('.css'));
  const assetFiles = allFiles.filter(
    (f) =>
      !f.endsWith('.js') &&
      !f.endsWith('.css') &&
      !f.endsWith('.js.map') &&
      !f.endsWith('.css.map') &&
      !f.endsWith('.mp3') &&
      !f.endsWith('.wav') &&
      !f.endsWith('.ogg') &&
      !f.endsWith('.woff') &&
      !f.endsWith('.woff2') &&
      !f.endsWith('.ttf') &&
      !f.endsWith('.eot')
  );

  // Check total JS size
  let totalJsKB = 0;
  for (const file of jsFiles) {
    totalJsKB += await getFileSizeKB(file);
  }

  const jsLimit = BUNDLE_LIMITS.assets.totalJs;
  const jsCheck = {
    name: 'Total JS Bundle',
    sizeKB: totalJsKB,
    limitKB: jsLimit,
    passed: totalJsKB <= jsLimit,
    percentage: Math.round((totalJsKB / jsLimit) * 100),
  };
  results.checks.push(jsCheck);

  if (totalJsKB > jsLimit) {
    results.passed = false;
    if (!JSON_OUTPUT) {
      console.error(
        `❌ Total JS bundle (${formatSize(totalJsKB)}) exceeds limit (${formatSize(jsLimit)})`
      );
    }
  } else if (totalJsKB > jsLimit * WARN_THRESHOLD) {
    results.warnings.push(`Total JS bundle at ${jsCheck.percentage}% of limit`);
    if (!JSON_OUTPUT && VERBOSE) {
      console.warn(
        `⚠️  Total JS bundle (${formatSize(totalJsKB)}) approaching limit (${formatSize(jsLimit)})`
      );
    }
  }

  // Check total CSS size
  let totalCssKB = 0;
  for (const file of cssFiles) {
    totalCssKB += await getFileSizeKB(file);
  }

  const cssLimit = BUNDLE_LIMITS.assets.totalCss;
  const cssCheck = {
    name: 'Total CSS Bundle',
    sizeKB: totalCssKB,
    limitKB: cssLimit,
    passed: totalCssKB <= cssLimit,
    percentage: Math.round((totalCssKB / cssLimit) * 100),
  };
  results.checks.push(cssCheck);

  if (totalCssKB > cssLimit) {
    results.passed = false;
    if (!JSON_OUTPUT) {
      console.error(
        `❌ Total CSS bundle (${formatSize(totalCssKB)}) exceeds limit (${formatSize(cssLimit)})`
      );
    }
  }

  // Check individual JS chunks
  const chunkLimit = BUNDLE_LIMITS.assets.maxChunk;
  const excludedChunks = BUNDLE_LIMITS.excludedChunks || [];
  for (const file of jsFiles) {
    // Skip excluded data-heavy chunks
    const basename = file.replace(DIST_DIR, '').replace(/\\/g, '/');
    if (excludedChunks.some((pattern) => basename.includes(pattern))) continue;

    const sizeKB = await getFileSizeKB(file);
    if (sizeKB > chunkLimit) {
      results.passed = false;
      const check = {
        name: `Chunk: ${basename}`,
        sizeKB,
        limitKB: chunkLimit,
        passed: false,
        percentage: Math.round((sizeKB / chunkLimit) * 100),
      };
      results.checks.push(check);

      if (!JSON_OUTPUT) {
        console.error(
          `❌ ${check.name} (${formatSize(sizeKB)}) exceeds limit (${formatSize(chunkLimit)})`
        );
      }
    }
  }

  // Check specific chunk categories
  for (const [category, limitKB] of Object.entries(BUNDLE_LIMITS.chunks)) {
    const matchingFiles = jsFiles.filter((f) => {
      const basename = f.replace(DIST_DIR, '').toLowerCase();
      return basename.includes(category);
    });

    let categoryTotal = 0;
    for (const file of matchingFiles) {
      categoryTotal += await getFileSizeKB(file);
    }

    if (categoryTotal > 0) {
      const check = {
        name: `Category: ${category}`,
        sizeKB: categoryTotal,
        limitKB,
        passed: categoryTotal <= limitKB,
        percentage: Math.round((categoryTotal / limitKB) * 100),
      };
      results.checks.push(check);

      if (!check.passed) {
        results.passed = false;
        if (!JSON_OUTPUT) {
          console.error(
            `❌ ${category} bundle (${formatSize(categoryTotal)}) exceeds limit (${formatSize(limitKB)})`
          );
        }
      }
    }
  }

  // Check large assets
  const assetLimit = BUNDLE_LIMITS.assets.maxAsset;
  for (const file of assetFiles) {
    const sizeKB = await getFileSizeKB(file);
    if (sizeKB > assetLimit) {
      results.passed = false;
      results.checks.push({
        name: `Asset: ${file.replace(DIST_DIR, '').replace(/\\/g, '/')}`,
        sizeKB,
        limitKB: assetLimit,
        passed: false,
        percentage: Math.round((sizeKB / assetLimit) * 100),
      });

      if (!JSON_OUTPUT) {
        console.error(`❌ Large asset (${formatSize(sizeKB)}): ${file.replace(DIST_DIR, '')}`);
      }
    }
  }

  // Output results
  if (JSON_OUTPUT) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('\n📦 Bundle Size Report');
    console.log('━'.repeat(50));

    for (const check of results.checks) {
      const icon = check.passed ? '✅' : '❌';
      const size = formatSize(check.sizeKB);
      const limit = formatSize(check.limitKB);
      console.log(`${icon} ${check.name}: ${size} / ${limit} (${check.percentage}%)`);
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      for (const warning of results.warnings) {
        console.log(`   - ${warning}`);
      }
    }

    console.log('━'.repeat(50));
    console.log(results.passed ? '✅ Bundle size check passed' : '❌ Bundle size check failed');
  }

  process.exit(results.passed ? 0 : 1);
}

checkBundleSize().catch((err) => {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify({ error: err.message, passed: false }));
  } else {
    console.error('❌ Bundle size check error:', err.message);
  }
  process.exit(1);
});
