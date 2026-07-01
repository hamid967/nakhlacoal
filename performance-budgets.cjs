// Performance budgets — enforced by Lighthouse CI on the Home route.
// Any breach here fails the build (assertion level: "error").
// See lighthouserc.cjs → ci.assert.assertions
module.exports = [
  {
    path: '/*',
    timings: [
      // DCL proxy — Lighthouse doesn't expose raw DCL, so we gate the two
      // metrics that most closely track it: FCP (first paint) and Interactive.
      { metric: 'first-contentful-paint', budget: 2000 },
      { metric: 'interactive', budget: 4000 },
      { metric: 'largest-contentful-paint', budget: 3000 },
      { metric: 'total-blocking-time', budget: 250 },
    ],
    resourceSizes: [
      { resourceType: 'script', budget: 400 },   // KB
      { resourceType: 'image', budget: 800 },
      { resourceType: 'total', budget: 1800 },
    ],
    resourceCounts: [
      { resourceType: 'third-party', budget: 15 },
    ],
  },
];
