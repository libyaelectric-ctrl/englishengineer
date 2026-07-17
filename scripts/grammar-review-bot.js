#!/usr/bin/env node

/**
 * Grammar Review Bot for EngVox
 *
 * Reviews PR title, body, and commit messages for grammar issues.
 * Posts a single comment with suggestions and a link to EngVox.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPOSITORY = process.env.REPOSITORY;
const PR_TITLE = process.env.PR_TITLE || '';
const PR_BODY = process.env.PR_BODY || '';
const COMMIT_SHA = process.env.COMMIT_SHA;

const ENGVOX_URL = 'https://englishengineer.vercel.app';

const API_BASE = 'https://api.github.com';

/**
 * Common grammar patterns to check
 */
const GRAMMAR_PATTERNS = [
  {
    pattern: /\b(its|it's)\b/gi,
    description: "its vs it's",
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (
        match.toLowerCase() === 'its' &&
        (lower.includes('it is') || lower.includes('it has'))
      ) {
        return {
          suggestion: "it's",
          reason: 'Use "it\'s" for "it is" or "it has"',
        };
      }
      if (
        match.toLowerCase() === "it's" &&
        !lower.includes('it is') &&
        !lower.includes('it has')
      ) {
        return { suggestion: 'its', reason: 'Use "its" for possessive form' };
      }
      return null;
    },
  },
  {
    pattern: /\b(your|you're)\b/gi,
    description: "your vs you're",
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (
        match.toLowerCase() === 'your' &&
        (lower.includes('you are') || lower.includes('you were'))
      ) {
        return {
          suggestion: "you're",
          reason: 'Use "you\'re" for "you are" or "you were"',
        };
      }
      if (
        match.toLowerCase() === "you're" &&
        !lower.includes('you are') &&
        !lower.includes('you were')
      ) {
        return { suggestion: 'your', reason: 'Use "your" for possessive form' };
      }
      return null;
    },
  },
  {
    pattern: /\b(then|than)\b/gi,
    description: 'then vs than',
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (
        match.toLowerCase() === 'then' &&
        (lower.includes('more') ||
          lower.includes('better') ||
          lower.includes('worse'))
      ) {
        return { suggestion: 'than', reason: 'Use "than" for comparisons' };
      }
      return null;
    },
  },
  {
    pattern: /\b(accept|except)\b/gi,
    description: 'accept vs except',
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (match.toLowerCase() === 'accept' && lower.includes('all but')) {
        return { suggestion: 'except', reason: 'Use "except" for exclusion' };
      }
      return null;
    },
  },
  {
    pattern: /\b(affect|effect)\b/gi,
    description: 'affect vs effect',
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (match.toLowerCase() === 'affect' && lower.includes('the effect')) {
        return { suggestion: 'effect', reason: 'Use "effect" as a noun' };
      }
      if (match.toLowerCase() === 'effect' && lower.includes('to effect')) {
        return { suggestion: 'affect', reason: 'Use "affect" as a verb' };
      }
      return null;
    },
  },
  {
    pattern: /\b(their|there|they're)\b/gi,
    description: "their/there/they're",
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (match.toLowerCase() === 'their' && lower.includes('they are')) {
        return {
          suggestion: "they're",
          reason: 'Use "they\'re" for "they are"',
        };
      }
      if (match.toLowerCase() === "they're" && !lower.includes('they are')) {
        return {
          suggestion: 'their',
          reason: 'Use "their" for possessive form',
        };
      }
      return null;
    },
  },
  {
    pattern: /\b(lose|loose)\b/gi,
    description: 'lose vs loose',
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (
        match.toLowerCase() === 'loose' &&
        (lower.includes('weight') || lower.includes('game'))
      ) {
        return {
          suggestion: 'lose',
          reason: 'Use "lose" for "to not win" or "to misplace"',
        };
      }
      return null;
    },
  },
  {
    pattern: /\b(principal|principle)\b/gi,
    description: 'principal vs principle',
    check: (match, context) => {
      const lower = context.toLowerCase();
      if (
        match.toLowerCase() === 'principle' &&
        (lower.includes('principal') || lower.includes('head'))
      ) {
        return {
          suggestion: 'principal',
          reason: 'Use "principal" for "head of school" or "main"',
        };
      }
      return null;
    },
  },
  {
    pattern: /\b(definitely|definately|definatly)\b/gi,
    description: 'definitely spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'definitely') {
        return { suggestion: 'definitely', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(seperate|separate)\b/gi,
    description: 'separate spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'separate') {
        return { suggestion: 'separate', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(occured|occurred)\b/gi,
    description: 'occurred spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'occurred') {
        return { suggestion: 'occurred', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(refered|referred)\b/gi,
    description: 'referred spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'referred') {
        return { suggestion: 'referred', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(commiting|committing)\b/gi,
    description: 'committing spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'committing') {
        return { suggestion: 'committing', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(dependancy|dependency)\b/gi,
    description: 'dependency spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'dependency') {
        return { suggestion: 'dependency', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(recieve|receive)\b/gi,
    description: 'receive spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'receive') {
        return { suggestion: 'receive', reason: 'Common misspelling' };
      }
      return null;
    },
  },
  {
    pattern: /\b(acheive|achieve)\b/gi,
    description: 'achieve spelling',
    check: (match) => {
      if (match.toLowerCase() !== 'achieve') {
        return { suggestion: 'achieve', reason: 'Common misspelling' };
      }
      return null;
    },
  },
];

/**
 * GitHub API helper
 */
async function githubApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'EngVox-Grammar-Bot',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Check text for grammar issues
 */
function checkGrammar(text, source = 'text') {
  const issues = [];

  for (const pattern of GRAMMAR_PATTERNS) {
    const matches = text.matchAll(pattern.pattern);
    for (const match of matches) {
      const result = pattern.check(match[0], text);
      if (result) {
        issues.push({
          source,
          text: match[0],
          suggestion: result.suggestion,
          reason: result.reason,
        });
      }
    }
  }

  return issues;
}

/**
 * Get PR commits
 */
async function getPRCommits() {
  try {
    const commits = await githubApi(
      `/repos/${REPOSITORY}/pulls/${PR_NUMBER}/commits`
    );
    return commits.map((c) => ({
      message: c.commit.message,
      sha: c.sha.substring(0, 7),
    }));
  } catch (error) {
    console.error('Failed to fetch commits:', error.message);
    return [];
  }
}

/**
 * Get PR diff
 */
async function getPRDiff() {
  try {
    const response = await fetch(
      `${API_BASE}/repos/${REPOSITORY}/pulls/${PR_NUMBER}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.diff',
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'EngVox-Grammar-Bot',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch diff: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Failed to fetch diff:', error.message);
    return '';
  }
}

/**
 * Extract comments from diff
 */
function extractDiffComments(diff) {
  const comments = [];
  const lines = diff.split('\n');

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const content = line.substring(1).trim();
      if (
        content.length > 0 &&
        !content.startsWith('//') &&
        !content.startsWith('/*')
      ) {
        comments.push(content);
      }
    }
  }

  return comments;
}

/**
 * Format issues as markdown
 */
function formatIssues(issues) {
  if (issues.length === 0) {
    return '### ✅ Grammar Check Passed\n\nNo grammar issues found in PR title, body, or commit messages.';
  }

  let markdown = '### 📝 Grammar Review\n\n';
  markdown += 'Found potential grammar issues:\n\n';

  const grouped = {};
  for (const issue of issues) {
    if (!grouped[issue.source]) {
      grouped[issue.source] = [];
    }
    grouped[issue.source].push(issue);
  }

  for (const [source, sourceIssues] of Object.entries(grouped)) {
    markdown += `**${source}:**\n\n`;
    for (const issue of sourceIssues) {
      markdown += `- **"${issue.text}"** → **"${issue.suggestion}"**\n`;
      markdown += `  ${issue.reason}\n\n`;
    }
  }

  markdown += `\n---\n\n`;
  markdown += `💡 **Want a more detailed grammar check?** Visit [EngVox](${ENGVOX_URL}) for comprehensive English grammar analysis and learning resources.\n`;

  return markdown;
}

/**
 * Post PR comment
 */
async function postComment(body) {
  try {
    await githubApi(`/repos/${REPOSITORY}/issues/${PR_NUMBER}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    console.log('Comment posted successfully');
  } catch (error) {
    console.error('Failed to post comment:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`Reviewing PR #${PR_NUMBER} in ${REPOSITORY}`);

  const allIssues = [];

  // Check PR title
  const titleIssues = checkGrammar(PR_TITLE, 'PR Title');
  allIssues.push(...titleIssues);

  // Check PR body
  if (PR_BODY) {
    const bodyIssues = checkGrammar(PR_BODY, 'PR Description');
    allIssues.push(...bodyIssues);
  }

  // Check commit messages
  const commits = await getPRCommits();
  for (const commit of commits) {
    const commitIssues = checkGrammar(commit.message, `Commit ${commit.sha}`);
    allIssues.push(...commitIssues);
  }

  // Check diff comments (optional - for code comments)
  const diff = await getPRDiff();
  const diffComments = extractDiffComments(diff);
  for (const comment of diffComments) {
    const commentIssues = checkGrammar(comment, 'Code Comment');
    allIssues.push(...commentIssues);
  }

  // Format and post comment
  const comment = formatIssues(allIssues);
  await postComment(comment);

  console.log(`Found ${allIssues.length} grammar issues`);
}

main().catch((error) => {
  console.error('Grammar review bot failed:', error.message);
  process.exit(1);
});
