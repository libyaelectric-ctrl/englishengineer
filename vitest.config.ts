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
        branches: 28,
        functions: 38,
        lines: 43,
        statements: 42,
        'src/features/billing/**': { branches: 25, functions: 25, lines: 30, statements: 30 },
        'src/features/auth/**': { branches: 12, functions: 22, lines: 20, statements: 20 },
        'src/features/ai/**': { branches: 25, functions: 35, lines: 43, statements: 43 },
        'src/features/vocabulary/**': { branches: 48, functions: 57, lines: 64, statements: 64 },
        'src/features/grammar/**': { branches: 55, functions: 65, lines: 64, statements: 64 },
        'src/features/reading/**': { branches: 33, functions: 40, lines: 44, statements: 44 },
        'src/features/writing/**': { branches: 32, functions: 44, lines: 52, statements: 52 },
        'src/features/speaking/**': { branches: 27, functions: 25, lines: 30, statements: 30 },
        'src/features/listening/**': { branches: 40, functions: 38, lines: 38, statements: 38 },
        'src/core/**': { branches: 35, functions: 30, lines: 42, statements: 42 },
        'src/shared/**': { branches: 30, functions: 35, lines: 38, statements: 38 }
      }
    }
  },
  resolve: { alias: { '@': srcPath } }
});
