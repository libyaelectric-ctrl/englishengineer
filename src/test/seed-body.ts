/**
 * Decoding for the seed corpora the test fetch shim serves.
 *
 * The Storage CDN answers `/data/**` compressed, and which compression a client gets back — and
 * whether `content-encoding` even names it — is not stable. In CI the body arrived brotli-packed
 * with **no** encoding header, so assuming the runtime had already decoded it handed the
 * compressed bytes to `JSON.parse` and every seed loader failed with "<level> ... is not JSON"
 * plus unprintable bytes (16 tests across vocabulary, curriculum, orchestrator and intelligence).
 *
 * Sniffing the codec instead of trusting the header is what keeps the shim correct whichever
 * fetch the environment ends up using. This lives in its own module so the behaviour can be
 * tested directly, without a network and without replaying the whole fetch shim.
 */
import * as zlib from 'node:zlib';

/** True when `text` parses as JSON — the only shape a seed loader accepts. */
export const parsesAsJson = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * The decompressors to try, in order. `preferred` (a response's `content-encoding`) is moved to
 * the front when it names one of them, so the common case costs a single attempt. `zstd` is
 * included only where the running Node exposes it.
 */
export const seedDecoders = (
  preferred?: string | null
): Array<[name: string, decode: (input: Buffer) => Buffer]> => {
  const list: Array<[name: string, decode: (input: Buffer) => Buffer]> = [
    ['br', (input) => zlib.brotliDecompressSync(input)],
    ['gzip', (input) => zlib.gunzipSync(input)],
    ['deflate', (input) => zlib.inflateSync(input)],
  ];
  const zstd = (zlib as unknown as Record<string, ((input: Buffer) => Buffer) | undefined>)
    .zstdDecompressSync;
  if (zstd) list.push(['zstd', (input) => zstd(input)]);

  const wanted = (preferred ?? '').trim().toLowerCase();
  const index = list.findIndex(([name]) => name === wanted);
  if (index > 0) list.unshift(...list.splice(index, 1));
  return list;
};

export interface DecodedSeedBody {
  /** The body as JSON text, or as the raw text when no codec produced valid JSON. */
  text: string;
  /** The codec that had to be applied, or `null` when the body was already JSON. */
  codec: string | null;
}

/**
 * Returns the body as JSON text, decompressing it first when the runtime has not already.
 *
 * A body that is neither JSON nor something a known codec turns into JSON is returned untouched,
 * so the caller still reports the useful "not JSON" error rather than a decode failure.
 */
export const decodeSeedBody = (bytes: Buffer, contentEncoding?: string | null): DecodedSeedBody => {
  const asText = bytes.toString('utf8');
  if (parsesAsJson(asText)) return { text: asText, codec: null };

  for (const [name, decode] of seedDecoders(contentEncoding)) {
    try {
      const decoded = decode(bytes).toString('utf8');
      if (parsesAsJson(decoded)) return { text: decoded, codec: name };
    } catch {
      // Not this codec; try the next one.
    }
  }
  return { text: asText, codec: null };
};
