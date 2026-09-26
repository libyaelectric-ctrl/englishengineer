#!/usr/bin/env node

/**
 * .freebuff reference check
 *
 * Every path-like target a script or config under `.freebuff/` names must exist on disk.
 * Scratch directories outlive the files they point at, and that has already cost two
 * debugging sessions: a vitest config kept including a harness that had been deleted, and
 * the visual-regression analyzer kept reading a PNG that had been deduped out of one run
 * directory while the other still had it.
 *
 * Rules
 *  1. A reference with a directory part must resolve against the referring file's own
 *     directory or the repo root.
 *  2. A bare filename must exist somewhere in the repo (not just under `.freebuff/`, since
 *     comments reference source files too).
 *  3. If a directory under `.freebuff/` holds at least two of a script's bare filenames, it
 *     must hold all of them — a run directory is an all-or-nothing set, so one missing
 *     member is what makes the script throw when it walks that directory.
 *  4. An extensionless relative import (`from './x'`) must resolve against the referring
 *     file's directory or the repo root, probing the usual extensions and `index` files, or
 *     by filename anywhere in the repo — `.freebuff` stores copies of files whose relative
 *     imports only resolve in their original location.
 *
 * What counts as a reference: a quoted filename, a module specifier, or any path-like token
 * containing a `/` (which is how unquoted shell arguments appear). Bare unquoted filenames are
 * ignored — that is what keeps code like `console.log` from being read as a file, at the cost
 * of missing an unquoted `bash something.sh`.
 *
 * Documented limits — shapes this check does not judge. None of them occurs in a real
 * `.freebuff` file today (measured against the whole tree, not assumed):
 *  - glob patterns (`*.png`)
 *  - paths built at runtime or inside template literals (`repos/${REPO}/actions/...`)
 *  - absolute paths outside the repo (`/tmp/vite5199.log`)
 *  - redirect targets (only `>/dev/null`, which is not a file)
 *  - directory-only literals with no filename and no import to resolve them
 *  - `.md` files: `run.md` records removed artifacts on purpose, so its mentions are
 *    tombstones, not live references
 *  - lines that inspect git history (`git show <rev>:<path>`), where a path may legitimately
 *    be absent from disk.
 *
 * Traversal boundary: a nested checkout under `.freebuff/` is neither scanned nor used to resolve
 * references — its files belong to that checkout, not to this repo's scratch. Sibling threads keep
 * worktrees there (`.freebuff/<name>`), and scanning one reported ~1550 "dangling" references from
 * its tracked files: a false red on the outer repo, and a check that cries wolf gets bypassed.
 * Both a worktree and a clone carry a `.git` entry (a file for a worktree, a directory for a clone),
 * which is the test. A nested *copy* with no `.git` is indistinguishable from scratch and is
 * still scanned.
 *
 * Usage: node scripts/check-freebuff-refs.mjs [--verbose]
 * Exit:  0 clean, or `.freebuff/` absent (CI, fresh clone); 1 dangling references.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_ROOT = join(REPO_ROOT, '.freebuff');
const PRUNE = new Set(['node_modules', '.git', 'dist', 'coverage', 'build', '.vite']);
const VERBOSE = process.argv.includes('--verbose');
// Nested checkouts are out of scope: see "Traversal boundary" in the header.
const nestedCheckoutRoots = new Set();
const isNestedCheckout = (dir) => existsSync(join(dir, '.git'));

const SCAN_EXTENSIONS = new Set(['.mjs', '.cjs', '.js', '.ts', '.tsx', '.sh', '.bat', '.json']);
// Longest alternatives first: `.json` must not be cut down to `.js`.
const FILE_EXTENSIONS = [
  'mjs',
  'cjs',
  'json',
  'jsx',
  'js',
  'tsx',
  'ts',
  'sh',
  'bat',
  'jpeg',
  'jpg',
  'png',
  'webm',
  'zip',
  'log',
  'txt',
  'csv',
  'sql',
  'conf',
  'yaml',
  'yml',
  'jwt',
  'svg',
  'css',
  'html',
  'md',
];
const KNOWN_EXTENSIONS = new Set(FILE_EXTENSIONS.map((extension) => `.${extension}`));
const REFERENCE = new RegExp(
  `(?:\\.{1,2}\\/|\\/)?\\.?[A-Za-z0-9_][A-Za-z0-9_.-]*(?:\\/[A-Za-z0-9_.-]+)*\\.(?:${FILE_EXTENSIONS.join('|')})`,
  'g'
);
// Probing order for extensionless imports; the empty string matches an explicit filename.
const MODULE_PROBES = ['', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.jsx'];
const IMPORT_SPECIFIER = /(?:from|require\(|import\()\s*['"](\.[^'"]+)['"]/g;
const QUOTE = new Set(["'", '"', '`']);
// An import can never resolve to a directory: an emptied run directory must not pass.
const isFile = (candidate) => existsSync(candidate) && statSync(candidate).isFile();
const HISTORY_LINE = /\bgit\s+(?:show|cat-file|log|diff|rev-list|checkout|restore)\b/;

const show = (file) =>
  file
    .slice(REPO_ROOT.length + 1)
    .split(sep)
    .join('/');

const walk = (dir) => {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const child = join(dir, entry.name);
      if (PRUNE.has(entry.name)) continue;
      if (isNestedCheckout(child)) {
        nestedCheckoutRoots.add(child);
        continue;
      }
      found.push(...walk(child));
    } else if (entry.isFile()) {
      found.push(join(dir, entry.name));
    }
  }
  return found;
};

/** The one repo path per basename, used by rules 2 and 4. */
const repoFilesByBasename = new Map();
for (const file of walk(REPO_ROOT)) {
  const name = basename(file);
  if (!repoFilesByBasename.has(name)) repoFilesByBasename.set(name, file);
}

