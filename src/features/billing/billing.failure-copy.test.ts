import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';

import {
  CLIENT_SENTENCE_CODE,
  billingFailureCopy,
  resolveBillingError,
} from './billing.failure-copy';

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

  it('answers a failure without a code with billing copy, not with its sentence', () => {
    // Measured on the real app: a 200 that is not the versioned envelope, a 200 or a 502
    // HTML body and a code-less error envelope all reach a surface with no code, and
    // each used to print its own sentence.
    expect(
      billingFailureCopy(null, 'Backend response does not match the versioned success envelope.')
    ).toBe(AUDIT_COPY);
    expect(billingFailureCopy(undefined, "Unexpected token '<' is not valid JSON")).toBe(
      AUDIT_COPY
    );
    expect(billingFailureCopy(null, 'API 502: ')).toBe(AUDIT_COPY);
    expect(billingFailureCopy(null, RAW_AUDIT)).toBe(AUDIT_COPY);
  });

  it('keeps a sentence the client itself wrote, under the code for that channel', () => {
    const demo = 'Demo profiles cannot make purchases. Create an account to subscribe.';
    expect(billingFailureCopy(CLIENT_SENTENCE_CODE, demo)).toBe(demo);
  });

  it('resolves a thrown failure from the error, so no surface re-derives the rule', () => {
    const coded = new AppError({
      code: ErrorCode.NETWORK,
      apiCode: 'audit_log_unavailable',
      message: RAW_AUDIT,
    });
    expect(resolveBillingError(coded)).toBe(AUDIT_COPY);
    // A thrower that carries no code — a plain Error, or anything that is not an Error.
    expect(resolveBillingError(new Error('API 502: '))).toBe(AUDIT_COPY);
    expect(resolveBillingError('not an error')).toBe(AUDIT_COPY);
    expect(resolveBillingError(coded)).not.toBe(RAW_AUDIT);
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
      billingFailureCopy(CLIENT_SENTENCE_CODE, 'Demo profiles cannot make purchases.');
      expect(warn).not.toHaveBeenCalled();

      // A missing code is the case that used to pass through in silence.
      warn.mockClear();
      expect(billingFailureCopy(null, 'API 502: ')).toBe(AUDIT_COPY);
      expect(warn.mock.calls.flat().join(' ')).toContain('without a code');
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
