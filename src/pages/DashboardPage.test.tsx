import { describe, expect, it } from 'vitest';

describe('DashboardPage', () => {
  it('module can be imported', async () => {
    const mod = await import('./DashboardPage');
    expect(mod.default).toBeTypeOf('function');
  });
});
