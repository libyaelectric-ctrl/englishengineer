/**
 * Static data-plane access for the seed corpora (vocabulary, translations, grammar).
 *
 * Those corpora no longer live in the repository: `public/data/**` is gitignored, so a
 * clean checkout — and therefore every CI and Vercel build — contains no `/data` files.
 * The only copy is the Storage CDN in `VITE_DATA_CDN_URL`. A loader that hardcodes a
 * root-relative `/data/...` path therefore asks the web server for a file the build
 * never had, and the Vercel SPA rewrite answers that request with HTTP 200 and
 * `index.html`; `res.ok` is true, so the failure only shows up later as a JSON parse
 * error, and the grammar loaders silently rendered an empty page in production.
 *
 * `resolveDataUrl` puts every loader on the origin that actually holds the data, and
 * `fetchSeedJson` rejects a response that is not JSON so a wrong-origin 200 is reported
 * as a data error instead of being mistaken for an empty dataset.
 */
import { AppError, ErrorCode } from '@/core/errors';

const DATA_CDN_BASE = (import.meta.env.VITE_DATA_CDN_URL ?? '').replace(/\/+$/, '');

/** Absolute URL for a dataset path (`/data/vocabulary/a1.seed.json`). */
export const resolveDataUrl = (path: string): string =>
  `${DATA_CDN_BASE}${path.startsWith('/') ? path : `/${path}`}`;

/** Enough of a foreign body to recognise it in a log without dumping a whole document. */
const describeBody = (body: string): string => body.trim().replace(/\s+/g, ' ').slice(0, 60);

/** Fetches a JSON dataset, failing loudly when the response is not JSON. */
export const fetchSeedJson = async <T>(path: string, label: string): Promise<T> => {
  const url = resolveDataUrl(path);
  const response = await fetch(url);

  if (!response.ok) {
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: `Failed to load ${label}: ${response.status} from ${url}`,
    });
  }

  const body = await response.text();
  try {
    return JSON.parse(body) as T;
  } catch (cause) {
    throw new AppError({
      code: ErrorCode.VALIDATION,
      message: `${label} is not JSON (${url}): "${describeBody(body)}"`,
      cause: cause instanceof Error ? cause : undefined,
    });
  }
};
