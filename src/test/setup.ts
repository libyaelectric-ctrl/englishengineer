// Mock global fetch for local JSON seed files in Node/Vitest
import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, vi } from 'vitest';

import React from 'react';

import { logger } from '@/shared/logger';

import { decodeSeedBody } from './seed-body';

// Seed corpora are served from the committed fixtures in `src/test/fixtures/seeds` (see
// `scripts/build-test-seed-fixtures.mjs`), so the suite reads the same bytes everywhere and never
// reaches the Storage CDN. `ENGVOX_TEST_SEED_DIR` substitutes a real corpus copy for the
// corpus-integrity suites; `ENGVOX_TEST_SEED_FALLBACK=cdn` opts back into the network.
const DATA_CDN_BASE = (
  process.env.VITE_DATA_CDN_URL ??
  'https://wxabrwzitwsjtpmlvvqe.supabase.co/storage/v1/object/public/app-data'
).replace(/\/+$/, '');

// Mock canvas for THREE/WebGL tests (minimal mock, no canvas pkg dependency)
globalThis.HTMLCanvasElement = class MockCanvas {
  width = 300;
  height = 150;
  getContext() {
    return {
      canvas: this,
      fillRect: () => {},
      clearRect: () => {},
      drawImage: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => null,
      setTransform: () => {},
      resetTransform: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      transform: () => {},
    };
  }
  toDataURL() {
    return '';
  }
} as unknown as typeof HTMLCanvasElement;

// Mock Firebase Auth for tests - provides the provider and the useFirebaseAuth hook
vi.mock('@/features/auth/FirebaseAuth', () => ({
  FirebaseAuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-firebase-auth-provider': true }, children),
  useFirebaseAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
    getIdToken: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signInWithEmail: vi.fn().mockResolvedValue(undefined),
    signUpWithEmail: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock the Capacitor Firebase Authentication plugin (native Google sign-in)
vi.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: {
    signInWithGoogle: vi.fn().mockResolvedValue({ credential: { idToken: 'fake-id-token' } }),
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock localization store for tests - provides getState and selector support
const mockLocalizationState = {
  language: 'en',
  translate: (key: string) => key,
  setLanguage: vi.fn(),
};
vi.mock('@/features/localization', () => ({
  useLocalizationStore: vi.fn((selector?: (state: typeof mockLocalizationState) => unknown) =>
    selector ? selector(mockLocalizationState) : mockLocalizationState
  ),
  LocalizationService: {
    translate: (key: string) => key,
    setLanguage: vi.fn(),
    getSupportedLanguages: () => ['en', 'tr'],
  },
  INTERFACE_LANGUAGES: [
    { id: 'en', flag: '🇬🇧', label: 'English', nativeLabel: 'English', available: true, dir: 'ltr' },
    { id: 'tr', flag: '🇹🇷', label: 'Turkish', nativeLabel: 'Türkçe', available: true, dir: 'ltr' },
  ],
  AVAILABLE_INTERFACE_LANGUAGES: [
    { id: 'en', flag: '🇬🇧', label: 'English', nativeLabel: 'English', available: true, dir: 'ltr' },
    { id: 'tr', flag: '🇹🇷', label: 'Turkish', nativeLabel: 'Türkçe', available: true, dir: 'ltr' },
  ],
}));

let cleanupDom: (() => void) | undefined;
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
  cleanupDom = (await import('@testing-library/react')).cleanup;
}

// Mock IntersectionObserver for jsdom
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
}

// Mock scrollIntoView for jsdom (absent in jsdom, used by navbar listbox keyboard handler)
if (typeof Element !== 'undefined' && !('scrollIntoView' in Element.prototype)) {
  (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => {};
}

// Mock matchMedia for jsdom (required by prefers-reduced-motion hooks)
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

// IndexedDB is intentionally NOT mocked here.
// IndexedDB functions in indexed-db.ts check isSupported() which returns false
// when window.indexedDB is undefined, so getCachedSeed / setCachedSeed become
// no-ops. Vocabulary data loads directly from JSON seed files via mock fetch.
// This avoids complex async mock chains that cause test timeouts.

afterEach(() => {
  cleanupDom?.();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
});

// Mock react-virtuoso for testing
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({
    totalCount,
    itemContent,
  }: {
    totalCount: number;
    itemContent: (index: number) => React.ReactNode;
  }) => {
    const items = [];
    for (let i = 0; i < totalCount; i++) {
      items.push(itemContent(i));
    }
    return React.createElement('div', null, items);
  },
}));

