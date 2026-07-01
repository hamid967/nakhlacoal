#!/usr/bin/env node
/**
 * Palm Charcoal — Audit Bot
 * Playwright-based comprehensive site scan.
 *
 * Usage:
 *   node scripts/audit-bot.mjs [--base=http://localhost:8080] [--json=report.json] [--md=report.md]
 *
 * Requires: `npm i -D playwright` and `npx playwright install chromium`
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const BASE = args.base || process.env.AUDIT_BASE || "http://localhost:8080";
const JSON_OUT = args.json || "audit-report.json";
const MD_OUT = args.md || "audit-report.md";

const ROUTES = [
  "/", "/products", "/quality", "/trademarks", "/wholesale",
  "/quote", "/checkout", "/about", "/contact",
  "/auth", "/portal/login", "/faq", "/pricing",
];

const SEVERITY = { P0: 0, P1: 1, P2: 2, P3: 3 };

/** Fix suggestion catalog — matched by rule id. */
const FIX_CATALOG = {
  slow_dcl:      "Wrap heavy 3D/canvas components with React.lazy + Suspense, and prefer `frameloop=\"demand\"` for r3f.",
  http_error:    "Verify the route is registered in the router and not accidentally guarded by ProtectedRoute for public pages.",
  missing_title: "Use <SEO title=\"...\" /> per route; keep < 60 chars and unique.",
  short_desc:    "Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.",
  duplicate_desc:"Same description used on multiple routes — differentiate to avoid SEO duplication penalties.",
  missing_h1:    "Every page needs exactly one <h1>; use semantic hierarchy for the rest.",
  multiple_h1:   "Reduce to a single <h1>; convert extras to <h2>.",
  img_no_alt:    "Add descriptive alt text (or alt=\"\" for decorative). Enforce via lint rule jsx-a11y/alt-text.",
  console_error: "Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.",
  net_401:       "Public queries returning 401 — either sign in the request or scope the RLS policy to allow anon SELECT on public columns.",
  net_5xx:       "Server error from Edge Function — check function logs and add try/catch + graceful UI fallback.",
  csp_meta:      "`frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.",
  no_lang:       "Set <html lang=\"ar\" dir=\"rtl\"> (or per-locale) to help SEO + screen readers.",
};

function classify(rule, ctx = {}) {
  // Priority assignment
  if (["http_error", "net_5xx"].includes(rule)) return "P0";
  if (["slow_dcl", "net_401", "missing_h1", "missing_title"].includes(rule)) return "P0";
  if (["img_no_alt", "duplicate_desc", "short_desc", "multiple_h1"].includes(rule)) return "P1";
  if (["console_error", "csp_meta", "no_lang"].includes(rule)) return "P2";
  return "P3";
}

async function auditRoute(context, route) {
  const findings = [];
  const page = await context.newPage();
  const consoleErrors = [];
  const netErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e.message || e)));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("response", (r) => {
    const s = r.status();
    if (s >= 400) netErrors.push({ url: r.url(), status: s });
  });

  const t0 = Date.now();
  let status = 0;
  try {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 25_000 });
    status = resp?.status() ?? 0;
  } catch (e) {
    findings.push({ rule: "slow_dcl", detail: `DCL timeout: ${e.message}` });
    await page.close();
    return { route, status: 0, timing: Date.now() - t0, findings };
  }
  const timing = Date.now() - t0;
  try { await page.waitForSelector("h1, main, [role=main]", { timeout: 3000 }); } catch {}
  await page.waitForTimeout(500);

  if (status >= 400) findings.push({ rule: "http_error", detail: `HTTP ${status}` });
  if (timing > 8000) findings.push({ rule: "slow_dcl", detail: `DCL ${timing}ms` });

  const meta = await page.evaluate(() => ({
    title: document.title || "",
    desc: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
    lang: document.documentElement.lang || "",
    h1Count: document.querySelectorAll("h1").length,
    imgsNoAlt: [...document.images].filter((i) => !i.getAttribute("alt")).length,
    cspMeta: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
  }));

  if (!meta.title) findings.push({ rule: "missing_title" });
  if (!meta.desc) findings.push({ rule: "short_desc", detail: "missing" });
  else if (meta.desc.length < 80) findings.push({ rule: "short_desc", detail: `${meta.desc.length} chars` });
  if (meta.h1Count === 0) findings.push({ rule: "missing_h1" });
  if (meta.h1Count > 1) findings.push({ rule: "multiple_h1", detail: `${meta.h1Count} h1s` });
  if (meta.imgsNoAlt > 0) findings.push({ rule: "img_no_alt", detail: `${meta.imgsNoAlt} imgs` });
  if (!meta.lang) findings.push({ rule: "no_lang" });
  if (meta.cspMeta) findings.push({ rule: "csp_meta" });

  for (const n of netErrors) {
    if (n.status === 401) findings.push({ rule: "net_401", detail: n.url });
    else if (n.status >= 500) findings.push({ rule: "net_5xx", detail: `${n.status} ${n.url}` });
  }
  const uniqErr = [...new Set(consoleErrors)].slice(0, 3);
  for (const e of uniqErr) findings.push({ rule: "console_error", detail: e.slice(0, 200) });

  await page.close();
  return { route, status, timing, meta, findings };
}

