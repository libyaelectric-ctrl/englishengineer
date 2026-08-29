#!/usr/bin/env node

/**
 * Converts vocabulary .seed.ts files to .seed.json files.
 *
 * Each .seed.ts file contains a `serializedParts` string array with JSON
 * split across multiple string literals. This script evaluates the TypeScript
 * to extract the joined JSON and writes it as .seed.json.
 *
 * Usage: node scripts/convert-vocab-seeds.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'src', 'data', 'vocabulary', 'by-level');
const OUT_DIR = join(ROOT, 'public', 'data', 'vocabulary');

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

mkdirSync(OUT_DIR, { recursive: true });

for (const level of LEVELS) {
  const srcFile = join(SRC_DIR, `${level}.seed.ts`);
  const outFile = join(OUT_DIR, `${level}.seed.json`);

  try {
    const content = readFileSync(srcFile, 'utf-8');

    // Find the array start after 'serializedParts: string[] = '
    const marker = 'serializedParts: string[] = ';
    const markerIdx = content.indexOf(marker);
    if (markerIdx === -1) {
      console.error(`  ✗ Could not find serializedParts in ${level}.seed.ts`);
      process.exit(1);
    }

    const arrayStart = markerIdx + marker.length;

    // Find the matching closing bracket
    let depth = 0;
    let arrayEnd = -1;
    for (let i = arrayStart; i < content.length; i++) {
      if (content[i] === '[') depth++;
      if (content[i] === ']') {
        depth--;
        if (depth === 0) {
          arrayEnd = i;
          break;
        }
      }
    }

    if (arrayEnd === -1) {
      console.error(`  ✗ Could not find end of serializedParts array in ${level}.seed.ts`);
      process.exit(1);
    }

    // Extract the array literal and evaluate it
    const arrayLiteral = content.substring(arrayStart, arrayEnd + 1);
    const serializedParts = eval(arrayLiteral);
    const jsonStr = serializedParts.join('');

    // Validate it's valid JSON
    const parsed = JSON.parse(jsonStr);
    writeFileSync(outFile, JSON.stringify(parsed), 'utf-8');

    const srcSize = (readFileSync(srcFile).length / 1024 / 1024).toFixed(1);
    const outSize = (readFileSync(outFile).length / 1024 / 1024).toFixed(1);
    const count = Array.isArray(parsed) ? parsed.length : '?';
    console.log(`  ✓ ${level}: ${srcSize}MB → ${outSize}MB (${count} terms)`);
  } catch (err) {
    console.error(`  ✗ ${level}: ${err.message}`);
    process.exit(1);
  }
}

console.log('\nDone. Vocabulary seeds converted to JSON.');
