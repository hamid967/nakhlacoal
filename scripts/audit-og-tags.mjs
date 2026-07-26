#!/usr/bin/env node
/**
 * Palm Charcoal — OG / Twitter / LocalBusiness tag auditor
 *
 * Crawls every route from public/sitemap.xml (or a custom list) with
 * Playwright, waits for react-helmet-async to hydrate, then verifies:
 *
 *   1. <meta property="og:image">          → absolute https + expected host + versioned
 *   2. <meta property="og:image:width|height">
 *   3. <meta name="twitter:image">          → matches og:image
 *   4. <meta name="twitter:card">           → "summary_large_image"
 *   5. <meta property="og:title|description|url|type">
 *   6. LocalBusiness JSON-LD present on `/` and `/location`
 *      with required fields: name, address, telephone, geo, openingHoursSpecification
 *
 * Usage:
 *   node scripts/audit-og-tags.mjs [--base=http://localhost:8080]
 *                                  [--expect-host=alnakhlacoal.com]
 *                                  [--expect-image-version=20260726]
 *                                  [--json=og-audit.json]
 *                                  [--routes=/,/products,/about]
 *   AUDIT_BASE=https://alnakhlacoal.com node scripts/audit-og-tags.mjs
 *
 * Exits non-zero when any P0/P1 finding is detected.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

// ---------- args ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const BASE = (args.base || process.env.AUDIT_BASE || "http://localhost:8080").replace(/\/$/, "");
const EXPECT_HOST = args["expect-host"] || "alnakhlacoal.com";
const EXPECT_IMG_VERSION = args["expect-image-version"] || "20260726";
const EXPECT_IMG_PATH = "/og-image.png";
const JSON_OUT = args.json || "og-audit.json";
const LOCALBUSINESS_ROUTES = new Set(["/", "/location"]);

// ---------- route discovery ----------
async function loadRoutes() {
  if (args.routes) {
    return String(args.routes).split(",").map((r) => r.trim()).filter(Boolean);
  }
  try {
    const xml = await fs.readFile(path.resolve("public/sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
    const paths = locs
      .map((u) => {
        try {
          return new URL(u).pathname || "/";
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    // Dedupe, keep order.
    return [...new Set(paths)];
  } catch {
    return ["/", "/products", "/about", "/quality", "/contact", "/faq", "/location"];
  }
}

// ---------- helpers ----------
function tagQueries() {
  return `
    (() => {
      const pick = (sel, attr = "content") => {
        const el = document.head.querySelector(sel);
        return el ? el.getAttribute(attr) : null;
      };
      const jsonLdBlocks = [...document.head.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => {
          try { return JSON.parse(s.textContent || "null"); } catch { return null; }
        })
        .filter(Boolean);
      // Flatten @graph entries so LocalBusiness inside a graph is discoverable.
      const flat = [];
      for (const block of jsonLdBlocks) {
        if (Array.isArray(block)) flat.push(...block);
        else if (block && Array.isArray(block["@graph"])) flat.push(...block["@graph"]);
        else flat.push(block);
      }
      return {
        ogTitle: pick('meta[property="og:title"]'),
        ogDesc: pick('meta[property="og:description"]'),
        ogUrl: pick('meta[property="og:url"]'),
        ogType: pick('meta[property="og:type"]'),
        ogImage: pick('meta[property="og:image"]'),
        ogImageW: pick('meta[property="og:image:width"]'),
        ogImageH: pick('meta[property="og:image:height"]'),
        twCard: pick('meta[name="twitter:card"]'),
        twImage: pick('meta[name="twitter:image"]'),
        twTitle: pick('meta[name="twitter:title"]'),
        twDesc: pick('meta[name="twitter:description"]'),
        canonical: pick('link[rel="canonical"]', 'href'),
        jsonLd: flat,
      };
    })()
  `;
}

function checkImage(url, findings, kind) {
  if (!url) {
    findings.push({ severity: "P0", rule: `missing_${kind}`, detail: `${kind} tag missing` });
    return;
  }
  if (!/^https:\/\//i.test(url)) {
    findings.push({ severity: "P0", rule: `${kind}_not_absolute`, detail: url });
  }
  try {
    const u = new URL(url);
    if (u.hostname !== EXPECT_HOST) {
      findings.push({
        severity: "P1",
        rule: `${kind}_wrong_host`,
        detail: `expected ${EXPECT_HOST}, got ${u.hostname}`,
      });
    }
    if (u.pathname !== EXPECT_IMG_PATH) {
      findings.push({
        severity: "P1",
        rule: `${kind}_wrong_path`,
        detail: `expected ${EXPECT_IMG_PATH}, got ${u.pathname}`,
      });
    }
    if (EXPECT_IMG_VERSION && u.searchParams.get("v") !== EXPECT_IMG_VERSION) {
      findings.push({
        severity: "P1",
        rule: `${kind}_stale_version`,
        detail: `expected ?v=${EXPECT_IMG_VERSION}, got ?v=${u.searchParams.get("v") || "(none)"}`,
      });
    }
  } catch {
    findings.push({ severity: "P0", rule: `${kind}_invalid_url`, detail: url });
  }
}

function checkLocalBusiness(jsonLd, findings) {
  const lb = jsonLd.find((n) => {
    const t = n && n["@type"];
    return t === "LocalBusiness" || (Array.isArray(t) && t.includes("LocalBusiness"));
  });
  if (!lb) {
    findings.push({ severity: "P0", rule: "localbusiness_missing", detail: "no LocalBusiness JSON-LD in <head>" });
    return;
  }
  const required = ["name", "address", "telephone", "geo", "openingHoursSpecification"];
  for (const key of required) {
    if (!lb[key]) {
      findings.push({
        severity: "P1",
        rule: `localbusiness_missing_${key}`,
        detail: `LocalBusiness.${key} missing`,
      });
    }
  }
  if (lb.address && !lb.address.addressCountry) {
    findings.push({
      severity: "P2",
      rule: "localbusiness_address_incomplete",
      detail: "address.addressCountry missing",
    });
  }
  if (lb.image) {
    // Reuse image check (soft — warn only).
    const before = findings.length;
    checkImage(lb.image, findings, "localbusiness_image");
    // Downgrade any P0 from the image check to P2 here (it's optional metadata).
    for (let i = before; i < findings.length; i++) {
      if (findings[i].severity === "P0") findings[i].severity = "P2";
    }
  }
}

async function auditRoute(context, route) {
  const url = `${BASE}${route}`;
  const findings = [];
  const page = await context.newPage();
  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    status = resp?.status() ?? 0;
    if (!resp || !resp.ok()) {
      findings.push({ severity: "P0", rule: "http_error", detail: `status ${status}` });
    }
    // Let helmet swap in per-route tags.
    await page.waitForTimeout(700);
    const tags = await page.evaluate(tagQueries());

    // Core OG
    if (!tags.ogTitle) findings.push({ severity: "P1", rule: "missing_og_title" });
    if (!tags.ogDesc) findings.push({ severity: "P1", rule: "missing_og_description" });
    if (!tags.ogUrl) findings.push({ severity: "P2", rule: "missing_og_url" });
    if (!tags.ogType) findings.push({ severity: "P2", rule: "missing_og_type" });

    // Image checks
    checkImage(tags.ogImage, findings, "og_image");
    checkImage(tags.twImage, findings, "twitter_image");

    if (tags.ogImage && tags.twImage && tags.ogImage !== tags.twImage) {
      findings.push({
        severity: "P2",
        rule: "og_twitter_image_mismatch",
        detail: `og:image=${tags.ogImage} vs twitter:image=${tags.twImage}`,
      });
    }
    if (tags.ogImageW !== "1200" || tags.ogImageH !== "630") {
      findings.push({
        severity: "P2",
        rule: "og_image_dimensions",
        detail: `expected 1200x630, got ${tags.ogImageW}x${tags.ogImageH}`,
      });
    }

    // Twitter card
    if (tags.twCard !== "summary_large_image") {
      findings.push({
        severity: "P1",
        rule: "twitter_card_wrong",
        detail: `expected summary_large_image, got ${tags.twCard || "(none)"}`,
      });
    }
    if (!tags.twTitle) findings.push({ severity: "P2", rule: "missing_twitter_title" });
    if (!tags.twDesc) findings.push({ severity: "P2", rule: "missing_twitter_description" });

    // LocalBusiness (only on routes that must carry it)
    if (LOCALBUSINESS_ROUTES.has(route)) {
      checkLocalBusiness(tags.jsonLd, findings);
    }

    return { route, url, status, ok: findings.length === 0, findings, tags };
  } catch (err) {
    findings.push({ severity: "P0", rule: "audit_exception", detail: String(err?.message || err) });
    return { route, url, status, ok: false, findings, tags: null };
  } finally {
    await page.close();
  }
}

// ---------- main ----------
(async () => {
  const routes = await loadRoutes();
  console.log(`\n🔎 OG/Twitter/LocalBusiness audit — ${routes.length} routes against ${BASE}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  const results = [];
  // Serial keeps the dev server calm and log output readable.
  for (const r of routes) {
    const res = await auditRoute(context, r);
    results.push(res);
    const badge = res.ok ? "✅" : "❌";
    const worst = res.findings.reduce(
      (acc, f) => (["P0", "P1", "P2", "P3"].indexOf(f.severity) < ["P0", "P1", "P2", "P3"].indexOf(acc) ? f.severity : acc),
      "P3"
    );
    console.log(
      `${badge} ${r.padEnd(38)}  ${res.status}  ${res.findings.length} finding(s)${
        res.findings.length ? `  [worst ${worst}]` : ""
      }`
    );
    for (const f of res.findings) {
      console.log(`      · [${f.severity}] ${f.rule}${f.detail ? ` — ${f.detail}` : ""}`);
    }
  }

  await browser.close();

  const summary = {
    base: BASE,
    expectHost: EXPECT_HOST,
    expectImagePath: EXPECT_IMG_PATH,
    expectImageVersion: EXPECT_IMG_VERSION,
    generatedAt: new Date().toISOString(),
    totals: {
      routes: results.length,
      passing: results.filter((r) => r.ok).length,
      failing: results.filter((r) => !r.ok).length,
      p0: results.reduce((n, r) => n + r.findings.filter((f) => f.severity === "P0").length, 0),
      p1: results.reduce((n, r) => n + r.findings.filter((f) => f.severity === "P1").length, 0),
      p2: results.reduce((n, r) => n + r.findings.filter((f) => f.severity === "P2").length, 0),
    },
    results,
  };
  await fs.writeFile(JSON_OUT, JSON.stringify(summary, null, 2), "utf8");
  console.log(
    `\n📄 Wrote ${JSON_OUT}  —  ${summary.totals.passing}/${summary.totals.routes} passing, ` +
      `${summary.totals.p0} P0 / ${summary.totals.p1} P1 / ${summary.totals.p2} P2\n`
  );

  process.exit(summary.totals.p0 + summary.totals.p1 > 0 ? 1 : 0);
})().catch((err) => {
  console.error("audit-og-tags failed:", err);
  process.exit(2);
});
