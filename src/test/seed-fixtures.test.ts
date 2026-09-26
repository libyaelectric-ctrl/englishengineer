/**
 * Guards the fixture corpus the whole suite reads through the fetch shim.
 *
 * The shim used to fall through to the Storage CDN whenever a seed was missing from disk, which is
 * exactly what happened on every CI run and made the suite as reliable as that origin. These tests
 * pin the replacement contract: every seed a loader asks for is served from the committed fixtures,
 * nothing is served that the fixtures do not contain, and a seed request never leaves the machine.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

import { parsesAsJson } from './seed-body';
import { hasSeedCorpus } from './seed-corpus';

const FIXTURE_SEED_DIR = path.resolve(process.cwd(), 'src/test/fixtures/seeds');

/** Every seed path the loaders request — see `src/data/vocabulary`, `src/data/grammar` and the translation service. */
const REQUESTED_SEEDS = [
  'vocabulary/a1.seed.json',
  'vocabulary/a2.seed.json',
  'vocabulary/b1.seed.json',
  'vocabulary/b1.seed-1.json',
  'vocabulary/b1.seed-2.json',
  'vocabulary/b1.seed-3.json',
  'vocabulary/b2.seed.json',
  'vocabulary/c1.seed.json',
  'vocabulary/c2.seed.json',
  'grammar/a1.seed.json',
  'grammar/a2.seed.json',
  'grammar/b1.seed.json',
  'grammar/b2.seed.json',
  'grammar/c1.seed.json',
  'grammar/c2.seed.json',
  'translations/en.json',
  'translations/tr.json',
  'translations/ar.json',
];

/**
 * An origin nothing can reach. Requests are addressed to it so that a shim that ever decided to
 * "just fetch the rest" would fail loudly instead of silently reaching the real CDN.
 */
const UNREACHABLE_ORIGIN = 'http://127.0.0.1:1';

describe('seed fixtures', () => {
  it('serves every seed a loader requests', async () => {
    for (const relative of REQUESTED_SEEDS) {
      const response = await globalThis.fetch(`${UNREACHABLE_ORIGIN}/data/${relative}`);
      expect(response.ok, `${relative} is not served`).toBe(true);
      expect(parsesAsJson(await response.text()), `${relative} is not JSON`).toBe(true);
    }
  });

  // Skipped when a real corpus is configured (`ENGVOX_TEST_SEED_DIR`), which is the one case where
  // the same path legitimately comes from somewhere else on disk.
  it.skipIf(hasSeedCorpus())('serves exactly the committed fixture, byte for byte', async () => {
    for (const relative of REQUESTED_SEEDS) {
      const response = await globalThis.fetch(`${UNREACHABLE_ORIGIN}/data/${relative}`);
      const onDisk = fs.readFileSync(path.join(FIXTURE_SEED_DIR, relative), 'utf-8');
      expect(await response.text()).toBe(onDisk);
    }
  });

  it('serves seeds for every CEFR level, including the split B1 shards', async () => {
    for (const theLevel of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      const vocabulary = await globalThis.fetch(
        `${UNREACHABLE_ORIGIN}/data/vocabulary/${theLevel}.seed.json`
      );
      const grammar = await globalThis.fetch(
        `${UNREACHABLE_ORIGIN}/data/grammar/${theLevel}.seed.json`
      );
      expect((await vocabulary.json()).length, `vocabulary ${theLevel} is empty`).toBeGreaterThan(
        0
      );
      expect((await grammar.json()).length, `grammar ${theLevel} is empty`).toBeGreaterThan(0);
    }
  });

  it('answers an unknown seed with a deterministic 404 instead of going to the network', async () => {
    const response = await globalThis.fetch(
      `${UNREACHABLE_ORIGIN}/data/vocabulary/zzz-no-such-seed.json`
    );
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  it('refuses a seed path that tries to escape the fixture directory', async () => {
    const response = await globalThis.fetch(
      `${UNREACHABLE_ORIGIN}/data/vocabulary/../../package.json`
    );
    expect(response.status).toBe(404);
  });

  it('keeps serving from disk when a CDN origin is configured', async () => {
    // `VITE_DATA_CDN_URL` only decides which origin a loader asks; the shim answers from disk either
    // way, so a wrong or dead CDN can no longer change what the suite sees.
    const configured = process.env.VITE_DATA_CDN_URL ?? 'https://cdn.example.invalid/app-data';
    const response = await globalThis.fetch(`${configured}/data/grammar/a1.seed.json`);
    expect(response.ok).toBe(true);
    expect((await response.json()).length).toBeGreaterThan(0);
  });
});
