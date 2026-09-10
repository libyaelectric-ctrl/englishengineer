import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

process.env.NODE_ENV = 'test';
const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    maxWorkers: 1,
    testTimeout: 60_000,
    hookTimeout: 120_000,
    teardownTimeout: 30_000,
    isolate: true,
    exclude: ['node_modules/**', 'dist/**', 'e2e/**', 'tests/**', 'backend/**', '.mimocode/**', 'src/shared/tests/integration/**', 'test/integration/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**', 'src/data/**', 'src/**/by-level/**', 'src/features/localization/data/**', 'src/features/localization/localization.data.ts'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    }
  },
  resolve: { alias: { '@': srcPath } }
});
