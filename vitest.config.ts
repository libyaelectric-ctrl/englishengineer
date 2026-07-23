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
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        branches: 45,
        functions: 50,
        lines: 55,
        statements: 55,
        'src/features/billing/**': {
          branches: 30,
          functions: 30,
          lines: 35,
          statements: 35,
        },
        'src/features/auth/**': {
          branches: 30,
          functions: 30,
          lines: 35,
          statements: 35,
        },
        'src/features/ai/**': {
          branches: 25,
          functions: 25,
          lines: 30,
          statements: 30,
        },
        'src/features/vocabulary/**': {
          branches: 30,
          functions: 30,
          lines: 35,
          statements: 35,
        },
        'src/core/**': {
          branches: 30,
          functions: 30,
          lines: 35,
          statements: 35,
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
