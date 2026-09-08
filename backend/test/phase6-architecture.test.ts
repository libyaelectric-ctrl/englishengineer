import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

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
    assert.deepEqual(result, { technical: { count: 2, avgScore: 90 } });
  });

  it('keeps writing statistics free of the former unknown-array cast', async () => {
    const source = await readFile(new URL('../src/writing-routes.ts', import.meta.url), 'utf8');
    assert.ok(source.includes("aggregateByPromptCategory(submissions, WRITING_PROMPTS, 'score')"));
    assert.ok(!source.includes('submissions as unknown as Array'));
  });

  it('defines a versioned, rollback-safe learning split', async () => {
    const plan = await readFile(new URL('../../docs/REFACTORING-PLAN.md', import.meta.url), 'utf8');
    assert.ok(plan.includes('Mission'));
    assert.ok(plan.includes('Progress'));
    assert.ok(plan.includes('Gamification'));
    assert.ok(plan.includes('ContentPool'));
    assert.ok(plan.includes('PersistedLearningStateV2'));
    assert.ok(plan.includes('core -> features'));
    assert.ok(plan.includes('Rollback'));
  });
});
