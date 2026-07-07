/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  mutator: {
    plugins: ['typescript', 'javascript'],
    excludedMutations: [
      'BooleanLiteral',
      'StringLiteral',
    ],
  },
  reporters: ['clear-text', 'html'],
  htmlReporter: {
    fileName: 'reports/mutation-report.html',
  },
  thresholds: {
    high: 80,
    low: 60,
    break: null,
  },
  mutate: [
    'src/shared/utils/cn.ts',
    'src/config/navigation.config.ts',
  ],
  ignorePatterns: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.d.ts',
    '**/node_modules/**',
    '**/dist/**',
  ],
  timeoutMS: 30000,
  concurrency: 1,
};

export default config;
