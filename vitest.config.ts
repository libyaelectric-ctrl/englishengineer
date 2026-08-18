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
        branches: 45,
        functions: 45,
        lines: 45,
        statements: 45,
        'src/features/billing/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/auth/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/ai/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/vocabulary/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/grammar/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/reading/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/writing/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/speaking/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/features/listening/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/core/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
        'src/shared/**': {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
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
