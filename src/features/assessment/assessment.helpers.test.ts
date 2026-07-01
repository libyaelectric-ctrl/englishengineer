import { describe, expect, it } from 'vitest';
import { LearningState } from '@/core/learning/learning.types';
import {
  getAssessmentConfidence,
  getDataStatus,
  mapScoreToCefr,
  mapScoreToEngineerElo,
} from './assessment.helpers';
import { AssessmentService } from './assessment.service';

const createState = (
  overrides: Partial<LearningState> = {}
): LearningState => ({
  missions: [],
  achievements: [],
  xp: 0,
  level: 1,
  coins: 0,
  elo: 1200,
  streak: 0,
  lastActivityDate: null,
  studySessions: [],
  scoreHistory: [],
  xpHistory: [],
  eloHistory: [],
  ...overrides,
});

describe('assessment helpers', () => {
  it('maps local engineering scores to CEFR bands', () => {
    expect(mapScoreToCefr(null)).toBeNull();
    expect(mapScoreToCefr(20)).toBe('A1');
    expect(mapScoreToCefr(40)).toBe('A2');
    expect(mapScoreToCefr(46)).toBe('B1-');
    expect(mapScoreToCefr(52)).toBe('B1');
    expect(mapScoreToCefr(58)).toBe('B1+');
    expect(mapScoreToCefr(63)).toBe('B2-');
    expect(mapScoreToCefr(68)).toBe('B2');
    expect(mapScoreToCefr(73)).toBe('B2+');
    expect(mapScoreToCefr(78)).toBe('C1-');
    expect(mapScoreToCefr(84)).toBe('C1');
    expect(mapScoreToCefr(90)).toBe('C1+');
    expect(mapScoreToCefr(95)).toBe('C2');
  });

  it('maps assessment score to a bounded Engineer ELO estimate without replacing existing ELO', () => {
    expect(mapScoreToEngineerElo(null, 1200)).toBeNull();
    expect(mapScoreToEngineerElo(70, 1200)).toBe(1200);
    expect(mapScoreToEngineerElo(90, 1200)).toBe(1320);
    expect(mapScoreToEngineerElo(100, 2990)).toBe(3000);
    expect(mapScoreToEngineerElo(0, 820)).toBe(800);
  });

  it('calculates confidence from evidence count and module coverage', () => {
    expect(getAssessmentConfidence([])).toMatchObject({ score: 0 });
    expect(
      getAssessmentConfidence([
        { module: 'Writing', score: 70, durationMinutes: 10 },
      ]).score
    ).toBe(18);
    expect(
      getAssessmentConfidence([
        { module: 'Writing', score: 70, durationMinutes: 10 },
        { module: 'Reading', score: 75, durationMinutes: 10 },
        { module: 'Listening', score: 80, durationMinutes: 10 },
        { module: 'Speaking', score: 82, durationMinutes: 10 },
        { module: 'Vocabulary', score: 78, durationMinutes: 10 },
      ]).score
    ).toBe(90);
  });

  it('classifies assessment data sufficiency from real source count', () => {
    expect(getDataStatus([])).toBe('insufficient');
    expect(
      getDataStatus([
        { module: 'Writing', score: 70, durationMinutes: 10 },
        { module: 'Reading', score: 75, durationMinutes: 10 },
      ])
    ).toBe('limited');
    expect(
      getDataStatus([
        { module: 'Writing', score: 70, durationMinutes: 10 },
        { module: 'Reading', score: 75, durationMinutes: 10 },
        { module: 'Listening', score: 80, durationMinutes: 10 },
        { module: 'Speaking', score: 82, durationMinutes: 10 },
        { module: 'Vocabulary', score: 78, durationMinutes: 10 },
      ])
    ).toBe('sufficient');
  });
});

describe('AssessmentService', () => {
  it('returns a clear insufficient-data profile without invented scores', () => {
    const profile = AssessmentService.getProfile(createState());

    expect(profile.hasEnoughData).toBe(false);
    expect(profile.dataStatus).toBe('insufficient');
    expect(profile.overallScore).toBeNull();
    expect(profile.engineerCefr).toBeNull();
    expect(profile.trustLabel).toBe('Not enough assessment data yet');
    expect(profile.confidenceScore).toBe(0);
    expect(profile.certificateDisclaimer).toContain('not an official CEFR');
  });

  it('aggregates existing learning sessions into a professional assessment profile', () => {
    const profile = AssessmentService.getProfile(
      createState({
        elo: 1360,
        studySessions: [
          {
            module: 'Writing',
            score: 84,
            durationMinutes: 18,
            timestamp: '2026-06-20',
          },
          {
            module: 'Reading',
            score: 78,
            durationMinutes: 14,
            timestamp: '2026-06-21',
          },
          {
            module: 'Listening',
            score: 74,
            durationMinutes: 12,
            timestamp: '2026-06-22',
          },
          {
            module: 'Speaking',
            score: 82,
            durationMinutes: 16,
            timestamp: '2026-06-23',
          },
          {
            module: 'Vocabulary',
            score: 88,
            durationMinutes: 10,
            timestamp: '2026-06-24',
          },
        ],
      })
    );

    expect(profile.hasEnoughData).toBe(true);
    expect(profile.dataStatus).toBe('sufficient');
    expect(profile.overallScore).not.toBeNull();
    expect(profile.engineerCefr).not.toBeNull();
    expect(profile.engineerElo).toBe(1360);
    expect(profile.dimensionScores).toHaveLength(17);
    expect(profile.strongestDimensions.length).toBeGreaterThan(0);
    expect(profile.weakestDimensions.length).toBeGreaterThan(0);
    expect(profile.recentHistory).toHaveLength(5);
    expect(profile.confidenceScore).toBeGreaterThanOrEqual(80);
  });

  it('wraps an existing module score without changing the base score payload', () => {
    const baseScore = {
      score: 86,
      xp: 40,
      coins: 10,
      eloChange: 8,
      strengths: ['Clear explanation'],
      weaknesses: ['More concise wording needed'],
      feedback: 'Good professional response.',
    };

    const wrapped = AssessmentService.wrapScoreResult(
      'Writing',
      baseScore,
      createState({ elo: 1250 })
    );

    expect(wrapped.baseScore).toBe(baseScore);
    expect(wrapped.assessment.activityModule).toBe('Writing');
    expect(wrapped.assessment.overallScore).toBe(86);
    expect(wrapped.assessment.cefrEstimate).toBe('C1');
    expect(wrapped.assessment.trustLabel).toBe('Wrapped existing module score');
    expect(wrapped.assessment.confidenceExplanation).toContain('limited');
  });
});
// @vitest-environment node
