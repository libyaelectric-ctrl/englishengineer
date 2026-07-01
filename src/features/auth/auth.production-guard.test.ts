import { describe, expect, it } from 'vitest';
import { LocalAuthAdapter } from './auth.adapter';
import { isLocalAuthAllowed } from './auth.config';

describe('LocalAuth production guard', () => {
  it('blocks local auth in production unless explicitly enabled', () => {
    expect(isLocalAuthAllowed(true)).toBe(false);
    expect(isLocalAuthAllowed(true, 'true')).toBe(true);
    expect(isLocalAuthAllowed(false)).toBe(true);
  });

  it('rejects local login when the adapter is disabled', async () => {
    const adapter = new LocalAuthAdapter(false);
    await expect(
      adapter.login('Test Engineer', 'engineer@example.com')
    ).rejects.toThrow('Secure authentication is not configured.');
  });

  it('creates a fresh demo identity for each explicit demo start', async () => {
    const adapter = new LocalAuthAdapter(true);
    const first = await adapter.demoLogin();
    const second = await adapter.demoLogin();
    expect(first.id).toMatch(/^demo_engineer_/);
    expect(second.id).toMatch(/^demo_engineer_/);
    expect(second.id).not.toBe(first.id);
  });
});
