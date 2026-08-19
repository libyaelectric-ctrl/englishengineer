import { describe, expect, it } from 'vitest';

import type { LearningState } from '@/core/learning/learning.types';

import type { VocabularySummary } from '@/shared/types/vocabulary.types';

import {
  getNextRecommendedStudy,
  getRecentAchievements,
  getRecentSessions,
  summarizeAnalyticsForDisplay,
} from './analytics.helpers';

const createMockState = (overrides?: Partial<LearningState>): LearningState => ({
  missions: [],
  studySessions: [],
  achievements: [],
  progress: {
    totalStudyTimeMinutes: 0,
    streak: 0,
    lastStudyDate: null,
  },
  vocabulary: {
    totalTerms: 0,
    masteredTerms: 0,
    reviewDue: 0,
  },
  ...overrides,
});

const createMockVocabSummary = (overrides?: Partial<VocabularySummary>): VocabularySummary => ({
  totalTerms: 100,
  masteredTerms: 50,
  todaysReviews: 0,
  ...overrides,
});

describe('getRecentSessions', () => {
  it('returns empty array when no sessions exist', () => {
    const state = createMockState();
    expect(getRecentSessions(state)).toEqual([]);
  });

  it('returns most recent sessions sorted by timestamp', () => {
    const state = createMockState({
      studySessions: [
        { id: '1', module: 'vocabulary', timestamp: '2026-08-19T10:00:00Z', score: 80 },
        { id: '2', module: 'grammar', timestamp: '2026-08-19T12:00:00Z', score: 90 },
        { id: '3', module: 'reading', timestamp: '2026-08-19T08:00:00Z', score: 70 },
      ] as any,
    });
    const sessions = getRecentSessions(state);
    expect(sessions).toHaveLength(3);
    expect(sessions[0].id).toBe('2'); // most recent
    expect(sessions[2].id).toBe('3'); // oldest
  });

  it('respects limit parameter', () => {
    const state = createMockState({
      studySessions: [
        { id: '1', module: 'vocabulary', timestamp: '2026-08-19T10:00:00Z', score: 80 },
        { id: '2', module: 'grammar', timestamp: '2026-08-19T12:00:00Z', score: 90 },
        { id: '3', module: 'reading', timestamp: '2026-08-19T08:00:00Z', score: 70 },
      ] as any,
    });
    const sessions = getRecentSessions(state, 2);
    expect(sessions).toHaveLength(2);
  });
});

describe('getRecentAchievements', () => {
  it('returns only unlocked achievements', () => {
    const state = createMockState({
      achievements: [
        { id: 'a1', title: 'First Login', unlocked: true, unlockedAt: '2026-08-19T10:00:00Z' },
        { id: 'a2', title: 'Locked Badge', unlocked: false, unlockedAt: null },
        { id: 'a3', title: 'Vocab Master', unlocked: true, unlockedAt: '2026-08-19T12:00:00Z' },
      ] as any,
    });
    const achievements = getRecentAchievements(state);
    expect(achievements).toHaveLength(2);
    expect(achievements.map((a) => a.id)).toContain('a1');
    expect(achievements.map((a) => a.id)).toContain('a3');
    expect(achievements.map((a) => a.id)).not.toContain('a2');
  });

  it('sorts by most recent unlock', () => {
    const state = createMockState({
      achievements: [
        { id: 'a1', title: 'First', unlocked: true, unlockedAt: '2026-08-19T08:00:00Z' },
        { id: 'a2', title: 'Second', unlocked: true, unlockedAt: '2026-08-19T12:00:00Z' },
      ] as any,
    });
    const achievements = getRecentAchievements(state);
    expect(achievements[0].id).toBe('a2');
  });

  it('returns empty array when no achievements unlocked', () => {
    const state = createMockState({
      achievements: [{ id: 'a1', title: 'Locked', unlocked: false, unlockedAt: null }] as any,
    });
    expect(getRecentAchievements(state)).toEqual([]);
  });
});

describe('getNextRecommendedStudy', () => {
  it('recommends vocabulary when reviews are due', () => {
    const state = createMockState();
    const vocab = createMockVocabSummary({ todaysReviews: 5 });
    const result = getNextRecommendedStudy(state, [], vocab);
    expect(result.module).toBe('Vocabulary');
    expect(result.reason).toContain('5');
  });

  it('recommends weak skill when no vocab reviews due', () => {
    const state = createMockState({
      missions: [
        { id: 'm1', module: 'grammar', status: 'active', title: 'Grammar Practice' },
      ] as any,
    });
    const vocab = createMockVocabSummary({ todaysReviews: 0 });
    const result = getNextRecommendedStudy(state, ['grammar', 'reading'], vocab);
    expect(result.module).toBe('grammar');
  });

  it('falls back to available mission when no weak skills', () => {
    const state = createMockState({
      missions: [
        { id: 'm1', module: 'reading', status: 'active', title: 'Reading Practice' },
      ] as any,
    });
    const vocab = createMockVocabSummary({ todaysReviews: 0 });
    const result = getNextRecommendedStudy(state, ['None'], vocab);
    expect(result.module).toBe('reading');
  });

  it('returns balanced review when no missions available', () => {
    const state = createMockState({ missions: [] });
    const vocab = createMockVocabSummary({ todaysReviews: 0 });
    const result = getNextRecommendedStudy(state, ['None'], vocab);
    expect(result.module).toBe('Reading');
    expect(result.title).toBe('Balanced review session');
  });
});

describe('summarizeAnalyticsForDisplay', () => {
  it('returns formatted summary strings', () => {
    const state = createMockState({
      progress: {
        totalStudyTimeMinutes: 120,
        streak: 5,
        lastStudyDate: '2026-08-19',
      },
    });
    const summary = summarizeAnalyticsForDisplay(state);
    expect(summary).toHaveLength(4);
    expect(summary.some((s) => s.includes('study minutes'))).toBe(true);
    expect(summary.some((s) => s.includes('streak'))).toBe(true);
  });
});
