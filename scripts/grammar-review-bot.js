#!/usr/bin/env node
/**
 * scripts/grammar-review-bot.js
 *
 * Runs on every PR (see .github/workflows/grammar-review.yml). Scans the
 * PR's added lines in content/copy files for a small set of common English
 * usage mistakes and posts a single summary comment on the PR via the
 * GitHub REST API.
 *
 * This is intentionally a lightweight heuristic linter, not a full grammar
 * checker — it exists to catch obvious slips (double spaces, "its/it's"
 * confusion, repeated words) in learner-facing content before merge.
 *
 * Reconstructed: this file was referenced by CI but missing from the repo.
 * If you have the original implementation, prefer restoring that instead.
 *
 * Required env vars: GITHUB_TOKEN, PR_NUMBER, REPOSITORY (owner/repo)
 * Optional: PR_TITLE, PR_BODY, COMMIT_SHA
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPOSITORY = process.env.REPOSITORY;

const CONTENT_EXTENSIONS = new Set(['.md', '.mdx', '.ts', '.tsx', '.json']);
// Only scan paths likely to contain learner-facing or human-readable copy —
// not generated data, lockfiles, etc.
const CONTENT_PATH_HINTS = ['src/features/localization/', 'src/data/', 'docs/', 'README'];

const RULES = [
  {
    id: 'double-space',
    pattern: /[a-zA-Z][ ]{2,}[a-zA-Z]/,
    message: 'Possible double space between words.',
  },
  {
    id: 'its-vs-it-s',
    pattern: /\bits'\b/,
    message: `"its'" is not standard English — did you mean "its" or "it's"?`,
  },
  {
    id: 'repeated-word',
    pattern: /\b(\w+)\s+\1\b/i,
    message: 'Repeated word detected.',
  },
  {
    id: 'straight-vs-curly-todo-marker',
    pattern: /\bTOOD\b|\bhte\b|\bteh\b/i,
    message: 'Likely typo (TOOD/hte/teh).',
  },
];

function isContentFile(filename) {
  const ext = filename.slice(filename.lastIndexOf('.'));
  if (!CONTENT_EXTENSIONS.has(ext)) return false;
  return CONTENT_PATH_HINTS.some((hint) => filename.includes(hint));
}

async function githubRequest(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'grammar-review-bot',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

function parseAddedLines(patch) {
  if (!patch) return [];
  return patch
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
    .map((line) => line.slice(1));
}

async function main() {
  if (!GITHUB_TOKEN || !PR_NUMBER || !REPOSITORY) {
    console.log(
      'grammar-review-bot: missing GITHUB_TOKEN, PR_NUMBER, or REPOSITORY — skipping (this is expected outside of the PR workflow).'
    );
    return;
  }

  const files = await githubRequest(`/repos/${REPOSITORY}/pulls/${PR_NUMBER}/files?per_page=100`);

  const findings = [];
  for (const file of files) {
    if (!isContentFile(file.filename)) continue;
    const addedLines = parseAddedLines(file.patch);
    addedLines.forEach((line) => {
      for (const rule of RULES) {
        if (rule.pattern.test(line)) {
          findings.push({
            file: file.filename,
            rule: rule.id,
            message: rule.message,
            snippet: line.trim().slice(0, 120),
          });
        }
      }
    });
  }

  const body =
    findings.length === 0
      ? '✅ **Grammar Review Bot**: no obvious issues found in changed content files.'
      : [
          `⚠️ **Grammar Review Bot**: found ${findings.length} potential issue(s) in changed content files.`,
          '',
          ...findings.slice(0, 30).map((f) => `- \`${f.file}\`: ${f.message}\n  > ${f.snippet}`),
          findings.length > 30 ? `\n_...and ${findings.length - 30} more._` : '',
          '',
          '_This is an automated heuristic check, not a full grammar checker. Please review manually if anything above looks wrong._',
        ].join('\n');

  await githubRequest(`/repos/${REPOSITORY}/issues/${PR_NUMBER}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

  console.log(`grammar-review-bot: posted comment with ${findings.length} finding(s).`);
}

main().catch((error) => {
  console.error('::error::grammar-review-bot failed:', error.message);
  // Non-blocking: a bot failure shouldn't fail the PR check.
  process.exit(0);
});
