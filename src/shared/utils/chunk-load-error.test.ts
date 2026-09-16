import { describe, expect, it } from 'vitest';

import { isChunkLoadFailure } from './chunk-load-error';

describe('isChunkLoadFailure', () => {
  it('recognises a named chunk-load error without reading its message', () => {
    const error = new Error('something the bundler phrased differently');
    error.name = 'ChunkLoadError';

    expect(isChunkLoadFailure(error)).toBe(true);
  });

  it('falls back to the Vite engine messages, which carry no code', () => {
    expect(isChunkLoadFailure(new Error('Failed to fetch dynamically imported module'))).toBe(true);
    expect(isChunkLoadFailure(new TypeError('Importing a module script failed'))).toBe(true);
  });

  it('does not treat an unrelated runtime failure as a chunk error', () => {
    expect(isChunkLoadFailure(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isChunkLoadFailure('Failed to fetch dynamically imported module')).toBe(false);
    expect(isChunkLoadFailure(undefined)).toBe(false);
  });
});
