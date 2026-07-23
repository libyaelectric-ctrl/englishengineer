import { act, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from '@/shared/storage';
import { CloudSyncStatusPanel } from './CloudSyncStatus';
import {
  CloudSyncService,
  applyCloudSnapshotLocally,
  mergeArrays,
  mergeJsonValues,
  mergeSnapshots,
} from './cloud-sync.service';
import {
  setConflictResolver,
  createTimestampResolver,
} from './conflict-resolver';
import { CloudProgressSnapshot } from './cloud-sync.types';

const createSnapshot = (
  data: Partial<CloudProgressSnapshot['data']>
): CloudProgressSnapshot => ({
  schemaVersion: 1,
  userId: 'user_1',
  capturedAt: '2026-06-26T00:00:00.000Z',
  source: 'local-first',
  data: {
    learning: null,
    readingHistory: null,
    writingHistory: null,
    listeningHistory: null,
    speakingHistory: null,
    vocabularyReview: null,
    grammarReview: null,
    mistakeLog: null,
    reviewQueue: null,
    learningProfile: null,
    aiCoach: null,
    gamification: null,
    userPreferences: null,
    workspaces: null,
    ...data,
  },
});

describe('cloud sync merge helpers', () => {
  beforeEach(() => localStorage.clear());

  it('deduplicates arrays while preserving remote then local order', () => {
    expect(mergeArrays(['a', 'b'], ['b', 'c'])).toEqual(['b', 'c', 'a']);
  });

  it('keeps maximum numeric progress value', () => {
    expect(mergeJsonValues(120, 90)).toBe(120);
    expect(mergeJsonValues(10, 60)).toBe(60);
  });

  it('recursively merges objects', () => {
    expect(
      mergeJsonValues(
        { xp: 120, nested: { streak: 3 } },
        { xp: 80, nested: { coins: 50 } }
      )
    ).toEqual({ xp: 120, nested: { coins: 50, streak: 3 } });
  });

  it('prefers local strings during conflict', () => {
    expect(mergeJsonValues('local profile', 'remote profile')).toBe(
      'local profile'
    );
  });

  it('returns remote value when local is null', () => {
    expect(mergeJsonValues(null, 'remote')).toBe('remote');
  });

  it('merges snapshots without duplicate achievements payload', () => {
    const local = createSnapshot({
      learning: { xp: 120, achievements: ['first'] },
      vocabularyReview: ['term-a'],
      aiCoach: null,
      gamification: null,
      userPreferences: 'local',
    });
    const remote = createSnapshot({
      learning: { xp: 80, achievements: ['first', 'remote'] },
      vocabularyReview: ['term-b'],
      aiCoach: null,
      gamification: null,
      userPreferences: 'remote',
    });

    const merged = mergeSnapshots(local, remote, 'user_2');
    expect(Object.keys(merged.data)).not.toContain('achievements');
    expect(merged.userId).toBe('user_2');
    expect(merged.data.learning).toEqual({
      xp: 120,
      achievements: ['first', 'remote'],
    });
  });

  it('restores merged cloud owners into their existing local stores', () => {
    const snapshot = createSnapshot({
      learning: { xp: 240 },
      grammarReview: { rule_a: { repetitions: 2 } },
      vocabularyReview: {
        EngVox_vocabulary_memory: { records: { term_a: { streak: 3 } } },
        EngVox_vocabulary_menu: { activeTab: 'Learning' },
      },
      speakingHistory: { history: [{ missionId: 'speak_1' }] },
      writingHistory: { history: [{ missionId: 'write_1' }] },
      mistakeLog: { mistakeLog: [{ id: 'mistake_1' }] },
      reviewQueue: [{ id: 'review_1' }],
      learningProfile: { userId: 'user_2', skills: {} },
    });

    applyCloudSnapshotLocally(snapshot, 'user_2');

    expect(storage.get('learning_state')).toEqual({ xp: 240 });
    expect(storage.get('EngVox_grammar_progress')).toEqual({
      rule_a: { repetitions: 2 },
    });
    expect(storage.get('EngVox_vocabulary_menu')).toEqual({
      activeTab: 'Learning',
    });
    expect(storage.get('EngVox_speaking_state')).toEqual({
      history: [{ missionId: 'speak_1' }],
    });
    expect(storage.get('learning_profile_user_2')).toEqual({
      userId: 'user_2',
      skills: {},
    });
  });
});

describe('CloudSyncStatusPanel', () => {
  beforeEach(() => localStorage.clear());

  it('labels demo and local authentication as local only', () => {
    render(createElement(CloudSyncStatusPanel, { providerMode: 'local' }));

    expect(screen.getByText('Local only')).toBeVisible();
    expect(screen.getByText(/stays on this device/i)).toBeVisible();
  });

  it('shows queued status for authenticated cloud progress', async () => {
    render(createElement(CloudSyncStatusPanel, { providerMode: 'supabase' }));

    await act(() => CloudSyncService.queueSync('manual-sync', 'user_1'));

    expect(screen.getByText('Sync queued')).toBeVisible();
    expect(screen.getByText(/queued for cloud synchronization/i)).toBeVisible();
  });
});

describe('timestamp-based merge', () => {
  beforeEach(() => {
    localStorage.clear();
    setConflictResolver(createTimestampResolver());
  });

  it('keeps local data when remote is null', () => {
    const local = { xp: 100, _lastUpdated: '2026-07-21T12:00:00.000Z' };
    const result = mergeJsonValues(local, null);
    expect(result).toEqual(local);
  });

  it('uses remote when local is null', () => {
    const remote = { xp: 200, _lastUpdated: '2026-07-21T12:00:00.000Z' };
    const result = mergeJsonValues(null, remote);
    expect(result).toEqual(remote);
  });

  it('prefers local when local timestamp is newer', () => {
    const local = { xp: 100, _lastUpdated: '2026-07-21T12:00:00.000Z' };
    const remote = { xp: 200, _lastUpdated: '2026-07-21T11:00:00.000Z' };
    const result = mergeJsonValues(local, remote);
    expect(result).toEqual(local);
  });

  it('prefers remote when remote timestamp is newer', () => {
    const local = { xp: 100, _lastUpdated: '2026-07-21T11:00:00.000Z' };
    const remote = { xp: 200, _lastUpdated: '2026-07-21T12:00:00.000Z' };
    const result = mergeJsonValues(local, remote);
    expect(result).toEqual(remote);
  });

  it('prefers remote when timestamps are equal', () => {
    const ts = '2026-07-21T12:00:00.000Z';
    const local = { xp: 100, _lastUpdated: ts };
    const remote = { xp: 200, _lastUpdated: ts };
    const result = mergeJsonValues(local, remote);
    expect(result).toEqual(remote);
  });

  it('conflict resolver is called during timestamp merge', () => {
    let resolverCalled = false;
    setConflictResolver({
      resolve: () => {
        resolverCalled = true;
        return 'local';
      },
    });

    const local = { xp: 100, _lastUpdated: '2026-07-21T12:00:00.000Z' };
    const remote = { xp: 200, _lastUpdated: '2026-07-21T11:00:00.000Z' };
    mergeJsonValues(local, remote);

    expect(resolverCalled).toBe(true);
    setConflictResolver(createTimestampResolver());
  });
});
