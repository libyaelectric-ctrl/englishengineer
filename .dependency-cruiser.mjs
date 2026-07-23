/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'Barrel export * döngüsel bağımlılık üretir. Named export kullan veya doğrudan dosyadan import et.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-ui-imports-from-backend',
      comment:
        'Frontend UI code (src/) must not import from backend (backend/). These are separate deployment targets.',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^backend/' },
    },
    {
      name: 'no-backend-imports-from-ui',
      comment:
        'Backend code (backend/) must not import from frontend (src/). These are separate deployment targets.',
      severity: 'error',
      from: { path: '^backend/' },
      to: { path: '^src/' },
    },
    {
      name: 'no-feature-to-feature-imports',
      comment:
        'Features must not import from other features. Use core/shared for cross-feature communication.',
      severity: 'error',
      from: { path: '^src/features/[^/]+/' },
      to: { path: '^src/features/[^/]+/(?!index)' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: false,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'],
    },
  },
};
