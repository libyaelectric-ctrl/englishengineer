import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { billingFailureCopy } from './billing.failure-copy';

const AUDIT_COPY =
  'Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes.';
const IDEMPOTENCY_COPY =
  'A previous billing attempt is still being processed. Please wait a moment and try again.';

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

  it('passes a message through untouched when the code is unrecognised or absent', () => {
    expect(billingFailureCopy('brand_new_code', RAW_AUDIT)).toBe(RAW_AUDIT);
    expect(billingFailureCopy(null, RAW_AUDIT)).toBe(RAW_AUDIT);
    expect(billingFailureCopy(undefined, RAW_AUDIT)).toBe(RAW_AUDIT);
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

  it('keeps the wording in exactly one file, so no surface can re-inline its own', () => {
    expect(filesContaining(AUDIT_COPY)).toEqual(['src/features/billing/billing.failure-copy.ts']);
    expect(filesContaining(IDEMPOTENCY_COPY)).toEqual([
      'src/features/billing/billing.failure-copy.ts',
    ]);
  });
});
