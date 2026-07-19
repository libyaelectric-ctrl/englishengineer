import { describe, it, expect } from 'vitest';
import { ok, fail, isOk, isFail, unwrapOr } from './result.helpers';

describe('Result type', () => {
  it('creates ok result', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(isFail(result)).toBe(false);
    expect(result.value).toBe(42);
  });

  it('creates fail result', () => {
    const result = fail('something went wrong');
    expect(isOk(result)).toBe(false);
    expect(isFail(result)).toBe(true);
    expect(result.error).toBe('something went wrong');
  });

  it('unwrapOr returns default for fail', () => {
    const result = fail('fail');
    expect(unwrapOr(result, 0)).toBe(0);
  });

  it('unwrapOr returns value for ok', () => {
    const result = ok(42);
    expect(unwrapOr(result, 0)).toBe(42);
  });
});
