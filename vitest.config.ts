import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// React's test utilities require the development/test build even when the
// shell that launches Vitest inherits NODE_ENV=production.
process.env.NODE_ENV = 'test';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    maxWorkers: 2,
    testTimeout: 15_000,
    hookTimeout: 30_000,
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
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        branches: 35,
        functions: 35,
        lines: 35,
        statements: 35,
        'src/features/billing/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/auth/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/ai/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/vocabulary/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/grammar/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/reading/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/writing/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/speaking/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/features/listening/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/core/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
        'src/shared/**': {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
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
