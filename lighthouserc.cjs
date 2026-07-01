// Lighthouse CI — enforces performance budgets on Home ("/").
// Build fails on: CLS > 0.1, FCP > 2s, TTI > 4s, or any budget breach.
// Run locally: npx -y @lhci/cli@0.14.x autorun
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run preview -- --port 4173',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance'],
        budgetsPath: './performance-budgets.cjs',
        skipAudits: ['uses-http2', 'redirects-http', 'is-on-https'],
      },
    },
    assert: {
      // Hard budgets — any breach FAILS the build.
      assertions: {
        'cumulative-layout-shift':   ['error', { maxNumericValue: 0.1 }],
        'first-contentful-paint':    ['error', { maxNumericValue: 2000 }],
        'interactive':               ['error', { maxNumericValue: 4000 }],
        'largest-contentful-paint':  ['error', { maxNumericValue: 3000 }],
        'total-blocking-time':       ['error', { maxNumericValue: 250 }],
        'speed-index':               ['warn',  { maxNumericValue: 4000 }],
        // Enforce the resource/timing budgets from performance-budgets.cjs
        'performance-budget':        ['error', { minScore: 1 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
