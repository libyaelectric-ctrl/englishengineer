import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createComplianceExportRepository } from '../src/compliance-export-repository.js';
import { ApiError } from '../src/errors.js';

const configured = {
  environment: 'production',
  workspace: {
    supabaseUrl: 'https://project.supabase.co',
    supabaseServiceRoleKey: 'service-role-key',
  },
} as never;

describe('Phase 5 compliance export repository', () => {
  test('fails closed in production without persistent export configuration', async () => {
    const repository = createComplianceExportRepository({
      environment: 'production',
      workspace: {} as never,
    });
    await assert.rejects(
      () => repository.exportUserData('user-a'),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 503);
        assert.equal(error.code, 'compliance_export_unavailable');
        return true;
      }
    );
  });

  test('applies the authenticated owner filter and service-role headers to every source', async () => {
    const requests: Array<{ url: URL; headers: Headers }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      requests.push({
        url: new URL(typeof input === 'string' ? input : input.toString()),
        headers: new Headers(init?.headers),
      });
      return new Response(JSON.stringify([{ id: 'owned-row' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
    const repository = createComplianceExportRepository(configured, fetchImpl);
    const result = await repository.exportUserData('user-a');

    assert.equal(requests.length, 14);
    for (const request of requests) {
      const ownerFilter =
        request.url.searchParams.get('id') ?? request.url.searchParams.get('user_id');
      assert.equal(ownerFilter, 'eq.user-a');
      assert.equal(request.url.searchParams.get('select'), '*');
      assert.equal(request.headers.get('apikey'), 'service-role-key');
      assert.equal(request.headers.get('authorization'), 'Bearer service-role-key');
      assert.equal(request.headers.get('range'), '0-999');
    }
    assert.equal(result.profile.length, 1);
    assert.equal(result.auditLogs.length, 1);
  });

  test('paginates a source in 1000-row ranges without dropping rows', async () => {
    const profileRanges: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input.toString());
      const range = new Headers(init?.headers).get('range') ?? '';
      if (url.pathname.endsWith('/profiles')) {
        profileRanges.push(range);
        const size = range === '0-999' ? 1000 : 1;
        return new Response(
          JSON.stringify(
            Array.from({ length: size }, (_, index) => ({ id: `row-${range}-${index}` }))
          ),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const repository = createComplianceExportRepository(configured, fetchImpl);
    const result = await repository.exportUserData('user-a');
    assert.equal(result.profile.length, 1001);
    assert.deepEqual(profileRanges, ['0-999', '1000-1999']);
  });
});
