#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoots = ['src', 'backend/src', 'scripts'];
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const excludedFiles = new Set(['scripts/audit-quality-debt.mjs']);
const patterns = {
  eslint: /eslint-disable/,
  tsIgnore: /@ts-ignore/,
  tsExpectError: /@ts-expect-error/,
  coverage: /(?:istanbul|c8) ignore/,
  complexity: /eslint-disable-(?:next-)?line complexity|eslint-disable complexity/,
};

async function walk(directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(directory, entry.name);
    const normalized = relative.replace(/\\/g, '/');
    if (entry.isDirectory()) files.push(...(await walk(relative)));
    else if (extensions.has(path.extname(entry.name)) && !excludedFiles.has(normalized))
      files.push(relative);
  }
  return files;
}

const findings = [];
for (const sourceRoot of sourceRoots) {
  for (const file of await walk(sourceRoot)) {
    const lines = (await readFile(path.join(root, file), 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      const kinds = Object.entries(patterns)
        .filter(([, pattern]) => pattern.test(line))
        .map(([kind]) => kind);
      if (kinds.length) findings.push({ file, line: index + 1, kinds, source: line.trim() });
    });
  }
}

const counts = Object.fromEntries(
  Object.keys(patterns).map((kind) => [
    kind,
    findings.filter((item) => item.kinds.includes(kind)).length,
  ])
);
const total = findings.filter((item) => !item.kinds.includes('complexity')).length;
console.log(JSON.stringify({ total, counts, findings }, null, 2));
assert.equal(counts.tsIgnore, 0, '@ts-ignore is forbidden');
assert.ok(total <= 22, `suppression baseline increased: ${total} > 22`);
assert.ok(
  counts.complexity <= 16,
  `complexity suppression baseline increased: ${counts.complexity} > 16`
);
console.log('QUALITY_DEBT_AUDIT_OK');
