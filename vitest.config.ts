import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

process.env.NODE_ENV = 'test';
const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    maxWorkers: 4,
    testTimeout: 15_000,
    hookTimeout: 30_000,
    teardownTimeout: 30_000,
    isolate: true,
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'e2e/**',
      'tests/**',
      'backend/**',
      '.mimocode/**',
      '.freebuff/**',
      'src/shared/tests/integration/**',
      'test/integration/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/test/**',
        'src/data/**',
        'src/**/by-level/**',
        'src/features/localization/data/**',
        'src/features/localization/localization.data.ts',
      ],
      thresholds: {
        // Aligned with CI enforcement (lines 40, branches 30, functions 35).
        // These are regression gates; coverage improvement deferred to separate PR.
        branches: 30,
        functions: 35,
        lines: 40,
        statements: 40,
      },
    },
  },
  resolve: { alias: { '@': srcPath } },
});
