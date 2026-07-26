#!/usr/bin/env node
/**
 * audit-tokens.mjs — flag hardcoded design values outside the token layer.
 * Warnings only; never fails CI.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src";
const IGNORE_FILES = new Set([
  "src/index.css",
  "src/lib/brandTokens.ts",
  "src/integrations/supabase/client.ts",
  "src/integrations/supabase/types.ts",
]);
const IGNORE_DIRS = new Set(["src/components/ui", "src/admin"]);

const PATTERNS = [
  { name: "raw-hex",       re: /#[0-9a-fA-F]{6}\b/g },
  { name: "arbitrary-shadow", re: /shadow-\[[^\]]+\]/g },
  { name: "arbitrary-radius", re: /rounded-\[[^\]]+\]/g },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (IGNORE_DIRS.has(p)) continue;
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if ([".ts", ".tsx", ".css"].includes(extname(p))) out.push(p);
  }
  return out;
}

const findings = [];
for (const file of walk(ROOT)) {
  if (IGNORE_FILES.has(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const { name, re } of PATTERNS) {
    let m;
    while ((m = re.exec(text))) {
      const line = text.slice(0, m.index).split("\n").length;
      findings.push({ file, line, name, snippet: m[0] });
    }
  }
}

if (!findings.length) {
  console.log("✓ audit-tokens: no hardcoded design values found.");
  process.exit(0);
}

console.log(`⚠ audit-tokens: ${findings.length} finding(s)`);
const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}
for (const [file, list] of byFile) {
  console.log(`\n${file}`);
  for (const f of list) console.log(`  ${f.line}: [${f.name}] ${f.snippet}`);
}
process.exit(0);
