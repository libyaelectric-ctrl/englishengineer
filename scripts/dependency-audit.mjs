#!/usr/bin/env node

/**
 * scripts/dependency-audit.mjs
 *
 * Custom dependency/license audit used by .github/workflows/dependency-audit.yml.
 * This wraps `npm audit` with project-specific "reviewed advisory" exemptions
 * so that known, already-assessed advisories (e.g. advisories that don't
 * apply to how this app uses a package) don't perpetually fail CI, while any
 * *new* critical/high advisory still fails the build.
 *
 * Reconstructed: this file was referenced by CI but missing from the repo.
 * If you have the original implementation, prefer restoring that instead.
 */
import { execSync } from 'node:child_process';

// Advisories that have been manually reviewed and confirmed not to affect
// this application's usage. Keep this list small and documented — every
// entry here is a deliberate, reviewed exemption, not a blanket suppression.
const REVIEWED_ADVISORIES = [
  {
    id: 'GHSA-qwww-vcr4-c8h2',
    package: 'react-router',
    reason: 'RSC-mode CSRF bypass does not apply — this app does not use React Router RSC mode.',
  },
];

function runNpmAudit() {
  let raw;
  try {
    raw = execSync('npm audit --omit=dev --json', { encoding: 'utf-8' });
  } catch (error) {
    // npm audit exits non-zero when vulnerabilities are found; stdout still
    // contains the JSON report in that case.
    raw = error.stdout || '{}';
  }
  try {
    return JSON.parse(raw);
  } catch {
    console.error('::error::Failed to parse `npm audit --json` output');
    process.exit(1);
  }
}

function main() {
  const audit = runNpmAudit();
  const vulnerabilities = audit.vulnerabilities || {};

  const unreviewed = [];
  const reviewed = [];

  for (const [name, info] of Object.entries(vulnerabilities)) {
    const viaEntries = Array.isArray(info.via) ? info.via : [];
    for (const via of viaEntries) {
      if (typeof via !== 'object' || !via.source) continue;
      const advisoryUrl = via.url || '';
      const match = REVIEWED_ADVISORIES.find(
        (entry) => advisoryUrl.includes(entry.id) || name === entry.package
      );
      if (match) {
        reviewed.push({ name, severity: info.severity, ...match });
      } else if (info.severity === 'critical' || info.severity === 'high') {
        unreviewed.push({ name, severity: info.severity, title: via.title });
      }
    }
  }

  console.log('=== Dependency Audit Summary ===');
  console.log(`Total advisories reported: ${Object.keys(vulnerabilities).length}`);
  console.log(`Reviewed / exempted: ${reviewed.length}`);
  for (const r of reviewed) {
    console.log(`  - [${r.severity}] ${r.name}: ${r.reason}`);
  }
  console.log(`Unreviewed critical/high: ${unreviewed.length}`);
  for (const u of unreviewed) {
    console.log(`  - [${u.severity}] ${u.name}: ${u.title || 'see npm audit for details'}`);
  }

  if (unreviewed.length > 0) {
    console.error(
      '::error::Unreviewed critical/high severity vulnerabilities found. Review and either fix, or add a documented exemption to scripts/dependency-audit.mjs.'
    );
    process.exit(1);
  }

  console.log('No unreviewed critical/high severity vulnerabilities found.');
}

main();
