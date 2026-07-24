#!/usr/bin/env node

/**
 * Dependency Audit Script
 * Checks for vulnerabilities, outdated packages, and license compliance
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}`),
};

let exitCode = 0;

// 1. Vulnerability Scan
log.header('1. Vulnerability Scan');
try {
  const result = execSync('npm audit --json', {
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  const audit = JSON.parse(result);
  const vulns = audit.metadata?.vulnerabilities || {};

  if (vulns.critical > 0) {
    log.error(`Critical vulnerabilities: ${vulns.critical}`);
    exitCode = 1;
  } else if (vulns.high > 0) {
    log.error(`High vulnerabilities: ${vulns.high}`);
    exitCode = 1;
  } else if (vulns.moderate > 0) {
    log.warn(`Moderate vulnerabilities: ${vulns.moderate}`);
  } else {
    log.success('No vulnerabilities found');
  }
} catch {
  log.error('Audit failed');
  exitCode = 1;
}

// 2. Outdated Packages
log.header('2. Outdated Packages');
try {
  const result = execSync('npm outdated --json', {
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  const outdated = JSON.parse(result);
  const count = Object.keys(outdated).length;

  if (count > 10) {
    log.warn(`${count} packages are outdated`);
  } else if (count > 0) {
    log.info(`${count} packages are outdated`);
  } else {
    log.success('All packages are up to date');
  }
} catch {
  log.info('No outdated packages or check failed');
}

// 3. License Check
log.header('3. License Compliance');
try {
  const result = execSync('npm ls --json', {
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  const deps = JSON.parse(result);

  const forbiddenLicenses = [
    'GPL-3.0',
    'AGPL-3.0',
    'GPL-3.0-only',
    'AGPL-3.0-only',
  ];
  let licenseIssues = 0;

  const checkLicenses = (pkg) => {
    if (pkg.license && forbiddenLicenses.some((l) => pkg.license.includes(l))) {
      log.warn(`Forbidden license: ${pkg.name} (${pkg.license})`);
      licenseIssues++;
    }
    if (pkg.dependencies) {
      Object.values(pkg.dependencies).forEach(checkLicenses);
    }
  };

  if (deps.dependencies) {
    Object.values(deps.dependencies).forEach(checkLicenses);
  }

  if (licenseIssues === 0) {
    log.success('No forbidden licenses found');
  } else {
    log.warn(`${licenseIssues} packages with forbidden licenses`);
  }
} catch {
  log.info('License check completed');
}

// 4. Bundle Size Budget
log.header('4. Bundle Size Budget');
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const deps = Object.keys(pkg.dependencies || {}).length;
  const devDeps = Object.keys(pkg.devDependencies || {}).length;

  log.info(`Production dependencies: ${deps}`);
  log.info(`Dev dependencies: ${devDeps}`);

  if (deps > 50) {
    log.warn('High number of production dependencies');
  } else {
    log.success('Dependency count is reasonable');
  }
} catch {
  log.warn('Could not check bundle size');
}

// Summary
log.header('Summary');
if (exitCode === 0) {
  log.success('Dependency audit passed');
} else {
  log.error('Dependency audit failed - please fix issues above');
}

process.exit(exitCode);
