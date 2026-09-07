import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createMemoryLearningRepository,
  resetLearningRepositoryForTests,
  setLearningRepositoryForTests,
} from '../src/learning-repository.js';

afterEach(() => resetLearningRepositoryForTests());

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
    expect(exported.progressEvents).toHaveLength(1);
    expect(exported.progressEvents[0]).toMatchObject({ userId: 'user-a', itemId: 'item-a' });
    expect(JSON.stringify(exported)).not.toContain('user-b');
  });

  it('does not expose the former placeholder export', async () => {
    const source = await readFile(
      new URL('../src/export-routes.ts', import.meta.url),
      'utf8'
    );
    expect(source).toContain('getLearningRepository().exportUserData(userId)');
    expect(source).toContain("'Cache-Control', 'no-store, private'");
    expect(source).toContain('AUDIT_ACTIONS.DATA_EXPORTED');
    expect(source).not.toContain('Full data export pending');
  });
});
