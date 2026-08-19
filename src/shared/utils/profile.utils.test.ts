import { describe, expect, it } from 'vitest';

import {
  LESSON_PATH_LENGTH,
  MAX_SKILL_ELO,
  MIN_SKILL_ELO,
  clampSkillElo,
  getAdaptivePaceDecision,
  getBaseCefrLevel,
  getCefrBandFromElo,
  getEloBandRange,
  getInitialSkillProfile,
  getNextCefrBand,
  getProgressToNextCefrBand,
  getSkillLessonNumber,
  getTaskBandMix,
  isSkillName,
} from './profile.utils';

describe('clampSkillElo', () => {
  it('clamps to MIN when below', () => {
    expect(clampSkillElo(0)).toBe(MIN_SKILL_ELO);
    expect(clampSkillElo(-500)).toBe(MIN_SKILL_ELO);
  });

  it('clamps to MAX when above', () => {
    expect(clampSkillElo(9999)).toBe(MAX_SKILL_ELO);
  });

  it('rounds and returns within range', () => {
    expect(clampSkillElo(2500.4)).toBe(2500);
    expect(clampSkillElo(2500.6)).toBe(2501);
  });
});

describe('getCefrBandFromElo', () => {
  it('returns A1 for minimum ELO', () => {
    expect(getCefrBandFromElo(MIN_SKILL_ELO)).toBe('A1');
  });

  it('returns C2+ for maximum ELO', () => {
    expect(getCefrBandFromElo(MAX_SKILL_ELO)).toBe('C2+');
  });

  it('returns correct band for mid-range ELO', () => {
    expect(getCefrBandFromElo(2500)).toBe('B1');
    expect(getCefrBandFromElo(3500)).toBe('B2+');
    expect(getCefrBandFromElo(4000)).toBe('C1+');
  });
});

describe('getEloBandRange', () => {
  it('returns correct range for A1', () => {
    const range = getEloBandRange('A1');
    expect(range.min).toBe(1000);
    expect(range.max).toBe(1332);
  });

  it('returns correct range for C2', () => {
    const range = getEloBandRange('C2');
    expect(range.min).toBe(4330);
    expect(range.max).toBe(4662);
  });
});

describe('getBaseCefrLevel', () => {
  it('strips + suffix', () => {
    expect(getBaseCefrLevel('B1+')).toBe('B1');
    expect(getBaseCefrLevel('A2')).toBe('A2');
    expect(getBaseCefrLevel('C1+')).toBe('C1');
  });
});

describe('getNextCefrBand', () => {
  it('returns next band in sequence', () => {
    expect(getNextCefrBand('A1')).toBe('A1+');
    expect(getNextCefrBand('B1')).toBe('B1+');
    expect(getNextCefrBand('C2')).toBe('C2+');
  });

  it('stays at C2+ when already at max', () => {
    expect(getNextCefrBand('C2+')).toBe('C2+');
  });
});

describe('getTaskBandMix', () => {
  it('returns 75% current + 25% next', () => {
    const mix = getTaskBandMix('B1');
    expect(mix).toHaveLength(2);
    expect(mix[0]).toEqual({ band: 'B1', share: 0.75 });
    expect(mix[1]).toEqual({ band: 'B1+', share: 0.25 });
  });
});

describe('getProgressToNextCefrBand', () => {
  it('returns 0 at band minimum', () => {
    expect(getProgressToNextCefrBand(1000)).toBe(0);
  });

  it('returns 100 at MAX ELO', () => {
    expect(getProgressToNextCefrBand(MAX_SKILL_ELO)).toBe(100);
  });

  it('returns positive value for mid-band ELO', () => {
    const progress = getProgressToNextCefrBand(2500);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });
});

describe('isSkillName', () => {
  it('returns true for valid skill names', () => {
    expect(isSkillName('reading')).toBe(true);
    expect(isSkillName('writing')).toBe(true);
    expect(isSkillName('speaking')).toBe(true);
    expect(isSkillName('listening')).toBe(true);
    expect(isSkillName('vocabulary')).toBe(true);
    expect(isSkillName('grammar')).toBe(true);
  });

  it('returns false for invalid skill names', () => {
    expect(isSkillName('invalid')).toBe(false);
    expect(isSkillName('math')).toBe(false);
    expect(isSkillName('')).toBe(false);
  });
});

describe('getSkillLessonNumber', () => {
  it('returns 1 for zero completed tasks', () => {
    expect(getSkillLessonNumber(0)).toBe(1);
  });

  it('increments by 1', () => {
    expect(getSkillLessonNumber(5)).toBe(6);
  });

  it('caps at LESSON_PATH_LENGTH', () => {
    expect(getSkillLessonNumber(100)).toBe(LESSON_PATH_LENGTH);
  });
});

describe('getInitialSkillProfile', () => {
  it('creates profile with correct defaults', () => {
    const profile = getInitialSkillProfile('reading');
    expect(profile.skill).toBe('reading');
    expect(profile.elo).toBe(MIN_SKILL_ELO);
    expect(profile.cefrBand).toBe('A1');
    expect(profile.progressToNextBand).toBe(0);
    expect(profile.completedTasks).toBe(0);
    expect(profile.accuracy).toBe(0);
  });
});

describe('getAdaptivePaceDecision', () => {
  it('returns faster pace for high accuracy', () => {
    const decision = getAdaptivePaceDecision({
      skill: 'reading',
      accuracy: 90,
      responseTimeSeconds: 60,
      repeatMistakeCount: 0,
    });
    expect(decision.pace).toBe('faster');
    expect(decision.difficulty).toBe('slightly-harder');
  });

  it('returns slower pace for low accuracy', () => {
    const decision = getAdaptivePaceDecision({
      skill: 'grammar',
      accuracy: 40,
      responseTimeSeconds: 120,
      repeatMistakeCount: 1,
      mistakeType: 'tense',
    });
    expect(decision.pace).toBe('slower');
    expect(decision.difficulty).toBe('easier');
  });

  it('returns maintain pace for medium accuracy', () => {
    const decision = getAdaptivePaceDecision({
      skill: 'vocabulary',
      accuracy: 70,
      responseTimeSeconds: 60,
      repeatMistakeCount: 2,
    });
    expect(decision.pace).toBe('maintain');
  });

  it('sets sendToMistakeLog when repeatMistakeCount >= 3', () => {
    const decision = getAdaptivePaceDecision({
      skill: 'writing',
      accuracy: 90,
      responseTimeSeconds: 60,
      repeatMistakeCount: 3,
    });
    expect(decision.sendToMistakeLog).toBe(true);
  });
});
