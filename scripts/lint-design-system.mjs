#!/usr/bin/env node
/**
 * Palm Charcoal — Design System Lint
 * Blocks new code from introducing tokens outside .lovable/design-system.md.
 *
 * Scans src/ (excluding the design system source-of-truth files) for:
 *   • Raw hex colors        e.g. #1a2b3c
 *   • Raw rgb()/rgba()/hsl() literals in JSX/TSX
 *   • Forbidden Tailwind color utilities (text-white, bg-black, text-[#...], bg-[#...])
 *   • Ad-hoc font-family declarations
 *   • Inline pixel spacing in `style={{ padding/margin/gap: ... }}` (use tokens instead)
 *   • Ambiguous Tailwind duration utility `duration-[Xms]`  (use `[transition-duration:Xms]`)
 *
 * Exit 1 on violation. Run via:  bun run lint:design
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/** Files exempt from the lint (the design-system source-of-truth). */
const ALLOWLIST = new Set([
  "src/index.css",
  "src/styles.css",
  "tailwind.config.ts",
  "tailwind.config.js",
  "src/components/ui-lux/index.tsx",
  "src/integrations/supabase/client.ts",
  "src/integrations/supabase/types.ts",
]);

/** Directories never scanned. */
const SKIP_DIRS = new Set(["ui", "node_modules", "dist", ".next", "build"]);

const EXTS = new Set([".ts", ".tsx", ".css"]);

const RULES = [
  {
    id: "no-raw-hex",
    re: /#[0-9a-fA-F]{3,8}\b/g,
    msg: "Raw hex color. Use HSL tokens from src/index.css.",
    skipIf: (line) => /\/\/|\/\*|url\(|svg|data:/.test(line),
  },
  {
    id: "no-raw-rgb-hsl",
    re: /\b(rgb|rgba|hsl|hsla)\s*\(/g,
    msg: "Raw color function. Use semantic tokens (hsl(var(--token))).",
    skipIf: (line, file) => file.endsWith(".css") || /var\(--/.test(line),
  },
  {
    id: "no-forbidden-tw-colors",
    re: /\b(text|bg|border|ring|from|to|via)-(white|black)\b/g,
    msg: "Forbidden Tailwind literal color. Use semantic tokens (foreground/background/primary/...).",
  },
  {
    id: "no-arbitrary-hex-tw",
    re: /\b(text|bg|border|ring|fill|stroke)-\[#[0-9a-fA-F]+\]/g,
    msg: "Arbitrary hex Tailwind utility. Add the color to index.css as an HSL token instead.",
  },
  {
    id: "no-font-family-inline",
    re: /font-family\s*:/g,
    msg: "Inline font-family. Use font-display / font-body / font-arabic.",
    skipIf: (_l, file) => file.endsWith(".css"),
  },
  {
    id: "no-inline-px-spacing",
    re: /style=\{\{[^}]*\b(padding|margin|gap)[A-Za-z]*\s*:\s*["'`]?\d+px/g,
    msg: "Inline pixel spacing. Use Tailwind spacing scale.",
  },
  {
    id: "no-ambiguous-duration",
    re: /\bduration-\[\d+ms\]/g,
    msg: "Ambiguous Tailwind duration. Use [transition-duration:Xms] instead.",
  },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXTS.has(extname(name))) out.push(full);
  }
  return out;
}

const violations = [];
const files = walk(SRC);

for (const file of files) {
  const rel = relative(ROOT, file).replaceAll("\\", "/");
  if (ALLOWLIST.has(rel)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      if (rule.skipIf?.(line, rel)) continue;
      const m = line.match(rule.re);
      if (m) {
        violations.push({ file: rel, line: i + 1, rule: rule.id, msg: rule.msg, snippet: m[0] });
      }
    }
  });
}

// Baseline: existing violations are grandfathered. CI fails only on NEW additions.
// Regenerate after intentional cleanup with: bun run lint:design -- --update-baseline
const BASELINE_PATH = join(ROOT, ".lovable/design-lint-baseline.json");
const keyOf = (v) => `${v.file}::${v.rule}::${v.snippet}`;

if (process.argv.includes("--update-baseline")) {
  const { writeFileSync, mkdirSync } = await import("node:fs");
  mkdirSync(join(ROOT, ".lovable"), { recursive: true });
  const baseline = [...new Set(violations.map(keyOf))].sort();
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n");
  console.log(`Baseline updated: ${baseline.length} grandfathered violation key(s).`);
  process.exit(0);
}

let baseline = new Set();
try {
  baseline = new Set(JSON.parse(readFileSync(BASELINE_PATH, "utf8")));
} catch {
  console.warn("⚠ No baseline file. Run: bun run lint:design -- --update-baseline");
}

const newViolations = violations.filter((v) => !baseline.has(keyOf(v)));

if (newViolations.length === 0) {
  console.log(`✓ design-system lint passed — ${violations.length} grandfathered, 0 new.`);
  process.exit(0);
}

console.error(`\n✗ design-system lint failed — ${newViolations.length} NEW violation(s) (baseline: ${baseline.size}):\n`);
for (const v of newViolations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${v.snippet}`);
  console.error(`    → ${v.msg}`);
}
console.error(
  `\nSee .lovable/design-system.md for allowed tokens. If you genuinely need a new token, add it there + src/index.css + tailwind.config.ts in the same PR.`
);
process.exit(1);

