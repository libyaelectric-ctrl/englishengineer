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
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.75 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 6000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 8000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 1000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
