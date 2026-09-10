module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run preview',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/vocabulary',
        'http://localhost:4173/dashboard',
      ],
      numberOfRuns: 1,
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.3 }],
        'categories:accessibility': ['warn', { minScore: 0.75 }],
        'categories:best-practices': ['warn', { minScore: 0.75 }],
        'categories:seo': ['warn', { minScore: 0.7 }],
        'errors-in-console': 'warn',
        'font-size': 'warn',
        'network-dependency-tree-insight': 'warn',
        'skip-link': 'warn',
        'unsized-images': 'warn',
        'unused-javascript': 'warn',
        'uses-rel-preconnect': 'warn',
        'forced-reflow-insight': 'warn',
        'color-contrast': 'warn',
        'first-contentful-paint': ['warn', { maxNumericValue: 7000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 9000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
