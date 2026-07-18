import { afterEach, vi } from 'vitest';
import React from 'react';

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

// Mock global fetch for local JSON seed files in Node/Vitest
import fs from 'fs';
import path from 'path';

const originalFetch = globalThis.fetch;
globalThis.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : input.toString();
  if (
    urlStr.startsWith('/data/vocabulary/') ||
    urlStr.startsWith('/data/grammar/')
  ) {
    const relativePath = urlStr.replace(/^\//, '');
    const absolutePath = path.resolve(process.cwd(), 'public', relativePath);
    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => JSON.parse(content),
        text: async () => content,
      } as unknown as Response;
    } catch (err) {
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
  if (originalFetch) {
    return originalFetch(input, init);
  }
  throw new TypeError('Failed to fetch');
};
