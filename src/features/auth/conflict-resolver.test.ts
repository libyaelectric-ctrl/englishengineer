import { describe, expect, it, vi } from 'vitest';

import {
  type ConflictInfo,
  createTimestampResolver,
  resolveConflict,
  setConflictResolver,
} from './conflict-resolver';

describe('conflict-resolver', () => {
  it('defaults to remote resolution', () => {
    const conflict: ConflictInfo = {
      key: 'test-key',
      localValue: 'a',
      remoteValue: 'b',
      localTimestamp: '2026-01-01T00:00:00Z',
      remoteTimestamp: '2026-01-02T00:00:00Z',
    };
    expect(resolveConflict(conflict)).toBe('remote');
  });

  it('setConflictResolver overrides the default', () => {
    const custom = { resolve: () => 'local' as const };
    setConflictResolver(custom);

    const conflict: ConflictInfo = {
      key: 'test',
      localValue: 1,
      remoteValue: 2,
      localTimestamp: null,
      remoteTimestamp: null,
    };
    expect(resolveConflict(conflict)).toBe('local');

    // Restore default
    setConflictResolver({ resolve: () => 'remote' });
  });
});

describe('createTimestampResolver', () => {
  const resolver = createTimestampResolver();

  it('returns remote when local timestamp is missing', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: null,
        remoteValue: null,
        localTimestamp: null,
        remoteTimestamp: '2026-01-01T00:00:00Z',
      })
    ).toBe('remote');
  });

  it('returns local when remote timestamp is missing', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: null,
        remoteValue: null,
        localTimestamp: '2026-01-01T00:00:00Z',
        remoteTimestamp: null,
      })
    ).toBe('local');
  });

  it('returns local when local is newer', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: 'newer',
        remoteValue: 'older',
        localTimestamp: '2026-06-01T00:00:00Z',
        remoteTimestamp: '2026-01-01T00:00:00Z',
      })
    ).toBe('local');
  });

  it('returns remote when remote is newer', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: 'older',
        remoteValue: 'newer',
        localTimestamp: '2026-01-01T00:00:00Z',
        remoteTimestamp: '2026-06-01T00:00:00Z',
      })
    ).toBe('remote');
  });

  it('returns remote when timestamps are equal', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: 'a',
        remoteValue: 'b',
        localTimestamp: '2026-01-01T00:00:00Z',
        remoteTimestamp: '2026-01-01T00:00:00Z',
      })
    ).toBe('remote');
  });

  it('returns remote when local timestamp is invalid', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: null,
        remoteValue: null,
        localTimestamp: 'not-a-date',
        remoteTimestamp: '2026-01-01T00:00:00Z',
      })
    ).toBe('remote');
  });

  it('returns local when remote timestamp is invalid', () => {
    expect(
      resolver.resolve({
        key: 'k',
        localValue: null,
        remoteValue: null,
        localTimestamp: '2026-01-01T00:00:00Z',
        remoteTimestamp: 'not-a-date',
      })
    ).toBe('local');
  });
});
