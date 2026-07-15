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
    exclude: ['node_modules/**', 'dist/**', 'tests/browser/**', 'backend/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
        'src/features/billing/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/features/auth/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
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
        'src/core/**': {
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
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
    },
  },
});
