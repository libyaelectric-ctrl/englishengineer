module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run preview',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/vocabulary',
        'http://localhost:4173/dashboard'
      ],
      numberOfRuns: 2
    },
    assert: {
      preset: 'lighthouse:no-pwa',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
