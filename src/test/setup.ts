// Mock global fetch for local JSON seed files in Node/Vitest
import { afterEach, vi } from 'vitest';

import React from 'react';

import { logger } from '@/shared/logger';

// Seed files moved to Supabase Storage; the test shim falls back to the
// Storage origin when the local public/data copy is missing (CI checkouts
// contain no public/data files).
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

type NodeFileSystem = {
  readFileSync: (filePath: string, encoding: 'utf-8') => string;
};
type NodePath = { resolve: (...segments: string[]) => string };
type NodeProcess = {
  getBuiltinModule?: (name: string) => unknown;
};

const nodeProcess = (globalThis as typeof globalThis & { process?: NodeProcess }).process;
const fs = nodeProcess?.getBuiltinModule?.('fs') as NodeFileSystem | undefined;
const path = nodeProcess?.getBuiltinModule?.('path') as NodePath | undefined;

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

const originalFetch = globalThis.fetch;
const isSeedRequest = (urlStr: string): boolean =>
  urlStr.includes('/data/grammar/') ||
  urlStr.includes('/data/vocabulary/') ||
  urlStr.includes('/data/translations/');

// The seed URL is relative (/data/...) when no CDN is configured, or absolute
// (https://cdn.../data/...) when VITE_DATA_CDN_URL is set. In both cases the
// local public/data copy (when present) is the hermetic source of truth, so
// strip any origin and serve from disk before falling back to the CDN.
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : input.toString();
  if (isSeedRequest(urlStr)) {
    // Keep only the /data/... path portion: seed URLs may be relative
    // (/data/...) or carry a CDN origin (https://cdn.../data/...).
    const dataIndex = urlStr.indexOf('/data/');
    const pathname = dataIndex >= 0 ? urlStr.slice(dataIndex) : urlStr;
    const relativePath = pathname.replace(/^\//, '');
    const absolutePath = path?.resolve(process.cwd(), 'public', relativePath);
    try {
      if (!absolutePath || !fs) throw new Error('Node file APIs are unavailable');
      const content = fs.readFileSync(absolutePath, 'utf-8');
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => JSON.parse(content),
        text: async () => content,
      } as unknown as Response;
    } catch (fsError) {
      // The seed files may be absent from a CI checkout (they moved to
      // Supabase Storage) - fall back to the Storage CDN origin.
      try {
        const cdnResponse = await originalFetch(`${DATA_CDN_BASE}${urlStr}`);
        if (!cdnResponse.ok) throw new Error(`CDN ${cdnResponse.status}`, { cause: fsError });
        const content = await cdnResponse.text();
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => JSON.parse(content),
          text: async () => content,
        } as unknown as Response;
      } catch (cdnError) {
        logger.w('[TEST_SETUP] Mock fetch failed (fs + CDN)', cdnError);
        return {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => {
            throw new Error('Not Found');
          },
          text: async () => 'Not Found',
        } as unknown as Response;
      }
    }
  }
  if (originalFetch) {
    return originalFetch(input, init);
  }
  throw new TypeError('Failed to fetch');
};
