import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    maxWorkers: 2,
    testTimeout: 15_000,
    teardownTimeout: 10_000,
    exclude: [
      'node_modules/**',
      'dist/**',
      'e2e/**',
      'tests/**',
      'backend/**',
      '.mimocode/**',
      'src/shared/tests/integration/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        branches: 28,
        functions: 34,
        lines: 38,
        statements: 37,
        'src/features/billing/**': {
          branches: 20,
          functions: 20,
          lines: 25,
          statements: 25,
        },
        'src/features/auth/**': {
          branches: 20,
          functions: 20,
          lines: 25,
          statements: 25,
        },
        'src/features/ai/**': {
          branches: 33,
          functions: 20,
          lines: 25,
          statements: 25,
        },
        'src/features/vocabulary/**': {
          branches: 20,
          functions: 20,
          lines: 25,
          statements: 25,
        },
        'src/core/**': {
          branches: 20,
          functions: 20,
          lines: 25,
          statements: 25,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
});
