#!/usr/bin/env node
/**
 * Automated layout audit for the Home page across mobile, tablet, and desktop.
 * Fails (exit 1) if any two top-level <section> elements overlap vertically,
 * or if the page has horizontal overflow.
 *
 * Usage:  node scripts/layout-audit.mjs [url]
 *   url defaults to http://localhost:8080/
 *
 * Requires: playwright (chromium). Install with `npx playwright install chromium`.
 */
import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://localhost:8080/';
const VIEWPORTS = [
  { name: 'mobile',  width: 390,  height: 844 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];
const TOLERANCE = 2; // px

let failed = false;

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.new_page ? await ctx.new_page() : await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Force lazy sections to mount by scrolling through the page.
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i <= 10; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (h * i) / 10);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    // Only inspect direct <section> children of <main> (top-level sections),
    // so structurally nested subsections are ignored.
    const main = document.querySelector('main') || document.body;
    const sections = [...main.querySelectorAll(':scope > section, :scope > * > section')]
      .filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el)));
    const rects = sections.map((s) => {
      const r = s.getBoundingClientRect();
      return {
        top: r.top + window.scrollY,
        bottom: r.bottom + window.scrollY,
        tag: s.tagName + '.' + (s.className || '').toString().slice(0, 40),
      };
    });
    return {
      rects,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  const overlaps = [];
  const sorted = [...result.rects].sort((a, b) => a.top - b.top);
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (b.top < a.bottom - TOLERANCE) overlaps.push({ a: a.tag, b: b.tag, delta: a.bottom - b.top });
  }

  const bad = overlaps.length > 0 || result.overflowX;
  failed = failed || bad;
  console.log(`\n[${vp.name} ${vp.width}x${vp.height}] sections=${result.rects.length} overflowX=${result.overflowX} (sw=${result.scrollWidth}, cw=${result.clientWidth})`);
  if (overlaps.length) {
    console.log('  Overlaps:');
    for (const o of overlaps) console.log(`   - ${o.a}  ⇄  ${o.b}   (Δ ${o.delta.toFixed(1)}px)`);
  } else {
    console.log('  ✓ No section overlap');
  }
  await ctx.close();
}
await browser.close();

if (failed) {
  console.error('\n✗ Layout audit failed');
  process.exit(1);
}
console.log('\n✓ Layout audit passed on all viewports');
