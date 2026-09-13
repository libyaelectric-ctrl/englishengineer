module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run preview',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/vocabulary',
        'http://localhost:4173/dashboard',
      ],
      numberOfRuns: 2,
    },
    assert: {
      // The lighthouse:no-pwa preset adds unachievable assertions (e.g.
      // unused-javascript maxLength 0, network-dependency-tree-insight 0.9)
      // that no SPA can pass. Define explicit budgets instead.
      assertions: {
        'categories:performance': ['error', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 6000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 8000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 1000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
