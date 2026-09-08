import { afterEach, describe, expect, it, vi } from 'vitest';

import { IdService } from './id.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('IdService', () => {
  it('creates ID with prefix', () => {
    const id = IdService.createId('usr');
    expect(id).toMatch(/^usr_/);
    expect(id.length).toBeGreaterThan(4);
  });

  it('creates ID without prefix', () => {
    const id = IdService.createId();
    expect(id).toMatch(/^[a-z0-9-]+$/);
    expect(id.length).toBeGreaterThanOrEqual(10);
  });

  it('creates unique IDs', () => {
    const id1 = IdService.createId();
    const id2 = IdService.createId();
    expect(id1).not.toBe(id2);
  });

  it('uses getRandomValues when randomUUID is unavailable', () => {
    let next = 0;
    vi.stubGlobal('crypto', {
      getRandomValues: (bytes: Uint8Array) => {
        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = next++;
        }
        return bytes;
      },
    });

    const id = IdService.createId('fallback');
    expect(id).toMatch(/^fallback_[a-z0-9]+-000102030405-06070809$/);
  });

  it('fails closed when secure randomness is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => IdService.createId()).toThrow('Secure random number generation is unavailable');
  });

  it('validates valid IDs', () => {
    expect(IdService.isValidId('usr_1234567890')).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(IdService.isValidId('')).toBe(false);
    expect(IdService.isValidId('   ')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(IdService.isValidId(null)).toBe(false);
    expect(IdService.isValidId(123)).toBe(false);
  });
});
