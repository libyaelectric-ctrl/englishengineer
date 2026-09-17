import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import noRawPalette from './eslint-rules/no-raw-palette.js';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'backend/dist',
      'coverage',
      'node_modules',
      '.npm-cache',
      '.vite',
      'test-results',
      'coverage/**',
      'storybook-static',
      'storybook-static/**',
      'tests/browser/**',
      '.vercel',
      '.vercel/**',
      '.vercel-tmp',
      '.vercel-tmp/**',
      'android/**',
      'ios/**',
      '.playwright-cli',
      '.playwright-cli/**',
      'src/core/architecture.test.ts',
      '.record.cjs',
      '*.debug.cjs',
      '.freebuff/**',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      complexity: ['warn', { max: 16 }],
      'prefer-const': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'no-undef': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    },
  },
  // Frontend surfaces paint from the semantic colour tokens. A raw palette
  // class (slate/cyan/white/…) or a hardcoded hex re-creates a second palette
  // authority, so the theme can no longer change in one place. Deliberate
  // exceptions are per line and must carry a reason: `// palette-exempt: <why>`.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { local: { rules: { 'no-raw-palette': noRawPalette } } },
    rules: { 'local/no-raw-palette': 'error' },
  },
  // The frontend's only permitted reference to the backend is the type-only error-code
  // contract seam (`src/features/billing/billing.error-codes.ts`). `allowTypeImports`
  // keeps that reference erased at build time; a value import would make the two
  // deployments depend on each other, which is what the boundary exists to prevent.
  // `.dependency-cruiser.mjs` narrows the same boundary to the contracts path.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/backend/**'],
              allowTypeImports: true,
              message:
                'src/ may import only types from backend/ (the error-code contract), never values.',
            },
          ],
        },
      ],
    },
  },
  {
    extends: [js.configs.recommended],
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        self: 'readonly',
        caches: 'readonly',
        __ENV: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  // Logger is explicitly allowed to use console
  {
    files: ['src/shared/logger/**'],
    rules: { 'no-console': 'off' },
  },
  // Test/integration files — allow any and console
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/tests/**', '**/smoke.test.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Auth callback — console used for debugging/logging
  {
    files: ['src/pages/AuthCallbackPage.tsx'],
    rules: { 'no-console': 'off' },
  },
  // Backend server — console used for startup/shutdown logging
  {
    files: ['backend/src/server.ts'],
    rules: { 'no-console': 'off' },
  },
  // Vite config — console used for circular dependency warnings
  {
    files: ['vite.config.ts'],
    rules: { 'no-console': 'off' },
  }
);
