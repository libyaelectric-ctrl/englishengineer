import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/core/errors';

import { fetchSeedJson, resolveDataUrl } from './data-source';

const originalFetch = globalThis.fetch;

/** Mirrors the module's own normalisation so the test holds with or without a CDN. */
const configuredBase = (import.meta.env.VITE_DATA_CDN_URL ?? '').replace(/\/+$/, '');

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const jsonResponse = (payload: unknown): Response =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('resolveDataUrl', () => {
  it('appends the dataset path to the configured data origin', () => {
    expect(resolveDataUrl('/data/grammar/a1.seed.json')).toBe(
      `${configuredBase}/data/grammar/a1.seed.json`
    );
  });

  it('normalises a path given without a leading slash', () => {
    expect(resolveDataUrl('data/translations/tr.json')).toBe(
      resolveDataUrl('/data/translations/tr.json')
    );
  });
});

describe('fetchSeedJson', () => {
  it('parses the dataset body', async () => {
    globalThis.fetch = vi.fn(async () => jsonResponse([{ id: 'a1-1' }])) as typeof fetch;

    await expect(
      fetchSeedJson<Array<{ id: string }>>('/data/grammar/a1.seed.json', 'A1')
    ).resolves.toEqual([{ id: 'a1-1' }]);
  });

  it('reports a non-JSON 200 body instead of treating it as an empty dataset', async () => {
    // Exactly what the SPA rewrite serves for a dataset path the build never had.
    globalThis.fetch = vi.fn(
      async () => new Response('<!doctype html><html><head></head></html>', { status: 200 })
    ) as typeof fetch;

    await expect(fetchSeedJson('/data/grammar/a1.seed.json', 'A1 grammar')).rejects.toBeInstanceOf(
      AppError
    );
  });

  it('reports a failed status together with the URL it tried', async () => {
    globalThis.fetch = vi.fn(
      async () => new Response('Not found', { status: 404 })
    ) as typeof fetch;

    await expect(fetchSeedJson('/data/grammar/a1.seed.json', 'A1 grammar')).rejects.toThrow(
      /Failed to load A1 grammar: 404/
    );
  });
});
