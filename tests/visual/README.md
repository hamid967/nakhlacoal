# Intro Visual Tests

Automated Playwright snapshots of the Splash/Intro screen across
`dark` + `light` themes and 3 viewports. Catches two classes of
regression:

1. **Color regression** — fails if >0.5% of pixels turn green
   (guards the emerald → neutral fix).
2. **Layout regression** — diffs each snapshot against a stored
   baseline; fails if >2% of pixels changed.

## Commands

```bash
# Run the suite (dev server must be on :8080)
npm run test:intro

# Update baselines after an intentional visual change
npm run test:intro:update
```

## Artifacts

```
tests/visual/__baseline__/      # committed baseline PNGs
tests/visual/__screenshots__/   # latest run output + report.json
tests/visual/__screenshots__/__diff__/   # red-highlighted diffs on failure
```

## CI hook

```yaml
- run: npm run test:intro
```

First run on a fresh checkout auto-creates baselines and passes;
subsequent runs gate on pixel diff + green-tint thresholds.
