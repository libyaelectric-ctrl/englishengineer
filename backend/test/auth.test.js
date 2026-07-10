import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createBackendAuth } from '../src/auth.js';

describe('backend auth', () => {
  it('creates auth module', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseServiceRoleKey: 'test-key',
    };
    const auth = createBackendAuth(config, fetch);
    assert.ok(auth);
    assert.ok(auth.requireBackendAuth);
    assert.ok(auth.optionalBackendAuth);
  });

  it('requireBackendAuth is function', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseServiceRoleKey: 'test-key',
    };
    const auth = createBackendAuth(config, fetch);
    assert.equal(typeof auth.requireBackendAuth, 'function');
  });

  it('optionalBackendAuth is function', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseServiceRoleKey: 'test-key',
    };
    const auth = createBackendAuth(config, fetch);
    assert.equal(typeof auth.optionalBackendAuth, 'function');
  });
});
