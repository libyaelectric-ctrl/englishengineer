import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceRepository } from '../src/workspace.js';

describe('workspace repository', () => {
  it('throws when workspace not configured', () => {
    const config = { workspace: { configured: false } };
    assert.throws(() => createWorkspaceRepository(config), /SUPABASE/);
  });

  it('creates workspace repository when configured', () => {
    const config = {
      workspace: {
        configured: true,
        supabaseUrl: 'https://test.supabase.co',
        supabaseServiceRoleKey: 'test-key',
      },
    };
    const repo = createWorkspaceRepository(config);
    assert.ok(repo);
  });

  it('has getWorkspaces method', () => {
    const config = { workspace: { configured: true, supabaseUrl: 'https://test.supabase.co', supabaseServiceRoleKey: 'test-key' } };
    const repo = createWorkspaceRepository(config);
    assert.equal(typeof repo.getWorkspaces, 'function');
  });

  it('has createWorkspace method', () => {
    const config = { workspace: { configured: true, supabaseUrl: 'https://test.supabase.co', supabaseServiceRoleKey: 'test-key' } };
    const repo = createWorkspaceRepository(config);
    assert.equal(typeof repo.createWorkspace, 'function');
  });
});
