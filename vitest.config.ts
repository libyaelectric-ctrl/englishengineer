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
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
        'src/features/billing/**': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        'src/features/auth/**': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        'backend/src/auth.js': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        'backend/src/billing-service.js': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        }
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
