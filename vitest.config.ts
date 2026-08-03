import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

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
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
        'src/features/billing/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/auth/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/ai/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/vocabulary/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/grammar/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/reading/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/writing/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/speaking/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/features/listening/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/core/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/shared/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
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
