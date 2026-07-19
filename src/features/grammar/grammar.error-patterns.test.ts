import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorPatternAnalyzer } from './grammar.error-patterns';

describe('ErrorPatternAnalyzer', () => {
  beforeEach(() => {
    localStorage.clear();
    ErrorPatternAnalyzer.reset();
  });

  it('records errors and categorizes them', () => {
    ErrorPatternAnalyzer.recordError('rule-1', 'Past Tense');
    ErrorPatternAnalyzer.recordError('rule-1', 'Past Tense');
    ErrorPatternAnalyzer.recordError('rule-2', 'Article Usage');

    const summary = ErrorPatternAnalyzer.getSummary();
    expect(summary.totalErrors).toBe(3);
    expect(summary.byCategory.tense).toBe(2);
    expect(summary.byCategory.article).toBe(1);
  });

  it('identifies weakest category', () => {
    ErrorPatternAnalyzer.recordError('r1', 'Past Tense');
    ErrorPatternAnalyzer.recordError('r2', 'Present Perfect');
    ErrorPatternAnalyzer.recordError('r3', 'Article Usage');
    ErrorPatternAnalyzer.recordError('r4', 'Article Usage');
    ErrorPatternAnalyzer.recordError('r5', 'Article Usage');

    const summary = ErrorPatternAnalyzer.getSummary();
    expect(summary.weakestCategory).toBe('article');
  });

  it('provides recommendations for top categories', () => {
    ErrorPatternAnalyzer.recordError('r1', 'Past Tense');
    ErrorPatternAnalyzer.recordError('r2', 'Past Tense');
    ErrorPatternAnalyzer.recordError('r3', 'Preposition at');

    const summary = ErrorPatternAnalyzer.getSummary();
    expect(summary.recommendations.length).toBeGreaterThan(0);
    expect(summary.recommendations[0]).toContain('tense');
  });

  it('returns weak areas for pool', () => {
    for (let i = 0; i < 10; i++) {
      ErrorPatternAnalyzer.recordError(`r${i}`, 'Past Tense');
    }
    const weak = ErrorPatternAnalyzer.getWeakAreasForPool();
    expect(weak).toContain('tense');
  });

  it('resets patterns', () => {
    ErrorPatternAnalyzer.recordError('r1', 'Past Tense');
    ErrorPatternAnalyzer.reset();
    expect(ErrorPatternAnalyzer.getPatterns()).toEqual({});
  });
});
