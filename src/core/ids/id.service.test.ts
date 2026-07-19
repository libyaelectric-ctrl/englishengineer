import { describe, it, expect } from 'vitest';
import { IdService } from './id.service';

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
