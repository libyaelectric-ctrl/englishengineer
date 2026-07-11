// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  calculateEstimatedCefr,
  calculateImprovementVelocity,
  calculateSkillRadar,
  calculateStudyConsistency,
  calculateTrend,
} from './analytics.calculations';
import { createLearningState } from '@/test/fixtures';

describe('analytics calculations', () => {
  it('calculates upward trend when recent scores improve by at least five points', () => {
    expect(
      calculateTrend([
        {
          timestamp: '2026-06-20T00:00:00.000Z',
          durationMinutes: 10,
          score: 60,
          module: 'Reading',
        },
        {
          timestamp: '2026-06-21T00:00:00.000Z',
          durationMinutes: 10,
          score: 62,
          module: 'Reading',
        },
        {
          timestamp: '2026-06-22T00:00:00.000Z',
          durationMinutes: 10,
          score: 80,
          module: 'Reading',
        },
        {
          timestamp: '2026-06-23T00:00:00.000Z',
          durationMinutes: 10,
          score: 82,
          module: 'Reading',
        },
      ])
    ).toBe('up');
  });

  it('calculates downward trend when recent scores drop', () => {
    expect(
      calculateTrend([
        {
          timestamp: '2026-06-20T00:00:00.000Z',
          durationMinutes: 10,
          score: 88,
          module: 'Writing',
        },
        {
          timestamp: '2026-06-21T00:00:00.000Z',
          durationMinutes: 10,
          score: 86,
          module: 'Writing',
        },
        {
          timestamp: '2026-06-22T00:00:00.000Z',
          durationMinutes: 10,
          score: 70,
          module: 'Writing',
        },
        {
          timestamp: '2026-06-23T00:00:00.000Z',
          durationMinutes: 10,
          score: 68,
          module: 'Writing',
        },
      ])
    ).toBe('down');
  });

  it('keeps trend stable for small samples', () => {
    expect(
      calculateTrend([
        {
          timestamp: '2026-06-20T00:00:00.000Z',
          durationMinutes: 10,
          score: 88,
          module: 'Listening',
        },
      ])
    ).toBe('stable');
  });

  it('estimates higher CEFR for strong score, elo and completion profile', () => {
    const state = createLearningState({
      elo: 1500,
      missions: [
        {
          id: 'm1',
          title: 'A',
          description: 'A',
          module: 'Reading',
          difficulty: 'Advanced',
          estimatedMinutes: 10,
          xpReward: 50,
          coinReward: 10,
          eloReward: 10,
          status: 'completed',
          completedAt: '2026-06-20T00:00:00.000Z',
          score: 95,
        },
      ],
      studySessions: [
        {
          timestamp: '2026-06-20T00:00:00.000Z',
          durationMinutes: 10,
          score: 95,
          module: 'Reading',
        },
      ],
    });

    expect(calculateEstimatedCefr(state)).toBe('C1');
  });

  it('builds skill radar from existing learning sessions', () => {
    const radar = calculateSkillRadar(
      createLearningState({
        studySessions: [
          {
            timestamp: '2026-06-20T00:00:00.000Z',
            durationMinutes: 12,
            score: 80,
            module: 'Speaking',
          },
          {
            timestamp: '2026-06-21T00:00:00.000Z',
            durationMinutes: 8,
            score: 90,
            module: 'Speaking',
          },
        ],
      })
    );

    const speaking = radar.find((item) => item.module === 'Speaking');
    expect(speaking?.averageScore).toBe(85);
    expect(speaking?.totalMinutes).toBe(20);
  });

  it('calculates study consistency from active days', () => {
    expect(
      calculateStudyConsistency([
        { date: '1', sessions: 1, minutes: 10 },
        { date: '2', sessions: 0, minutes: 0 },
        { date: '3', sessions: 2, minutes: 20 },
        { date: '4', sessions: 0, minutes: 0 },
      ])
    ).toBe(50);
  });

  it('calculates improvement velocity from score history', () => {
    expect(
      calculateImprovementVelocity(
        createLearningState({
          scoreHistory: [
            { date: '1', score: 60, module: 'Reading' },
            { date: '2', score: 65, module: 'Reading' },
            { date: '3', score: 80, module: 'Reading' },
            { date: '4', score: 85, module: 'Reading' },
          ],
        })
      )
    ).toBe(17);
  });
});
