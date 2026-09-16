import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  BACKEND_SENTENCE_CODES,
  BILLING_FAILURE_COPY,
  billingFailureCopy,
} from './billing.failure-copy';

/**
 * The billing failure map is only as good as its coverage: a code that reaches a
 * customer without an entry is the server talking directly to a paying user, which is
 * exactly what this map exists to prevent. These checks derive the codes the billing
 * surface can really emit — from the backend modules the request passes through and
 * from the codes the client writes itself — instead of listing them by hand, so adding
 * a new one to the backend turns this red rather than shipping silently.
 */

const BACKEND_SRC = join(process.cwd(), 'backend', 'src');
const BILLING_FEATURE_SRC = join(process.cwd(), 'src', 'features', 'billing');

/**
 * What a billing request passes through before its handler answers: the routes and
 * everything they call, plus the middleware the routes are composed with in `app.ts`
 * and the mapper that turns any thrown error into the response body.
 */
const BILLING_SURFACE_ENTRIES = [
  'billing-routes.ts',
  'auth.ts',
  'rate-limit.ts',
  'validation.ts',
  'errors.ts',
  'middleware/idempotency.middleware.ts',
  'middleware/csrf.middleware.ts',
];

const API_ERROR_CODE = /ApiError\(\s*(?:\d{3}\s*,\s*)?['"]([^'"]+)['"]/g;
const API_ERROR_CODE_MULTILINE = /ApiError\(\s*\n\s*\d{3}\s*,\s*\n?\s*['"]([^'"]+)['"]/g;
const OBJECT_ERROR_CODE = /code:\s*['"]([a-z_]+)['"]/g;
const CLIENT_API_CODE = /apiCode:\s*'([^']+)'/g;

const resolveRelativeImport = (fromFile: string, specifier: string): string | null => {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(fromFile), specifier.replace(/\.js$/, ''));
  for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
};

/** Every code the billing routes and their middleware chain can put in an error body. */
const backendBillingCodes = (): string[] => {
  const visited = new Set<string>();
  const codes = new Set<string>();
  const queue = BILLING_SURFACE_ENTRIES.map((entry) => join(BACKEND_SRC, entry)).filter((file) =>
    existsSync(file)
  );

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (visited.has(file)) continue;
    visited.add(file);

    const source = readFileSync(file, 'utf-8');
    for (const pattern of [API_ERROR_CODE, API_ERROR_CODE_MULTILINE, OBJECT_ERROR_CODE]) {
      for (const match of source.matchAll(pattern)) codes.add(match[1]);
    }
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const next = resolveRelativeImport(file, match[1]);
      if (next && next.startsWith(BACKEND_SRC)) queue.push(next);
    }
  }

  return [...codes].sort();
};

/** Codes the billing client invents for failures that never reach the backend. */
const clientBillingCodes = (): string[] => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      if (!/\.tsx?$/.test(entry.name) || /\.(test|spec)\.tsx?$/.test(entry.name)) return [];
      return [...readFileSync(full, 'utf-8').matchAll(CLIENT_API_CODE)].map((match) => match[1]);
    });
  return [...new Set(walk(BILLING_FEATURE_SRC))].sort();
};

const emittedCodes = [...new Set([...backendBillingCodes(), ...clientBillingCodes()])].sort();
const classifiedCodes = [
  ...Object.keys(BILLING_FAILURE_COPY),
  ...Object.keys(BACKEND_SENTENCE_CODES),
];

describe('billing failure code coverage', () => {
  it('walks far enough to see the codes the billing surface actually emits', () => {
    // Guards the check itself: a walk that stopped resolving imports would otherwise
    // make every check below pass over an ever-smaller set of codes.
    expect(emittedCodes).toContain('audit_log_unavailable');
    expect(emittedCodes).toContain('idempotency_store_unavailable');
    expect(emittedCodes).toContain('rate_limit_exceeded');
    expect(emittedCodes).toContain('internal_error');
    expect(emittedCodes).toContain('billing_backend_timeout');
    expect(emittedCodes.length).toBeGreaterThanOrEqual(30);
  });

  it('classifies every code the billing route can emit', () => {
    const unclassified = emittedCodes.filter(
      (code) => !(code in BILLING_FAILURE_COPY) && !(code in BACKEND_SENTENCE_CODES)
    );

    expect(unclassified).toEqual([]);
  });

  it('keeps no entry for a code nothing emits any more', () => {
    expect(classifiedCodes.filter((code) => !emittedCodes.includes(code))).toEqual([]);
  });

  it('warns in development when an unclassified code reaches a customer surface', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(billingFailureCopy('code_nobody_classified', 'Raw sentence.')).toBe('Raw sentence.');
      const said = warn.mock.calls.flat().join(' ');
      expect(said).toContain('code_nobody_classified');
      expect(said).toContain('billing.failure-copy.ts');

      warn.mockClear();
      billingFailureCopy('audit_log_unavailable', 'Raw sentence.');
      billingFailureCopy('invalid_request', 'Full name is required.');
      billingFailureCopy(null, 'Raw sentence.');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
