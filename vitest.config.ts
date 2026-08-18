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
        branches: 34,
        functions: 34,
        lines: 34,
        statements: 34,
        'src/features/billing/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/auth/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/ai/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/vocabulary/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/grammar/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/reading/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/writing/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/speaking/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/features/listening/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/core/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        'src/shared/**': {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
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
