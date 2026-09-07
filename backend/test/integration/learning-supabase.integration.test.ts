import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'node:test';
import { createSupabaseLearningRepository } from '../../src/learning-repository.js';
const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
describe('Supabase learning repository', { skip: !url || !key }, () => {
  it('persists across clients and isolates users', async () => {
    const userA = `phase2-a-${randomUUID()}`;
    const userB = `phase2-b-${randomUUID()}`;
    const first = createSupabaseLearningRepository({ supabaseUrl: url!, supabaseServiceRoleKey: key! });
    const second = createSupabaseLearningRepository({ supabaseUrl: url!, supabaseServiceRoleKey: key! });
    try {
      await first.recordProgress({ userId: userA, module: 'vocabulary', itemId: 'word-a', result: 'correct', score: 100, category: 'general', metadata: {} });
      await first.recordProgress({ userId: userB, module: 'vocabulary', itemId: 'word-b', result: 'incorrect', score: 0, category: 'general', metadata: {} });
      assert.deepEqual((await second.listProgress(userA, 'vocabulary')).map((event) => event.itemId), ['word-a']);
      assert.deepEqual((await second.listProgress(userB, 'vocabulary')).map((event) => event.itemId), ['word-b']);
    } finally { await first.deleteUserData(userA); await first.deleteUserData(userB); }
  });
});
