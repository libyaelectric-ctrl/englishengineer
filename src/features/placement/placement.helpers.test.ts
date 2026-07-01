import { describe, expect, it } from 'vitest';
import { PLACEMENT_QUESTIONS } from './placement.data';
import { evaluatePlacement } from './placement.helpers';

describe('placement evaluation', () => {
  it('keeps an unanswered placement at A1 with limited confidence', () => {
    const result = evaluatePlacement(PLACEMENT_QUESTIONS, {});
    expect(result.recommendedBand).toBe('A1');
    expect(result.confidence).toBe('limited');
    expect(result.answeredCount).toBe(0);
  });

  it('maps complete correct evidence to C2 with strong confidence', () => {
    const answers = Object.fromEntries(
      PLACEMENT_QUESTIONS.map((question) => [
        question.id,
        question.correctIndex,
      ])
    );
    const result = evaluatePlacement(PLACEMENT_QUESTIONS, answers);
    expect(result.score).toBe(100);
    expect(result.recommendedBand).toBe('C2');
    expect(result.confidence).toBe('strong');
    expect(result.recommendedSkills).toEqual([
      'reading',
      'vocabulary',
      'grammar',
    ]);
  });

  it('does not claim Listening, Speaking or Writing evidence', () => {
    const result = evaluatePlacement(PLACEMENT_QUESTIONS, {
      placement_1: 0,
      placement_2: 0,
    });
    expect(result.recommendedSkills).not.toContain('listening');
    expect(result.recommendedSkills).not.toContain('speaking');
    expect(result.recommendedSkills).not.toContain('writing');
  });
});
