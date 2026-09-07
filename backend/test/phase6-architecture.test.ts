import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { aggregateByPromptCategory } from '../src/utils/stats.js';

describe('phase 6 architecture contracts', () => {
  it('aggregates typed prompt scores and ignores invalid numeric values', () => {
    const submissions = [
      { promptId: 'a', score: 80, status: 'graded' as const },
      { promptId: 'a', score: 100, status: 'graded' as const },
      { promptId: 'b', score: Number.NaN, status: 'graded' as const },
    ];
    const result = aggregateByPromptCategory(
      submissions,
      [
        { id: 'a', category: 'technical' },
        { id: 'b', category: 'professional' },
      ],
      'score'
    );
    expect(result).toEqual({ technical: { count: 2, avgScore: 90 } });
  });

  it('keeps writing statistics free of the former unknown-array cast', async () => {
    const source = await readFile(
      new URL('../src/writing-routes.ts', import.meta.url),
      'utf8'
    );
    expect(source).toContain("aggregateByPromptCategory(submissions, WRITING_PROMPTS, 'score')");
    expect(source).not.toContain('submissions as unknown as Array');
  });

  it('defines a versioned, rollback-safe learning split', async () => {
    const plan = await readFile(
      new URL('../../docs/REFACTORING-PLAN.md', import.meta.url),
      'utf8'
    );
    expect(plan).toContain('Mission');
    expect(plan).toContain('Progress');
    expect(plan).toContain('Gamification');
    expect(plan).toContain('ContentPool');
    expect(plan).toContain('PersistedLearningStateV2');
    expect(plan).toContain('core -> features');
    expect(plan).toContain('Rollback');
  });
});
