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
        branches: 55,
        functions: 60,
        lines: 65,
        statements: 65,
        'src/features/billing/**': {
          branches: 40,
          functions: 40,
          lines: 45,
          statements: 45,
        },
        'src/features/auth/**': {
          branches: 40,
          functions: 40,
          lines: 45,
          statements: 45,
        },
        'src/features/ai/**': {
          branches: 35,
          functions: 35,
          lines: 40,
          statements: 40,
        },
        'src/features/vocabulary/**': {
          branches: 40,
          functions: 40,
          lines: 45,
          statements: 45,
        },
        'src/core/**': {
          branches: 40,
          functions: 40,
          lines: 45,
          statements: 45,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': srcPath,
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
    },
  },
});
