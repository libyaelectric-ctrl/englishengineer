import { beforeEach, describe, expect, it } from 'vitest';
import {
  VocabularyBadgeService,
  type VocabularyStats,
} from './vocabulary.badges';

const makeStats = (
  overrides: Partial<VocabularyStats> = {}
): VocabularyStats => ({
  totalWordsLearned: 0,
  wordsMastered: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageAccuracy: 0,
  totalReviews: 0,
  perfectSessions: 0,
  leechWords: 0,
  fastestReviewMs: 0,
  ...overrides,
});

describe('VocabularyBadgeService', () => {
  beforeEach(() => {
    localStorage.clear();
    VocabularyBadgeService.reset();
  });

  it('unlocks first-word badge when learning 1 word', () => {
    const stats = makeStats({ totalWordsLearned: 1 });
    const results = VocabularyBadgeService.checkAndUnlock(stats);
    const firstWord = results.find((r) => r.badge.id === 'first-word');
    expect(firstWord?.newlyUnlocked).toBe(true);
    expect(firstWord?.badge.unlockedAt).toBeTruthy();
  });

  it('does not unlock first-word badge with 0 words', () => {
    const stats = makeStats({ totalWordsLearned: 0 });
    const results = VocabularyBadgeService.checkAndUnlock(stats);
    const firstWord = results.find((r) => r.badge.id === 'first-word');
    expect(firstWord?.newlyUnlocked).toBe(false);
    expect(firstWord?.badge.unlockedAt).toBeNull();
  });

  it('unlocks streak-3 badge with 3-day streak', () => {
    const stats = makeStats({ currentStreak: 3 });
    const results = VocabularyBadgeService.checkAndUnlock(stats);
    const streak = results.find((r) => r.badge.id === 'streak-3');
    expect(streak?.newlyUnlocked).toBe(true);
  });

  it('unlocks perfect-accuracy badge with 1 perfect session', () => {
    const stats = makeStats({ perfectSessions: 1 });
    const results = VocabularyBadgeService.checkAndUnlock(stats);
    const badge = results.find((r) => r.badge.id === 'perfect-accuracy');
    expect(badge?.newlyUnlocked).toBe(true);
  });

  it('does not unlock high-accuracy with low total reviews', () => {
    const stats = makeStats({ averageAccuracy: 95, totalReviews: 5 });
    const results = VocabularyBadgeService.checkAndUnlock(stats);
    const badge = results.find((r) => r.badge.id === 'high-accuracy');
    expect(badge?.newlyUnlocked).toBe(false);
  });

  it('unlocks high-accuracy with 90%+ accuracy and 10+ reviews', () => {
    const stats = makeStats({ averageAccuracy: 92, totalReviews: 15 });
    const results = VocabularyBadgeService.checkAndUnlock(stats);
    const badge = results.find((r) => r.badge.id === 'high-accuracy');
    expect(badge?.newlyUnlocked).toBe(true);
  });

  it('persists unlocked badges', () => {
    const stats = makeStats({ totalWordsLearned: 1 });
    VocabularyBadgeService.checkAndUnlock(stats);
    const count = VocabularyBadgeService.getUnlockedCount();
    expect(count).toBe(1);
  });

  it('returns correct total count', () => {
    expect(VocabularyBadgeService.getTotalCount()).toBe(14);
  });

  it('returns progress correctly', () => {
    const stats = makeStats({ totalWordsLearned: 1, currentStreak: 3 });
    const progress = VocabularyBadgeService.getProgress(stats);
    expect(progress.unlocked).toBe(2);
    expect(progress.total).toBe(14);
    expect(progress.nextBadge).toBeTruthy();
  });
});
