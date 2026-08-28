#!/usr/bin/env node

/**
 * A11y Audit — Static accessibility checker
 *
 * Scans TSX files for common accessibility issues:
 * - Missing aria-label on interactive elements
 * - Missing alt text on images
 * - Missing role attributes
 * - Non-semantic button/link usage
 * - Missing keyboard handlers on custom interactive elements
 *
 * Usage: node scripts/a11y-audit.mjs [--fix] [--json] [--verbose]
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);

const JSON_OUTPUT = args.includes('--json');
const VERBOSE = args.includes('--verbose');
const SRC_DIR = resolve(process.cwd(), 'src');

// Patterns to check
const ISSUES = [
  {
    id: 'no-img-alt',
    severity: 'error',
    message: 'Image missing alt attribute',
    pattern: /<img\s+(?![^>]*\balt\b)[^>]*>/gi,
    suggestion: 'Add alt="" for decorative images or alt="description" for meaningful images',
  },
  {
    id: 'no-button-label',
    severity: 'warning',
    message: 'Icon-only button missing aria-label',
    pattern: /<button\s+(?![^>]*\baria-label\b)[^>]*>\s*<[A-Z]\w+Icon|<LucideIcon/gi,
    suggestion: 'Add aria-label to describe the button action',
  },
  {
    id: 'no-interactive-role',
    severity: 'warning',
    message: 'Clickable div missing role and keyboard handler',
    pattern: /<div\s+onClick(?![^>]*\brole=)(?![^>]*\btabIndex\b)[^>]*>/gi,
    suggestion: 'Use <button> or add role="button" tabIndex={0} and onKeyDown handler',
  },
  {
    id: 'missing-focus-style',
    severity: 'info',
    message: 'Interactive element may be missing focus styles',
    pattern: /className="[^"]*(?:hover:|focus:)[^"]*"/gi,
    suggestion: 'Ensure focus:ring or focus:outline styles are included',
    checkInverse: true,
  },
  {
    id: 'no-form-label',
    severity: 'error',
    message: 'Input field missing associated label',
    pattern: /<input\s+(?![^>]*\baria-label\b)(?![^>]*\bid=)[^>]*>/gi,
    suggestion: 'Add aria-label or associate with a <label> element',
  },
  {
    id: 'no-skip-link',
    severity: 'info',
    message: 'Page may be missing skip-to-content link',
    pattern: /function\s+\w+Page/g,
    suggestion: 'Consider adding a skip navigation link for keyboard users',
    checkInverse: false,
    once: true,
  },
  {
    id: 'heading-order',
    severity: 'info',
    message: 'Heading hierarchy may be skipped',
    pattern: /<h[3-6][^>]*>.*?<\/h[3-6]>/gi,
    suggestion: 'Ensure heading levels are sequential (h1 → h2 → h3)',
  },
  {
    id: 'color-contrast',
    severity: 'info',
    message: 'Potential low contrast text',
    pattern: /text-(?:gray|slate|zinc|neutral)-\d{2}(?![^"]*\b(?:dark|lg)\b)/gi,
    suggestion: 'Verify text color has sufficient contrast ratio (4.5:1 minimum)',
  },
  {
    id: 'no-aria-live',
    severity: 'info',
    message: 'Dynamic content update without aria-live',
    pattern: /set\w+\([^)]*\).*?(?:<div|<span|<p)(?![^>]*\baria-live\b)/gi,
    suggestion: 'Add aria-live="polite" for dynamic content updates',
  },
];

/**
 * Get all TSX files recursively.
 */
async function getTsxFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...(await getTsxFiles(fullPath)));
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return files;
}

/**
 * Check a file for accessibility issues.
 */
async function checkFile(filePath, verbose) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];
  const seen = new Set();

  for (const rule of ISSUES) {
    if (rule.checkInverse) continue; // Skip inverse checks for now

    const matches = content.matchAll(rule.pattern);
    for (const match of matches) {
      const matchStr = match[0];
      const key = `${rule.id}:${matchStr}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Find line number
      const idx = match.index ?? 0;
      const lineNum = content.slice(0, idx).split('\n').length;

      issues.push({
        file: filePath.replace(SRC_DIR, '').replace(/\\/g, '/'),
        line: lineNum,
        rule: rule.id,
        severity: rule.severity,
        message: rule.message,
        suggestion: rule.suggestion,
        snippet: matchStr.slice(0, 100),
      });

      if (verbose) {
        console.log(`  [${rule.severity}] Line ${lineNum}: ${rule.message}`);
        console.log(`    ${matchStr.slice(0, 80)}...`);
        console.log(`    💡 ${rule.suggestion}`);
      }
    }
  }

  // Check for skip link (once per file)
  const skipLinkRule = ISSUES.find((r) => r.id === 'no-skip-link');
  if (
    skipLinkRule &&
    content.includes('function') &&
    !content.includes('skip') &&
    !content.includes('Skip')
  ) {
    issues.push({
      file: filePath.replace(SRC_DIR, '').replace(/\\/g, '/'),
      line: 1,
      rule: 'no-skip-link',
      severity: 'info',
      message: 'Page component may be missing skip-to-content link',
      suggestion: skipLinkRule.suggestion,
      snippet: '',
    });
  }

  return issues;
}

/**
 * Main audit function.
 */
async function audit() {
  console.log('🔍 Running A11y Audit...\n');

  const files = await getTsxFiles(SRC_DIR);
  console.log(`📁 Scanning ${files.length} TSX files...\n`);

  const allIssues = [];
  const filesWithIssues = new Set();

  for (const file of files) {
    const issues = await checkFile(file, VERBOSE);
    if (issues.length > 0) {
      allIssues.push(...issues);
      filesWithIssues.add(file);
    }
  }

  // Summary
  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');
  const infos = allIssues.filter((i) => i.severity === 'info');

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          filesScanned: files.length,
          filesWithIssues: filesWithIssues.size,
          totalIssues: allIssues.length,
          errors: errors.length,
          warnings: warnings.length,
          infos: infos.length,
          issues: allIssues,
        },
        null,
        2
      )
    );
  } else {
    console.log('━'.repeat(60));
    console.log('📊 A11y Audit Summary');
    console.log('━'.repeat(60));
    console.log(`📁 Files scanned: ${files.length}`);
    console.log(`📄 Files with issues: ${filesWithIssues.size}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`ℹ️  Info: ${infos.length}`);
    console.log('━'.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ Errors (must fix):');
      for (const issue of errors) {
        console.log(`  ${issue.file}:${issue.line} — ${issue.message}`);
        console.log(`    💡 ${issue.suggestion}`);
      }
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings (should fix):');
      for (const issue of warnings) {
        console.log(`  ${issue.file}:${issue.line} — ${issue.message}`);
      }
    }

    if (VERBOSE && infos.length > 0) {
      console.log('\nℹ️  Suggestions:');
      for (const issue of infos) {
        console.log(`  ${issue.file}:${issue.line} — ${issue.message}`);
      }
    }

    console.log('\n' + '━'.repeat(60));
    if (errors.length > 0) {
      console.log('❌ A11y audit failed — fix errors before merging');
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log('⚠️  A11y audit passed with warnings');
    } else {
      console.log('✅ A11y audit passed');
    }
  }
}

audit().catch((err) => {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify({ error: err.message }));
  } else {
    console.error('❌ Audit error:', err.message);
  }
  process.exit(1);
});