/**
 * Reads a seed response as JSON text, decompressing it when the runtime has not already.
 *
 * Only the opt-in CDN fallback below needs this: the codec sniffing itself lives in `./seed-body`
 * so it can be tested directly, without a network and without replaying this whole fetch shim; see
 * `seed-body.test.ts`, which also drives the fallback end to end against a headerless,
 * brotli-packed body — the exact shape CI once received from the Storage CDN.
 */
const readSeedBody = async (response: Response): Promise<string> => {
  const bytes = Buffer.from(await response.arrayBuffer());
  const header = response.headers.get('content-encoding');
  const { text, codec } = decodeSeedBody(bytes, header);
  if (codec) {
    logger.w(
      `[TEST_SETUP] seed body arrived ${codec}-compressed (header "${header ?? ''}"); decoded`
    );
  }
  return text;
};

const originalFetch = globalThis.fetch;
const isSeedRequest = (urlStr: string): boolean =>
  urlStr.includes('/data/grammar/') ||
  urlStr.includes('/data/vocabulary/') ||
  urlStr.includes('/data/translations/');

/** The committed slice of each corpus that the suites run against. */
const FIXTURE_SEED_DIR = path.resolve(process.cwd(), 'src/test/fixtures/seeds');

const jsonResponse = (content: string): Response =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => JSON.parse(content),
    text: async () => content,
  }) as unknown as Response;

const notFoundResponse = (): Response =>
  ({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: async () => {
      throw new Error('Not Found');
    },
    text: async () => 'Not Found',
  }) as unknown as Response;

/**
 * Where a seed file is looked up, in order: a real corpus copy when `ENGVOX_TEST_SEED_DIR` names
 * one, then the committed fixtures. The fixtures stay in the list as a fallback so a partial corpus
 * copy (for instance `public/data`, which holds vocabulary and translations but no grammar) is
 * still usable.
 */
const seedSourceDirs = (): string[] => {
  const corpusDir = process.env.ENGVOX_TEST_SEED_DIR;
  return corpusDir ? [path.resolve(corpusDir), FIXTURE_SEED_DIR] : [FIXTURE_SEED_DIR];
};

const readSeedFile = (relativePath: string): string | undefined => {
  if (!relativePath || relativePath.includes('..')) return undefined;
  for (const dir of seedSourceDirs()) {
    const file = path.join(dir, relativePath);
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf-8');
  }
  return undefined;
};

// Seed URLs are relative (/data/...) when no CDN is configured, or absolute (https://cdn.../data/...)
// when VITE_DATA_CDN_URL is set. Either way the origin is stripped and the path is served from
// disk, so the same request yields the same bytes on every machine and in CI. Nothing here touches
// the network unless `ENGVOX_TEST_SEED_FALLBACK=cdn` asks for it explicitly; a seed that no source
// can serve answers 404, deterministically.
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : input.toString();
  if (isSeedRequest(urlStr)) {
    // Keep only the /data/... path portion: seed URLs may be relative
    // (/data/...) or carry a CDN origin (https://cdn.../data/...).
    const dataIndex = urlStr.indexOf('/data/');
    const pathname = dataIndex >= 0 ? urlStr.slice(dataIndex) : urlStr;
    const content = readSeedFile(pathname.replace(/^\/data\//, ''));
    if (content !== undefined) return jsonResponse(content);

    if (process.env.ENGVOX_TEST_SEED_FALLBACK === 'cdn') {
      try {
        const cdnUrl = /^https?:\/\//.test(urlStr) ? urlStr : `${DATA_CDN_BASE}${urlStr}`;
        const cdnResponse = await originalFetch(cdnUrl);
        if (!cdnResponse.ok) throw new Error(`CDN ${cdnResponse.status}`);
        return jsonResponse(await readSeedBody(cdnResponse));
      } catch (cdnError) {
        logger.w('[TEST_SETUP] seed CDN fallback failed', cdnError);
      }
    }
    return notFoundResponse();
  }
  if (originalFetch) {
    return originalFetch(input, init);
  }
  throw new TypeError('Failed to fetch');
};
