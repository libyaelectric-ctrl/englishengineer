import { describe, expect, it } from 'vitest';

/**
 * TEMPORARY PROBE — removed again before this branch merges.
 *
 * It fails only when CI=true, so the local pre-commit hook stays usable while
 * the GitHub Actions run proves whether a red `🎭 Vitest E2E` job actually
 * reaches `✅ CI Complete`.
 */
describe('CI gate probe', () => {
  it('fails in CI so the Vitest E2E result has to reach CI Complete', () => {
    expect(process.env.CI === 'true').toBe(false);
  });
});
