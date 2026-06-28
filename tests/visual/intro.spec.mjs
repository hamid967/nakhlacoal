// Automated visual tests for the Splash/Intro screen.
// Captures screenshots in dark + light themes and asserts no
// unwanted green-dominant pixels appear in the gradients.
//
// Run with:  node tests/visual/intro.spec.mjs
// Output:    tests/visual/__screenshots__/*.png  + JSON report

import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "__screenshots__");
fs.mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE_URL || "http://localhost:8080";
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 1366 },
  { name: "mobile", width: 390, height: 844 },
];
const THEMES = ["dark", "light"];

// Pixel is "unwanted green" if green channel dominates noticeably and
// the color is saturated (not a neutral gray). Gold/cream tones are
// red/yellow dominant so they pass.
function isUnwantedGreen(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 25) return false;          // near-grayscale → ignore
  return g > r + 12 && g > b + 12;            // green channel dominant
}

async function sample(buffer) {
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;
  let total = 0, bad = 0;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      total++;
      if (isUnwantedGreen(data[i], data[i + 1], data[i + 2])) bad++;
    }
  }
  return { total, bad, ratio: bad / total };
}

async function captureOne(browser, { name, width, height }, theme) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  // Ensure splash shows (clear session gate) before navigation
  await page.addInitScript(() => {
    try { sessionStorage.clear(); localStorage.removeItem("theme"); } catch {}
  });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  // Force theme class on <html> in case app uses class-based dark mode
  await page.evaluate((t) => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
    root.style.colorScheme = t;
  }, theme);
  // Wait for splash to be visible
  await page.waitForTimeout(1200);
  const file = path.join(OUT, `intro-${theme}-${name}.png`);
  const buf = await page.screenshot({ path: file });
  const stats = await sample(buf);
  await ctx.close();
  return { theme, viewport: name, file, ...stats };
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  let failed = false;
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const r = await captureOne(browser, vp, theme);
      // Allow up to 0.5% saturated-green pixels (decorative accents)
      const pass = r.ratio < 0.005;
      if (!pass) failed = true;
      results.push({ ...r, pass });
      console.log(
        `${pass ? "PASS" : "FAIL"}  ${theme.padEnd(5)} ${r.viewport.padEnd(7)} ` +
        `green=${(r.ratio * 100).toFixed(3)}%  → ${path.relative(process.cwd(), r.file)}`
      );
    }
  }
  await browser.close();
  fs.writeFileSync(
    path.join(OUT, "report.json"),
    JSON.stringify(results, null, 2)
  );
  if (failed) {
    console.error("\n❌ Visual regression: unwanted green tint detected in intro.");
    process.exit(1);
  } else {
    console.log("\n✅ All intro snapshots clean (no unwanted green).");
  }
})();
