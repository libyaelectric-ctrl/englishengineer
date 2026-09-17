import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { billingFailureCopy } from './billing.failure-copy';

const AUDIT_COPY =
  'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.';
const IDEMPOTENCY_COPY =
  'A previous billing attempt is still being processed. Please wait a moment and try again.';
const ROUTE_NOT_FOUND_COPY =
  'This billing action is not available right now. Please refresh the page and try again.';
const ORIGIN_NOT_ALLOWED_COPY =
  'Billing could not be started from this address. Please open the app on its usual domain and try again.';

const RAW_AUDIT = 'Required audit logging is unavailable.';
const RAW_IDEMPOTENCY = 'Idempotency store unreachable.';
const UNREACHABLE =
  'Billing service is currently unreachable. Please check your connection or try again later.';

const SOURCE_FILES: string[] = (() => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      if (!/\.tsx?$/.test(entry.name)) return [];
      return /\.(test|spec)\.tsx?$/.test(entry.name) ? [] : [full];
    });
  return walk(join(process.cwd(), 'src'));
})();

const filesContaining = (needle: string): string[] =>
  SOURCE_FILES.filter((file) => readFileSync(file, 'utf-8').includes(needle)).map((file) =>
    file.replace(join(process.cwd(), 'src'), 'src').replace(/\\/g, '/')
  );

describe('billingFailureCopy', () => {
  it("replaces the backend's internal wording for the codes it knows", () => {
    expect(billingFailureCopy('audit_log_unavailable', RAW_AUDIT)).toBe(AUDIT_COPY);
    expect(billingFailureCopy('idempotency_store_unavailable', RAW_IDEMPOTENCY)).toBe(
      IDEMPOTENCY_COPY
    );
  });

  it('explains the two app-level refusals a billing request can be answered with', () => {
    expect(billingFailureCopy('route_not_found', 'Route not found.')).toBe(ROUTE_NOT_FOUND_COPY);
    expect(billingFailureCopy('origin_not_allowed', 'Origin not allowed by CORS.')).toBe(
      ORIGIN_NOT_ALLOWED_COPY
    );
  });

  it('passes the message through when the failure arrived without a code', () => {
    expect(billingFailureCopy(null, RAW_AUDIT)).toBe(RAW_AUDIT);
    expect(billingFailureCopy(undefined, RAW_AUDIT)).toBe(RAW_AUDIT);
  });

  it('never shows the backend sentence for a code it cannot classify', () => {
    // Measured on the real app: a billing POST with a malformed body is answered 400
    // `entity.parse.failed` / "Unexpected end of JSON input" — a runtime-synthesised code
    // the contract cannot list ahead of time.
    expect(billingFailureCopy('entity.parse.failed', 'Unexpected end of JSON input')).toBe(
      AUDIT_COPY
    );
    expect(billingFailureCopy('brand_new_code', RAW_AUDIT)).toBe(AUDIT_COPY);
    // A code the backend emits but the contract files under `other-routes` is just as
    // unknown here, so a wrong label changes the wording decision, not what a customer
    // reads.
    expect(billingFailureCopy('probe_mislabelled_code', 'Probe: an internal sentence.')).toBe(
      AUDIT_COPY
    );
  });

  it('adds no wording for the transport failures, whose sentences are already customer-facing', () => {
    expect(billingFailureCopy('billing_backend_unreachable', UNREACHABLE)).toBe(UNREACHABLE);
    expect(
      billingFailureCopy('billing_backend_timeout', 'Billing backend timed out after 30 seconds.')
    ).toBe('Billing backend timed out after 30 seconds.');
  });

  it('never returns nothing, so a failure cannot render as silence', () => {
    expect(billingFailureCopy('audit_log_unavailable', '')).toBe(AUDIT_COPY);
  });

  it('warns in development for a code outside the contract, and stays quiet for classified ones', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(billingFailureCopy('code_nobody_classified', 'Raw sentence.')).toBe(AUDIT_COPY);
      const said = warn.mock.calls.flat().join(' ');
      expect(said).toContain('code_nobody_classified');
      expect(said).toContain('billing.failure-copy.ts');

      warn.mockClear();
      billingFailureCopy('audit_log_unavailable', 'Raw sentence.');
      billingFailureCopy('invalid_request', 'Full name is required.');
      billingFailureCopy('billing_backend_timeout', 'Timed out.');
      billingFailureCopy(null, 'Raw sentence.');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('keeps the wording in exactly one file, so no surface can re-inline its own', () => {
    expect(filesContaining(AUDIT_COPY)).toEqual(['src/features/billing/billing.failure-copy.ts']);
    expect(filesContaining(IDEMPOTENCY_COPY)).toEqual([
      'src/features/billing/billing.failure-copy.ts',
    ]);
  });
});
