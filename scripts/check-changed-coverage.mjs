#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const baseRef = process.env.COVERAGE_BASE_REF || 'HEAD^';
const threshold = Number(process.env.CHANGED_COVERAGE_THRESHOLD || 80);
const diff = spawnSync('git', ['diff', '--unified=0', '--diff-filter=ACMR', `${baseRef}...HEAD`, '--', 'src/**/*.ts', 'src/**/*.tsx'], { cwd: root, encoding: 'utf8' });
if (diff.status !== 0) throw new Error(`Unable to read changed lines from ${baseRef}: ${diff.stderr.trim()}`);
const changedLines = new Map();
let currentFile = null;
for (const line of diff.stdout.split(/\r?\n/)) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.slice(6);
    if (!changedLines.has(currentFile)) changedLines.set(currentFile, new Set());
    continue;
  }
  const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
  if (!hunk || !currentFile) continue;
  const start = Number(hunk[1]);
  const count = Number(hunk[2] ?? 1);
  for (let offset = 0; offset < count; offset += 1) changedLines.get(currentFile).add(start + offset);
}
const coverage = JSON.parse(await readFile(path.join(root, 'coverage/coverage-final.json'), 'utf8'));
let executable = 0;
let covered = 0;
const details = [];
for (const [absoluteFile, fileCoverage] of Object.entries(coverage)) {
  const relativeFile = path.relative(root, absoluteFile).replaceAll('\\', '/');
  const lines = changedLines.get(relativeFile);
  if (!lines) continue;
  let fileExecutable = 0;
  let fileCovered = 0;
  for (const [statementId, location] of Object.entries(fileCoverage.statementMap)) {
    if (!lines.has(location.start.line)) continue;
    fileExecutable += 1;
    if (fileCoverage.s[statementId] > 0) fileCovered += 1;
  }
  if (fileExecutable > 0) {
    executable += fileExecutable;
    covered += fileCovered;
    details.push({ file: relativeFile, covered: fileCovered, executable: fileExecutable });
  }
}
if (executable === 0) {
  console.log('CHANGED_COVERAGE_OK no changed executable statements');
  process.exit(0);
}
const percentage = (covered / executable) * 100;
console.log(JSON.stringify({ baseRef, threshold, covered, executable, percentage, details }, null, 2));
if (percentage < threshold) {
  console.error(`Changed statement coverage ${percentage.toFixed(2)}% is below ${threshold}%`);
  process.exit(1);
}
console.log(`CHANGED_COVERAGE_OK ${percentage.toFixed(2)}%`);