function detectDuplicateDescriptions(results) {
  const map = new Map();
  for (const r of results) {
    const d = r.meta?.desc;
    if (!d) continue;
    map.set(d, (map.get(d) || []).concat(r.route));
  }
  for (const [desc, routes] of map) {
    if (routes.length > 1) {
      for (const rt of routes) {
        const r = results.find((x) => x.route === rt);
        r?.findings.push({ rule: "duplicate_desc", detail: `shared with ${routes.filter((x) => x !== rt).join(", ")}` });
      }
    }
  }
}

function toMarkdown(results) {
  const rows = [];
  const buckets = { P0: [], P1: [], P2: [], P3: [] };
  for (const r of results) {
    for (const f of r.findings) {
      const sev = classify(f.rule);
      buckets[sev].push({ ...f, route: r.route, sev });
    }
  }
  let md = `# Palm Charcoal — Audit Report\n\n`;
  md += `Base: \`${BASE}\` · Generated: ${new Date().toISOString()}\n\n`;
  md += `## Summary\n\n`;
  md += `| Priority | Count |\n|---|---|\n`;
  for (const k of ["P0","P1","P2","P3"]) md += `| ${k} | ${buckets[k].length} |\n`;
  md += `\n## Route timings\n\n| Route | Status | DCL (ms) | Findings |\n|---|---|---|---|\n`;
  for (const r of results) md += `| ${r.route} | ${r.status} | ${r.timing} | ${r.findings.length} |\n`;
  for (const k of ["P0","P1","P2","P3"]) {
    if (!buckets[k].length) continue;
    md += `\n## ${k} — ${buckets[k].length} finding(s)\n\n`;
    for (const f of buckets[k]) {
      md += `- **${f.route}** · \`${f.rule}\`${f.detail ? ` — ${f.detail}` : ""}\n  - Fix: ${FIX_CATALOG[f.rule] || "Investigate."}\n`;
    }
  }
  return md;
}

(async () => {
  console.log(`[audit-bot] scanning ${ROUTES.length} routes at ${BASE}`);
  const fsSync = await import("node:fs");
  const candidates = [
    process.env.AUDIT_CHROME,
    "/chromium-1194/chrome-linux/chrome",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  ].filter(Boolean);
  const executablePath = candidates.find((p) => { try { return fsSync.existsSync(p); } catch { return false; } });
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const results = [];
  for (const r of ROUTES) {
    process.stdout.write(`  · ${r} ... `);
    const res = await auditRoute(context, r);
    console.log(`${res.status || "ERR"} (${res.timing}ms, ${res.findings.length} findings)`);
    results.push(res);
  }
  await browser.close();
  detectDuplicateDescriptions(results);

  await fs.mkdir(path.dirname(JSON_OUT) || ".", { recursive: true });
  await fs.writeFile(JSON_OUT, JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), results }, null, 2));
  const md = toMarkdown(results);
  await fs.writeFile(MD_OUT, md);
  console.log(`\n[audit-bot] wrote ${JSON_OUT} and ${MD_OUT}`);

  const p0 = results.flatMap((r) => r.findings.filter((f) => classify(f.rule) === "P0"));
  if (p0.length) {
    console.log(`\n[audit-bot] ${p0.length} P0 finding(s) — exiting with code 1`);
    process.exit(1);
  }
})();
