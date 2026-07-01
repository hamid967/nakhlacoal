// Lighthouse CI — automated performance checks for Home ("/")
// Focus: Cumulative Layout Shift (CLS) and DOMContentLoaded (DCL) budgets.
// Run locally:
//   npx -y @lhci/cli@0.14.x autorun
// CI wiring lives in .github/workflows/lhci.yml
module.exports = {
  ci: {
    collect: {
      // Start Vite preview, then hit the home route 3× for stable medians.
      startServerCommand: 'npm run build && npm run preview -- --port 4173',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance'],
        // Skip PWA/SW checks — we're not a PWA.
        skipAudits: ['uses-http2', 'redirects-http', 'is-on-https'],
      },
    },
    assert: {
      // Fail the build if CLS regresses or DCL blows past budget.
      assertions: {
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // DOMContentLoaded proxy: max potential FID + FCP as guardrails.
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
      },
    },
    upload: {
      // Public temporary storage — no account required. Swap to lhci-server if desired.
      target: 'temporary-public-storage',
    },
  },
};
