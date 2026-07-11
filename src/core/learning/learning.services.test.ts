// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createLearningState } from '@/test/fixtures';
import { ScoringService } from './scoring.service';
import { AchievementService } from './achievement.service';
import { Achievement } from './learning.types';

const achievement = (overrides: Partial<Achievement>): Achievement => ({
  id: 'ach',
  title: 'Achievement',
  description: 'Test achievement',
  criteriaType: 'first_mission',
  criteriaValue: 1,
  unlocked: false,
  unlockedAt: null,
  ...overrides,
});

describe('learning scoring and achievements', () => {
  it('bounds score between zero and one hundred', () => {
    expect(
      ScoringService.calculateScore({
        module: 'Reading',
        difficulty: 'Beginner',
        performanceRatio: 1.4,
      }).score
    ).toBe(100);

    expect(
      ScoringService.calculateScore({
        module: 'Reading',
        difficulty: 'Beginner',
        performanceRatio: -1,
      }).score
    ).toBe(0);
  });

  it('scales XP and coins by difficulty and performance', () => {
    const result = ScoringService.calculateScore({
      module: 'Writing',
      difficulty: 'Advanced',
      performanceRatio: 0.5,
    });

    expect(result.xp).toBe(60);
    expect(result.coins).toBe(15);
  });

  it('calculates negative ELO for very low score', () => {
    expect(
      ScoringService.calculateScore({
        module: 'Listening',
        difficulty: 'Beginner',
        performanceRatio: 0.25,
      }).eloChange
    ).toBeLessThan(0);
  });

  it('unlocks first mission achievement', () => {
    const result = AchievementService.checkAndUnlockAchievements(
      createLearningState({
        missions: [
          {
            id: 'm1',
            title: 'Mission',
            description: 'Mission',
            module: 'Reading',
            difficulty: 'Beginner',
            estimatedMinutes: 10,
            xpReward: 10,
            coinReward: 5,
            eloReward: 2,
            status: 'completed',
            completedAt: '2026-06-26T00:00:00.000Z',
          },
        ],
        achievements: [
          achievement({ criteriaType: 'first_mission', criteriaValue: 1 }),
        ],
      })
    );

    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.updatedAchievements[0].unlocked).toBe(true);
  });

  it('unlocks streak achievement when streak threshold is met', () => {
    const result = AchievementService.checkAndUnlockAchievements(
      createLearningState({
        streak: 7,
        achievements: [
          achievement({ criteriaType: 'streak', criteriaValue: 7 }),
        ],
      })
    );

    expect(result.newlyUnlocked[0].criteriaType).toBe('streak');
  });

  it('keeps already unlocked achievement unchanged', () => {
    const unlockedAt = '2026-06-20T00:00:00.000Z';
    const result = AchievementService.checkAndUnlockAchievements(
      createLearningState({
        achievements: [achievement({ unlocked: true, unlockedAt })],
      })
    );

    expect(result.newlyUnlocked).toHaveLength(0);
    expect(result.updatedAchievements[0].unlockedAt).toBe(unlockedAt);
  });
});
