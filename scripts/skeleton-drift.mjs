#!/usr/bin/env node
/**
 * Live Skeleton-vs-Content drift report.
 *
 * Boots a Vite preview, loads Home at mobile/tablet/desktop, measures each
 * lazy section's real rendered height, compares it to the reserved
 * SectionSkeleton min-h, prints a per-breakpoint delta table, and exits
 * with code 1 if any section drifts outside the CLS budget.
 *
 * Usage:  npm run test:skeletons:live
 * Env:    BASE_URL=http://localhost:8080  (defaults to that)
 *         DRIFT_TOLERANCE_PX=120          (allowed |Δ| before failing)
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const TOL = Number(process.env.DRIFT_TOLERANCE_PX || 200);

// Must stay in sync with src/components/SectionSkeleton.tsx HEIGHTS.
const RESERVED = {
  hero: null, // 70vh — computed per viewport
  grid: 640,
  timeline: 720,
  band: 460,
  press: 300,
  awards: 320,
  constellation: 580,
  film: 720,
  cases: 720,
  map: 900,
};

// Order of Suspense sections on Home (src/pages/Home.tsx).
const LAYOUT = [
  ['hero', 'BrandHero'],
  ['band', 'ProductShowcase3D'],
  ['grid', 'CertificationsWall'],
  ['timeline', 'BrandTimeline'],
  ['press', 'PressLogos'],
  ['awards', 'AwardsRibbon'],
  ['grid', 'TrademarksShowcase'],
  ['constellation', 'PartnersConstellation'],
  ['band', 'TestimonialsMarquee'],
  ['film', 'StoryFilm'],
  ['grid', 'InsightsEditorial'],
  ['grid', 'SustainabilityReport'],
  ['band', 'CareersInvite'],
  ['cases', 'CaseStudies'],
  ['map', 'GlobalPresence'],
  ['band', 'CinematicCTA'],
];

const VIEWPORTS = [
  ['mobile', 390, 844],
  ['tablet', 768, 1024],
  ['desktop', 1440, 900],
];

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

async function measure(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((el) =>
      Math.round(el.getBoundingClientRect().height),
    ),
  );
}

const rows = [];
const browser = await chromium.launch();
try {
  for (const [name, w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    for (let y = 0; y < 25_000; y += 700) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
    }
    await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(500);
    const heights = await measure(page);
    const heroReserve = Math.round(h * 0.7);
    LAYOUT.forEach(([variant, label], i) => {
      const reserved = variant === 'hero' ? heroReserve : RESERVED[variant];
      const real = heights[i] ?? null;
      const delta = real == null || reserved == null ? null : real - reserved;
      rows.push({ breakpoint: name, i, variant, label, reserved, real, delta });
    });
    await ctx.close();
  }
} finally {
  await browser.close();
}

const failures = rows.filter((r) => r.delta != null && Math.abs(r.delta) > TOL);

for (const bp of VIEWPORTS.map((v) => v[0])) {
  console.log(`\n=== ${bp} ===`);
  console.log(
    `${pad('#', 3)}${pad('variant', 15)}${padL('reserved', 10)}${padL('real', 8)}${padL('Δpx', 8)}  section`,
  );
  for (const r of rows.filter((x) => x.breakpoint === bp)) {
    const drift = r.delta != null && Math.abs(r.delta) > TOL;
    const mark = r.delta == null ? '—' : drift ? '❌' : '✅';
    console.log(
      `${pad(r.i, 3)}${pad(r.variant, 15)}${padL(r.reserved ?? '—', 10)}${padL(r.real ?? '—', 8)}${padL(r.delta ?? '—', 8)}  ${mark} ${r.label}`,
    );
  }
}

if (failures.length) {
  console.error(
    `\n✖ ${failures.length} section(s) drifted more than ${TOL}px from the reserved skeleton:`,
  );
  for (const f of failures) {
    console.error(
      `  • [${f.breakpoint}] ${f.label} (${f.variant}) reserved=${f.reserved}px real=${f.real}px Δ=${f.delta}px`,
    );
  }
  console.error(
    `\nFix: update HEIGHTS in src/components/SectionSkeleton.tsx and FLOOR_PX in the vitest baseline.`,
  );
  process.exit(1);
} else {
  console.log(`\n✔ All sections within ±${TOL}px of the reserved skeleton height.`);
}
