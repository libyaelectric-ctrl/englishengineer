import { describe, expect, it } from 'vitest';
import { LearningState } from '@/core/learning';
import {
  buildLevelProfile,
  buildSequentialLevelPath,
  calculateSkillProgress,
  getLevelConfidence,
} from './level-system.helpers';
import { CEFR_LEVELS } from './level-system.types';

const learning = (sessionCount = 0): LearningState => ({
  missions: [],
  achievements: [],
  xp: 0,
  level: 1,
  coins: 0,
  elo: 1000,
  streak: 0,
  lastActivityDate: null,
  studySessions: Array.from({ length: sessionCount }, (_, index) => ({
    timestamp: new Date(2026, 0, index + 1).toISOString(),
    durationMinutes: 10,
    score: 80,
    module: 'Reading' as const,
  })),
  scoreHistory: [],
  xpHistory: [],
  eloHistory: [],
});

describe('sequential level system', () => {
  it('uses the required CEFR order', () => {
    expect(CEFR_LEVELS).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('starts every demo skill and overall profile at A1', () => {
    const profile = buildLevelProfile(learning(30), 'demo_engineer_42');
    expect(profile.overallLevel).toBe('A1');
    expect(profile.skills.every((skill) => skill.currentLevel === 'A1')).toBe(
      true
    );
    expect(profile.confidence).toBe('demo');
  });

  it('supports demo, estimated and calibrated confidence', () => {
    expect(getLevelConfidence(0, true)).toBe('demo');
    expect(getLevelConfidence(4, false)).toBe('estimated');
    expect(getLevelConfidence(10, false)).toBe('calibrated');
  });

  it('keeps C1 out of a B1 normal path', () => {
    const progress = {
      ...calculateSkillProgress('reading', learning(20), false),
      currentLevel: 'B1' as const,
    };
    const c1 = buildSequentialLevelPath(progress).find(
      (node) => node.level === 'C1'
    );
    expect(c1?.status).toBe('preview-only');
    expect(c1?.reason).toContain('Complete B2');
  });

  it('builds the same six-level path for every skill', () => {
    const profile = buildLevelProfile(learning(), 'real_user');
    profile.skills.forEach((skill) => {
      expect(buildSequentialLevelPath(skill).map((node) => node.level)).toEqual(
        CEFR_LEVELS
      );
    });
  });
});
// @vitest-environment node
