#!/usr/bin/env node

/**
 * Pre-deploy security audit script.
 * Checks for accidentally committed secrets and common security issues.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'NPM Token', regex: /npm_[a-zA-Z0-9]{36}/ },
  { name: 'Slack Token', regex: /xox[baprs]-[a-zA-Z0-9-]+/ },
  { name: 'Stripe Secret Key', regex: /sk_live_[a-zA-Z0-9]+/ },
  { name: 'Generic API Key', regex: /api[_-]?key[_=:]\s*['"][a-zA-Z0-9]{20,}['"]/i },
];

const SCAN_DIRS = ['src', 'backend/src', 'scripts'];
const SKIP_EXTENSIONS = ['.lock', '.map', '.min.js', '.min.css'];

function scanDir(dir, findings) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;

      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath, findings);
        continue;
      }

      if (stat.isFile() && !SKIP_EXTENSIONS.includes(extname(entry))) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          for (const { name, regex } of PATTERNS) {
            const matches = content.match(regex);
            if (matches) {
              findings.push({ file: fullPath, secret: name, match: matches[0].slice(0, 20) + '...' });
            }
          }
        } catch {
          // Binary file, skip
        }
      }
    }
  } catch {
    // Directory read error, skip
  }
}

console.log('Security Audit: Scanning for exposed secrets...\n');

const findings = [];
for (const dir of SCAN_DIRS) {
  scanDir(dir, findings);
}

if (findings.length > 0) {
  console.error('SECURITY VIOLATIONS FOUND:\n');
  findings.forEach(({ file, secret, match }) => {
    console.error(`  ${secret} in ${file}: ${match}`);
  });
  process.exit(1);
} else {
  console.log('No exposed secrets found. Audit passed.');
  process.exit(0);
}
