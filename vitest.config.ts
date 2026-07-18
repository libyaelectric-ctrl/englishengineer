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
    exclude: ['node_modules/**', 'dist/**', 'tests/**', 'backend/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        branches: 25,
        functions: 28,
        lines: 32,
        statements: 32,
        'src/features/billing/**': {
          branches: 20,
          functions: 15,
          lines: 20,
          statements: 20,
        },
        'src/features/auth/**': {
          branches: 20,
          functions: 15,
          lines: 20,
          statements: 20,
        },
        'src/features/ai/**': {
          branches: 20,
          functions: 15,
          lines: 20,
          statements: 20,
        },
        'src/features/vocabulary/**': {
          branches: 20,
          functions: 15,
          lines: 20,
          statements: 20,
        },
        'src/core/**': {
          branches: 20,
          functions: 15,
          lines: 20,
          statements: 20,
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
