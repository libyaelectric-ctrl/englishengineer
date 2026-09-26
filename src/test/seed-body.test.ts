/**
 * Regression protection for the seed-body decoding the test fetch shim relies on.
 *
 * The shim now serves the committed fixtures and never touches the network on its own, so the codec
 * sniffing below is reached only through the opt-in `ENGVOX_TEST_SEED_FALLBACK=cdn` path. It exists
 * because that path used to be the default: CI checkouts carry no `public/data`, so seed requests
 * fell through to the Storage CDN — which answers compressed, and in CI answered brotli-packed with
 * **no** `content-encoding` header. Trusting that header (or assuming the runtime had already
 * decoded the body) fed compressed bytes to `JSON.parse` and broke 16 tests across vocabulary,
 * curriculum, orchestrator and intelligence. The first block pins the decoder's contract; the
 * second drives the shim's fallback against a locally served body of exactly that shape, so a
 * dependency bump that changes how bodies arrive fails here instead of in five unrelated suites.
 */
import * as http from 'node:http';
import * as zlib from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { decodeSeedBody, parsesAsJson, seedDecoders } from './seed-body';

const payload = { level: 'a1', entries: [{ id: 'regression-1' }] };
const payloadJson = JSON.stringify(payload);
const payloadBytes = Buffer.from(payloadJson, 'utf8');

describe('decodeSeedBody', () => {
  it('returns an already-JSON body untouched and reports no codec', () => {
    expect(decodeSeedBody(payloadBytes)).toEqual({ text: payloadJson, codec: null });
  });

  // The exact CI shape: brotli-packed bytes with an empty `content-encoding`.
  it('decodes a brotli body that arrived without a content-encoding header', () => {
    const { text, codec } = decodeSeedBody(zlib.brotliCompressSync(payloadBytes), '');
    expect(codec).toBe('br');
    expect(JSON.parse(text)).toEqual(payload);
  });

  it('decodes a gzip body named by the header', () => {
    const { text, codec } = decodeSeedBody(zlib.gzipSync(payloadBytes), 'gzip');
    expect(codec).toBe('gzip');
    expect(JSON.parse(text)).toEqual(payload);
  });

  it('decodes a deflate body named by the header', () => {
    const { text, codec } = decodeSeedBody(zlib.deflateSync(payloadBytes), 'deflate');
    expect(codec).toBe('deflate');
    expect(JSON.parse(text)).toEqual(payload);
  });

  it('decodes a zstd body where the running Node exposes zstd', () => {
    const compress = (zlib as unknown as Record<string, ((input: Buffer) => Buffer) | undefined>)
      .zstdCompressSync;
    if (!compress) return;

    const { text, codec } = decodeSeedBody(compress(payloadBytes));
    expect(codec).toBe('zstd');
    expect(JSON.parse(text)).toEqual(payload);
  });

  it('leaves an unrecognisable body as text so the loader still reports "not JSON"', () => {
    const garbage = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0xff]);
    expect(decodeSeedBody(garbage, 'br')).toEqual({ text: garbage.toString('utf8'), codec: null });
  });

  it('tries the codec named by the header first and keeps a default order otherwise', () => {
    expect(seedDecoders('gzip')[0][0]).toBe('gzip');
    expect(seedDecoders('br')[0][0]).toBe('br');
    // An unknown (e.g. `identity`) header must not disturb the default order.
    expect(seedDecoders('identity')[0][0]).toBe('br');
    expect(seedDecoders()[0][0]).toBe('br');
  });

  it('recognises JSON and rejects everything else', () => {
    expect(parsesAsJson(payloadJson)).toBe(true);
    expect(parsesAsJson('{ not json')).toBe(false);
  });
});

describe('the seed fetch shim CDN fallback', () => {
  const brotliBody = zlib.brotliCompressSync(payloadBytes);
  const previousFallback = process.env.ENGVOX_TEST_SEED_FALLBACK;
  let server: http.Server;
  let origin = '';

  const readRaw = (url: string): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      http
        .get(url, (response) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
        })
        .on('error', reject);
    });

  beforeAll(async () => {
    // The fallback is opted into per request, so a suite that has not asked for it can never reach
    // the network — which is the property the fixture tests rely on.
    process.env.ENGVOX_TEST_SEED_FALLBACK = 'cdn';
    server = http.createServer((_request, response) => {
      // Deliberately no `content-encoding`, matching what CI observed from the CDN.
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(brotliBody);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('test server has no port');
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (previousFallback === undefined) delete process.env.ENGVOX_TEST_SEED_FALLBACK;
    else process.env.ENGVOX_TEST_SEED_FALLBACK = previousFallback;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  });

  it('turns a headerless, brotli-packed seed response into JSON', async () => {
    // The filename is deliberately absent from the fixtures, so the fallback is the only source
    // that can answer it — exactly the shape the shim used to hit on every CI run.
    const url = `${origin}/data/vocabulary/__seed-body-regression__.json`;

    // Guard the fixture: the bytes really are compressed, so a shim that skipped decoding would
    // hand `JSON.parse` this and fail the assertion below.
    expect(parsesAsJson((await readRaw(url)).toString('utf8'))).toBe(false);

    const response = await globalThis.fetch(url);
    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual(payload);
  });
});
