# Intro Visual Tests

Automated Playwright snapshots of the Splash/Intro screen across
`dark` + `light` themes and 3 viewports. Fails the run when the
gradient introduces unwanted green tones (regression guard for the
emerald→neutral fix).

## Run

```bash
# dev server must be running on :8080
python tests/visual/intro_visual_test.py
```

Screenshots and a `report.json` land in `tests/visual/__screenshots__/`.

## Threshold

A pixel counts as "unwanted green" when the green channel exceeds
red **and** blue by ≥12 on a saturated color (not a neutral gray).
The suite fails if more than **0.5%** of sampled pixels are green —
generous enough for any small accent, strict enough to catch a
green background or gradient regression.

## CI hook

Add to your pipeline after `npm run build && npm run preview &`:

```yaml
- run: python tests/visual/intro_visual_test.py
```
