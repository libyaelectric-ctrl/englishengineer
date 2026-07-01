// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  clampSkillElo,
  getAdaptivePaceDecision,
  getCefrBandFromElo,
  getEloBandRange,
  getInitialUserLearningProfile,
  getProgressToNextCefrBand,
} from './profile.utils';

describe('skill ELO and CEFR utilities', () => {
  it('maps the minimum and maximum ELO values', () => {
    expect(getCefrBandFromElo(1000)).toBe('A1');
    expect(getCefrBandFromElo(5000)).toBe('C2+');
  });

  it('maps every approved CEFR boundary', () => {
    expect(getCefrBandFromElo(1332)).toBe('A1');
    expect(getCefrBandFromElo(1333)).toBe('A1+');
    expect(getCefrBandFromElo(2998)).toBe('B2');
    expect(getCefrBandFromElo(4663)).toBe('C2+');
    expect(getEloBandRange('B1')).toEqual({ min: 2332, max: 2664 });
  });

  it('clamps ELO to the approved 1000-5000 range', () => {
    expect(clampSkillElo(200)).toBe(1000);
    expect(clampSkillElo(8000)).toBe(5000);
  });

  it('calculates progress inside the current detailed band', () => {
    expect(getProgressToNextCefrBand(1000)).toBe(0);
    expect(getProgressToNextCefrBand(5000)).toBe(100);
  });

  it('starts all six independent skills at 1000 ELO and A1', () => {
    const profile = getInitialUserLearningProfile('demo', new Date(0));
    const skills = Object.values(profile.skills);
    expect(skills).toHaveLength(6);
    expect(skills.every((skill) => skill.elo === 1000)).toBe(true);
    expect(skills.every((skill) => skill.cefrBand === 'A1')).toBe(true);
    expect(profile.professionalTrack).toBe('electrical');
    expect(profile.electricalSubdomain).toBe('low-voltage');
  });

  it('keeps skill profile objects independent', () => {
    const profile = getInitialUserLearningProfile('demo', new Date(0));
    profile.skills.reading.elo = 3200;
    expect(profile.skills.reading.elo).toBe(3200);
    expect(profile.skills.speaking.elo).toBe(1000);
  });

  it('slows repeated low-accuracy mistakes and flags the mistake log', () => {
    expect(
      getAdaptivePaceDecision({
        accuracy: 52,
        mistakeType: 'preposition',
        repeatMistakeCount: 3,
        responseTimeSeconds: 120,
        skill: 'writing',
        currentElo: 1000,
      })
    ).toMatchObject({
      pace: 'slower',
      difficulty: 'easier',
      sendToMistakeLog: true,
    });
  });
});