/**
 * Resolve `./x` the way a bundler would: relative to the referring file, then the repo root,
 * then by filename anywhere (a copy under `.freebuff` keeps its original location's imports).
 */
const resolveModule = (specifier, fromDir) => {
  for (const base of [resolve(fromDir, specifier), resolve(REPO_ROOT, specifier)]) {
    for (const probe of MODULE_PROBES) {
      if (isFile(base + probe)) return base + probe;
    }
    for (const probe of MODULE_PROBES.slice(1)) {
      if (isFile(join(base, `index${probe}`))) return join(base, `index${probe}`);
    }
  }
  const name = basename(specifier);
  for (const probe of MODULE_PROBES) {
    const match = repoFilesByBasename.get(`${name}${probe}`);
    if (match) return match;
  }
  return null;
};

if (!existsSync(SCAN_ROOT)) {
  console.log('[freebuff-refs] skipped: no .freebuff/ directory in this checkout');
  process.exit(0);
}

const scratchFiles = walk(SCAN_ROOT);
const scratchDirsByBasename = new Map();
for (const file of scratchFiles) {
  const name = basename(file);
  if (!scratchDirsByBasename.has(name)) scratchDirsByBasename.set(name, new Set());
  scratchDirsByBasename.get(name).add(dirname(file));
}

const findings = [];
const verboseLines = [];
let referenceCount = 0;

for (const file of scratchFiles.filter((f) => SCAN_EXTENSIONS.has(extname(f)))) {
  const fileDir = dirname(file);
  const shown = file
    .slice(REPO_ROOT.length + 1)
    .split(sep)
    .join('/');
  const bareReferences = new Map();

  for (const [index, line] of readFileSync(file, 'utf8').split(/\r?\n/).entries()) {
    if (HISTORY_LINE.test(line)) continue;

    for (const match of line.matchAll(IMPORT_SPECIFIER)) {
      const specifier = match[1];
      if (KNOWN_EXTENSIONS.has(extname(specifier))) continue; // the plain-reference rule covers it
      referenceCount += 1;
      const resolved = resolveModule(specifier, fileDir);
      if (resolved) {
        if (VERBOSE) {
          verboseLines.push(
            `ok   ${shown}:${index + 1}  ${specifier} -> ${resolved
              .slice(REPO_ROOT.length + 1)
              .split(sep)
              .join('/')}`
          );
        }
      } else {
        findings.push({
          where: `${shown}:${index + 1}`,
          token: specifier,
          why: 'extensionless import resolves to no file (probed extensions and index files)',
        });
      }
    }

    for (const match of line.matchAll(REFERENCE)) {
      const token = match[0];
      const before = match.index > 0 ? line[match.index - 1] : '';
      const quoted = QUOTE.has(before);
      // Fragments of a longer or templated path cannot be verified on their own.
      if (token.startsWith('/') || before === '/' || before === '$' || before === '{') continue;
      if (!quoted && !token.includes('/')) continue;
      referenceCount += 1;

      if (token.includes('/')) {
        const candidates = [resolve(fileDir, token), resolve(REPO_ROOT, token)];
        if (candidates.some((candidate) => existsSync(candidate))) {
          if (VERBOSE) verboseLines.push(`ok   ${shown}:${index + 1}  ${token}`);
        } else {
          findings.push({
            where: `${shown}:${index + 1}`,
            token,
            why: 'not resolvable against the referring directory or the repo root',
          });
        }
        continue;
      }

      if (!repoFilesByBasename.has(token)) {
        findings.push({
          where: `${shown}:${index + 1}`,
          token,
          why: 'no file with this name exists anywhere in the repo',
        });
      } else if (VERBOSE) {
        verboseLines.push(`ok   ${shown}:${index + 1}  ${token}`);
      }
      bareReferences.set(token, scratchDirsByBasename.get(token) ?? new Set());
    }
  }

  // Rule 3 — a run directory holding at least two of this script's inputs must hold all.
  const held = new Map();
  for (const dirs of bareReferences.values()) {
    for (const dir of dirs) held.set(dir, (held.get(dir) ?? 0) + 1);
  }
  for (const [dir, count] of held) {
    if (count < 2) continue;
    for (const token of bareReferences.keys()) {
      if (!existsSync(join(dir, token))) {
        findings.push({
          where: shown,
          token: `${dir
            .slice(REPO_ROOT.length + 1)
            .split(sep)
            .join('/')}/${token}`,
          why: `run directory holds ${count} of this script's inputs but not this one`,
        });
      }
    }
  }
}

if (VERBOSE) {
  for (const root of nestedCheckoutRoots) console.log(`skip ${show(root)} (nested checkout)`);
  console.log(verboseLines.join('\n'));
}

if (findings.length > 0) {
  console.error(`[freebuff-refs] FAIL: ${findings.length} dangling reference(s)`);
  for (const { where, token, why } of findings) {
    console.error(`  ${where}  ${token}`);
    console.error(`    ${why}`);
  }
  process.exit(1);
}

const skipped =
  nestedCheckoutRoots.size > 0
    ? ` (skipped ${nestedCheckoutRoots.size} nested checkout(s): ${[...nestedCheckoutRoots]
        .map(show)
        .join(', ')})`
    : '';
console.log(
  `[freebuff-refs] PASS: ${referenceCount} reference(s) in .freebuff scripts/configs all resolve${skipped}`
);
