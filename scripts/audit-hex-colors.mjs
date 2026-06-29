#!/usr/bin/env node
/**
 * Hex Color Audit — Palm Charcoal
 * Scans src/ for direct hex literals (#RGB / #RRGGBB / #RRGGBBAA) and fails
 * if any are found outside the documented exceptions.
 *
 * Run: `node scripts/audit-hex-colors.mjs` (or `bun run audit:colors`)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/** Files allowed to contain raw hex (brand-locked / data / 3D / debug). */
const ALLOWLIST = new Set([
  // External brand colors (social, OAuth, WhatsApp)
  'src/components/Footer.tsx',
  'src/features/auth/OAuthButtons.tsx',
  'src/components/AssistantWidget.tsx',
  'src/components/OrderModal.tsx',
  'src/components/QuoteBuilder.tsx',
  // Trademark color metadata (data, not styling)
  'src/data/trademarks.ts',
  'src/admin/pages/Trademarks.tsx',
  // Theme picker swatches must be literal
  'src/components/ThemeToggle.tsx',
  // Recharts datavis palettes (chart layer is exempt from theme tokens)
  'src/portal/pages/Dashboard.tsx',
  'src/admin/pages/Dashboard.tsx',
  'src/pages/AdminAnalytics.tsx',
  'src/components/ui/chart.tsx',
  // WebGL/Three.js material colors (cannot use CSS vars)
  'src/components/Trademarks3D.tsx',
  'src/components/IntroWebGL.tsx',
  // Dev-only debug overlay
  'src/components/ImageDiagnostics.tsx',
  // Naturalistic wood-grain conic gradient
  'src/components/Services.tsx',
  // Pure #fff text over branded gradients (equivalent to background token in light theme)
  'src/portal/PortalTopbar.tsx',
  'src/admin/AdminTopbar.tsx',
  'src/admin/pages/Customers.tsx',
  'src/admin/pages/Placeholder.tsx',
  // Documentation/demo content displaying hex values as text
  'src/pages/Index.tsx',
  // Generated / config
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
]);

const EXT = /\.(tsx?|jsx?)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split(sep).join('/');
  if (ALLOWLIST.has(rel)) continue;
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    const matches = line.match(HEX);
    if (!matches) return;
    // Filter out things like #region or hash refs (#[0-9]+ alone is fine)
    const real = matches.filter((m) => /^#[0-9a-fA-F]{3,8}$/.test(m) && (m.length === 4 || m.length === 5 || m.length === 7 || m.length === 9));
    if (real.length) violations.push({ file: rel, line: i + 1, hex: real.join(', '), text: trimmed });
  });
}

if (violations.length === 0) {
  console.log('✅ Hex audit passed — no raw hex outside allowlist.');
  process.exit(0);
}

console.error(`❌ Hex audit failed — ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.hex}`);
  console.error(`    ${v.text.slice(0, 140)}`);
}
console.error('\nFix: replace with hsl(var(--token)) or add the file to ALLOWLIST in scripts/audit-hex-colors.mjs with justification.');
process.exit(1);
