/**
 * Tells a failed code-split chunk apart from a real runtime fault.
 *
 * The structural signal comes first: bundlers that name the failure set
 * `ChunkLoadError`. Vite raises a plain TypeError for a failed dynamic import and
 * gives it no name or code, so its two engine messages remain the only signal
 * available for that shape — that fallback is deliberately the last resort and
 * should not grow into a general prose matcher.
 */
const CHUNK_LOAD_ERROR_NAME = 'ChunkLoadError';

const VITE_DYNAMIC_IMPORT_MESSAGES = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
];

export const isChunkLoadFailure = (error: unknown): boolean => {
  if (error instanceof Error && error.name === CHUNK_LOAD_ERROR_NAME) return true;
  const message = error instanceof Error ? error.message : '';
  return VITE_DYNAMIC_IMPORT_MESSAGES.some((entry) => message.includes(entry));
};
