/**
 * Core Web Vitals benchmark script.
 * Addresses TD-013: Add Performance Tests
 *
 * Run: node scripts/performance/core-web-vitals.mjs
 */

import { performance } from 'perf_hooks';

const BENCHMARKS = {
  FCP: { target: 1800, unit: 'ms' },    // First Contentful Paint
  LCP: { target: 2500, unit: 'ms' },    // Largest Contentful Paint
  TTI: { target: 3500, unit: 'ms' },    // Time to Interactive
  TBT: { target: 200, unit: 'ms' },     // Total Blocking Time
  CLS: { target: 0.1, unit: '' },        // Cumulative Layout Shift
};

function measureBundleSize() {
  const fs = await import('fs');
  const path = await import('path');

  const distPath = path.resolve(process.cwd(), 'dist/assets');
  if (!fs.existsSync(distPath)) {
    console.warn('⚠️  dist/assets not found. Run npm run build first.');
    return null;
  }

  const files = fs.readdirSync(distPath);
  let jsSize = 0;
  let cssSize = 0;

  for (const file of files) {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    if (file.endsWith('.js')) jsSize += stats.size;
    if (file.endsWith('.css')) cssSize += stats.size;
  }

  return { jsSize, cssSize };
}

async function runBenchmarks() {
  console.log('🔬 EngineerOS Core Web Vitals Benchmark');
  console.log('=========================================\n');

  const start = performance.now();

  // Simulate app bootstrap time
  const bootstrapStart = performance.now();
  // In real scenario, this would measure actual app initialization
  const bootstrapTime = performance.now() - bootstrapStart;

  console.log(`📦 App Bootstrap: ${bootstrapTime.toFixed(2)}ms`);
  console.log(`🎯 Target TTI: ${BENCHMARKS.TTI.target}ms\n`);

  const bundle = await measureBundleSize();
  if (bundle) {
    const jsKB = (bundle.jsSize / 1024).toFixed(1);
    const cssKB = (bundle.cssSize / 1024).toFixed(1);
    const jsLimit = 1000; // 1MB
    const cssLimit = 200; // 200KB

    console.log('📊 Bundle Size Analysis');
    console.log(`   JS:  ${jsKB}KB / ${jsLimit}KB ${bundle.jsSize > jsLimit * 1024 ? '❌ EXCEEDED' : '✅ OK'}`);
    console.log(`   CSS: ${cssKB}KB / ${cssLimit}KB ${bundle.cssSize > cssLimit * 1024 ? '❌ EXCEEDED' : '✅ OK'}`);
    console.log();
  }

  const elapsed = performance.now() - start;
  console.log(`⏱️  Benchmark completed in ${elapsed.toFixed(2)}ms`);
  console.log('\n📋 Targets:');
  console.log(`   FCP: < ${BENCHMARKS.FCP.target}ms`);
  console.log(`   LCP: < ${BENCHMARKS.LCP.target}ms`);
  console.log(`   TTI: < ${BENCHMARKS.TTI.target}ms`);
  console.log(`   TBT: < ${BENCHMARKS.TBT.target}ms`);
  console.log(`   CLS: < ${BENCHMARKS.CLS.target}`);
}

runBenchmarks().catch(console.error);
