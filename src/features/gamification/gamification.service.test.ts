// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createLearningState } from '@/test/fixtures';
import { GamificationService } from './gamification.service';

describe('gamification service bonus calculations', () => {
  it('applies streak XP multiplier for three day streak', () => {
    const summary = GamificationService.getSummary(
      createLearningState({ streak: 3 }),
      {
        rewardHistory: [],
        claimedDailyLoginDate: null,
        challengeProgress: {},
      }
    );

    expect(summary.bonusSummary.xpMultiplier).toBe(1.1);
  });

  it('applies perfect session bonus per perfect score', () => {
    const summary = GamificationService.getSummary(
      createLearningState({
        studySessions: [
          {
            timestamp: '2026-06-26T00:00:00.000Z',
            durationMinutes: 10,
            score: 100,
            module: 'Reading',
          },
          {
            timestamp: '2026-06-26T00:00:00.000Z',
            durationMinutes: 10,
            score: 90,
            module: 'Writing',
          },
        ],
      }),
      {
        rewardHistory: [],
        claimedDailyLoginDate: null,
        challengeProgress: {},
      }
    );

    expect(summary.bonusSummary.perfectSessionBonus).toBeGreaterThan(0);
  });
});
