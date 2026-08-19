import { describe, expect, it, vi } from 'vitest';

import { WritingEvaluator } from './writing.evaluator';
import type { WritingMission, WritingSubmission } from './writing.types';

// Mock ScoringService
vi.mock('@/core/learning/scoring.service', () => ({
  ScoringService: {
    calculateScore: vi.fn(() => ({
      strengths: ['Good effort'],
      weaknesses: [],
      xp: 50,
      coins: 10,
      eloChange: 5,
      feedback: 'Solid writing.',
    })),
  },
}));

const createMockMission = (overrides?: Partial<WritingMission>): WritingMission => ({
  id: 'mission-1',
  title: 'Site Email',
  difficulty: 'intermediate',
  corrections: [
    { id: 'c1', type: 'grammar', text: 'Fix tense', original: 'was go', fix: 'went' },
    {
      id: 'c2',
      type: 'vocabulary',
      text: 'Use jargon',
      original: 'big machine',
      fix: 'heavy equipment',
    },
    { id: 'c3', type: 'style', text: 'Formal tone', original: 'hey guys', fix: 'Dear team' },
  ],
  ...overrides,
});

const createMockSubmission = (
  draft: string,
  overrides?: Partial<WritingSubmission>
): WritingSubmission => ({
  finalDraft: draft,
  timeSpentMinutes: 10,
  autoFixesUsed: 0,
  ...overrides,
});

describe('WritingEvaluator', () => {
  it('returns 100/100 when all corrections are fixed', () => {
    const mission = createMockMission();
    // Draft that doesn't contain any original errors
    const submission = createMockSubmission(
      'The project went well yesterday. The heavy equipment arrived. Dear team, please review.'
    );
    const result = WritingEvaluator.evaluate(mission, submission);
    expect(result.finalScore).toBe(100);
    expect(result.linguisticClarityScore).toBe(100);
    expect(result.jargonDensityScore).toBe(100);
    expect(result.professionalToneScore).toBe(100);
  });

  it('returns 0/100 when no corrections are fixed', () => {
    const mission = createMockMission();
    // Draft still contains all original errors
    const submission = createMockSubmission('The was go project. The big machine. Hey guys.');
    const result = WritingEvaluator.evaluate(mission, submission);
    expect(result.finalScore).toBe(0);
    expect(result.linguisticClarityScore).toBe(0);
    expect(result.jargonDensityScore).toBe(0);
    expect(result.professionalToneScore).toBe(0);
  });

  it('handles partial fixes correctly', () => {
    const mission = createMockMission();
    // Only grammar fixed, vocab and style still present
    const submission = createMockSubmission('The project went well. The big machine. Hey guys.');
    const result = WritingEvaluator.evaluate(mission, submission);
    expect(result.linguisticClarityScore).toBe(100); // grammar fixed
    expect(result.jargonDensityScore).toBe(0); // vocab not fixed
    expect(result.professionalToneScore).toBe(0); // style not fixed
  });

  it('returns 100 when no corrections needed (empty list)', () => {
    const mission = createMockMission({ corrections: [] });
    const submission = createMockSubmission('Perfect text.');
    const result = WritingEvaluator.evaluate(mission, submission);
    expect(result.finalScore).toBe(100);
  });

  it('calculates weighted final score correctly', () => {
    const mission = createMockMission({
      corrections: [
        { id: 'c1', type: 'grammar', text: '', original: 'bad', fix: 'good' },
        { id: 'c2', type: 'vocabulary', text: '', original: 'wrong', fix: 'right' },
      ],
    });
    // Both grammar and vocab fixed (neither 'bad' nor 'wrong' in draft)
    const submission = createMockSubmission('The text is excellent.');
    const result = WritingEvaluator.evaluate(mission, submission);
    // 100 * 0.4 + 100 * 0.3 + 100 * 0.3 (no style corrections) = 100
    expect(result.finalScore).toBe(100);
  });

  it('includes detailed corrections in result', () => {
    const mission = createMockMission();
    const submission = createMockSubmission('The project went well.');
    const result = WritingEvaluator.evaluate(mission, submission);
    expect(result.detailedCorrections).toHaveLength(3);
    // 'was go' not in draft → grammar fixed
    expect(result.detailedCorrections[0].isFixed).toBe(true);
    // 'big machine' not in draft → vocab fixed
    expect(result.detailedCorrections[1].isFixed).toBe(true);
    // 'hey guys' not in draft → style fixed
    expect(result.detailedCorrections[2].isFixed).toBe(true);
  });

  it('tracks XP and coins from scoring service', () => {
    const mission = createMockMission();
    const submission = createMockSubmission('Clean draft.');
    const result = WritingEvaluator.evaluate(mission, submission);
    expect(result.xpEarned).toBe(50);
    expect(result.coinsEarned).toBe(10);
    expect(result.eloChange).toBe(5);
  });
});
