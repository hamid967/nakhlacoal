#!/usr/bin/env node
/**
 * Admin token audit — scans src/ for `var(--a-*)` usage and fails if any
 * referenced token is not defined in src/admin/admin.css.
 *
 * Run: `node scripts/audit-admin-tokens.mjs` (or `bun run audit:admin-tokens`)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname, sep } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const ADMIN_CSS = join(ROOT, 'src/admin/admin.css');

const EXTS = new Set(['.ts', '.tsx', '.css', '.js', '.jsx']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next']);

const USE_RE = /var\(\s*(--a-[a-zA-Z0-9_-]+)\s*(?:,[^)]*)?\)/g;
const DEF_RE = /(--a-[a-zA-Z0-9_-]+)\s*:/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXTS.has(extname(name))) out.push(p);
  }
  return out;
}

// 1) Collect defined tokens from admin.css
const adminCss = readFileSync(ADMIN_CSS, 'utf8');
const defined = new Set();
for (const m of adminCss.matchAll(DEF_RE)) defined.add(m[1]);

// 2) Scan all source files for usages
const usages = new Map(); // token -> [{file, line}]
for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    USE_RE.lastIndex = 0;
    let m;
    while ((m = USE_RE.exec(line)) !== null) {
      const token = m[1];
      if (!usages.has(token)) usages.set(token, []);
      usages.get(token).push({
        file: relative(ROOT, file).split(sep).join('/'),
        line: i + 1,
      });
    }
  });
}

// 3) Diff
const missing = [];
for (const [token, locs] of usages) {
  if (!defined.has(token)) missing.push({ token, locs });
}

const unused = [...defined].filter((t) => !usages.has(t));

console.log(`Admin token audit:`);
console.log(`  defined in admin.css : ${defined.size}`);
console.log(`  referenced in src/   : ${usages.size}`);
if (unused.length) {
  console.log(`  ⚠ unused tokens (${unused.length}): ${unused.join(', ')}`);
}

if (missing.length === 0) {
  console.log(`✅ All var(--a-*) references resolve to admin.css tokens.`);
  process.exit(0);
}

console.error(`\n❌ ${missing.length} undefined admin token(s):\n`);
for (const { token, locs } of missing) {
  console.error(`  ${token}  (${locs.length} ref${locs.length > 1 ? 's' : ''})`);
  for (const l of locs.slice(0, 5)) console.error(`    ${l.file}:${l.line}`);
  if (locs.length > 5) console.error(`    … and ${locs.length - 5} more`);
}
console.error(`\nFix: add the missing token(s) to .admin-shell in src/admin/admin.css.`);
process.exit(1);
