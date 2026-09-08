import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import {
  createMemoryLearningRepository,
  resetLearningRepositoryForTests,
  setLearningRepositoryForTests,
} from '../src/learning-repository.js';

describe('phase 5 compliance export', () => {
  it('exports only the authenticated user persisted learning records', async () => {
    const repository = createMemoryLearningRepository();
    setLearningRepositoryForTests(repository);
    await repository.recordProgress({
      userId: 'user-a',
      module: 'grammar',
      itemId: 'item-a',
      result: 'correct',
      score: 100,
      category: 'tense',
      metadata: {},
    });
    await repository.recordProgress({
      userId: 'user-b',
      module: 'grammar',
      itemId: 'item-b',
      result: 'incorrect',
      score: 0,
      category: 'tense',
      metadata: {},
    });

    const exported = await repository.exportUserData('user-a');
    assert.equal(exported.progressEvents.length, 1);
    assert.deepEqual(exported.progressEvents[0], {
      ...exported.progressEvents[0],
      userId: 'user-a',
      itemId: 'item-a',
    });
    assert.ok(!JSON.stringify(exported).includes('user-b'));
  });

  it('does not expose the former placeholder export', async () => {
    const source = await readFile(new URL('../src/export-routes.ts', import.meta.url), 'utf8');
    assert.ok(source.includes('getLearningRepository().exportUserData(userId)'));
    assert.ok(source.includes("'Cache-Control', 'no-store, private'"));
    assert.ok(source.includes('AUDIT_ACTIONS.DATA_EXPORTED'));
    assert.ok(!source.includes('Full data export pending'));
  });

  // Clean up after tests
  it('cleanup', () => {
    resetLearningRepositoryForTests();
  });
});
