import { beforeEach, describe, expect, it } from 'vitest';
import { VocabularySyncService } from './vocabulary.sync';
import type { VocabularyMenuProgress } from './vocabulary.menu';

const makeProgress = (
  overrides: Partial<VocabularyMenuProgress> = {}
): VocabularyMenuProgress => ({
  correctReviews: 0,
  wrongReviews: 0,
  status: 'New',
  isWeak: false,
  isForgotten: false,
  isLeech: false,
  lastReviewed: '',
  nextReviewDate: '',
  ...overrides,
});

describe('VocabularySyncService', () => {
  beforeEach(() => {
    localStorage.clear();
    VocabularySyncService.clearSync();
  });

  describe('mergeProgress', () => {
    it('prefers remote when local has no data for a word', () => {
      const local = {};
      const remote = { w1: makeProgress({ correctReviews: 2 }) };
      const merged = VocabularySyncService.mergeProgress(local, remote);
      expect(merged.w1.correctReviews).toBe(2);
    });

    it('prefers local when remote has no data for a word', () => {
      const local = { w1: makeProgress({ correctReviews: 3 }) };
      const remote = {};
      const merged = VocabularySyncService.mergeProgress(local, remote);
      expect(merged.w1.correctReviews).toBe(3);
    });

    it('prefers side with more total reviews', () => {
      const local = { w1: makeProgress({ correctReviews: 2, wrongReviews: 1 }) };
      const remote = { w1: makeProgress({ correctReviews: 4, wrongReviews: 0 }) };
      const merged = VocabularySyncService.mergeProgress(local, remote);
      expect(merged.w1.correctReviews).toBe(4);
    });

    it('uses most recent lastReviewed when totals are equal', () => {
      const local = {
        w1: makeProgress({
          correctReviews: 2,
          wrongReviews: 1,
          lastReviewed: '2026-07-19T10:00:00Z',
        }),
      };
      const remote = {
        w1: makeProgress({
          correctReviews: 2,
          wrongReviews: 1,
          lastReviewed: '2026-07-20T10:00:00Z',
        }),
      };
      const merged = VocabularySyncService.mergeProgress(local, remote);
      expect(merged.w1.lastReviewed).toBe('2026-07-20T10:00:00Z');
    });
  });

  describe('detectConflicts', () => {
    it('detects conflicts when both sides have equal reviews but different timestamps', () => {
      const local = {
        w1: makeProgress({
          correctReviews: 2,
          wrongReviews: 1,
          lastReviewed: '2026-07-19T10:00:00Z',
        }),
      };
      const remote = {
        w1: makeProgress({
          correctReviews: 2,
          wrongReviews: 1,
          lastReviewed: '2026-07-20T10:00:00Z',
        }),
      };
      const conflicts = VocabularySyncService.detectConflicts(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].wordId).toBe('w1');
    });

    it('returns empty when no conflicts', () => {
      const local = { w1: makeProgress({ correctReviews: 3 }) };
      const remote = { w1: makeProgress({ correctReviews: 2 }) };
      const conflicts = VocabularySyncService.detectConflicts(local, remote);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('prepareSyncPayload / applySyncPayload', () => {
    it('round-trips state through sync', () => {
      const localState = {
        progress: { w1: makeProgress({ correctReviews: 3 }) },
        myVocabulary: [{ id: 'my_1' }],
      };
      const payload = VocabularySyncService.prepareSyncPayload(
        localState as never,
        'user-1'
      );
      expect(payload.userId).toBe('user-1');
      expect(payload.syncVersion).toBe(1);

      const applied = VocabularySyncService.applySyncPayload(payload, {
        progress: {},
        myVocabulary: [],
      });
      expect(applied.progress.w1.correctReviews).toBe(3);
    });
  });
});
