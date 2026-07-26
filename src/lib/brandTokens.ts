/**
 * Palm Charcoal — Brand Identity Tokens (Runtime-synced)
 * Mirrors the HSL CSS variables in `src/index.css` and the utilities in
 * `tailwind.config.ts`. Always prefer Tailwind utilities in components
 * (`bg-gold`, `text-jade`, `shadow-luxe`, `rounded-xl`, …). Use the JS
 * values below only where a utility cannot express the need (canvas,
 * chart series, dynamic inline styles).
 *
 * Docs: docs/BRAND_IDENTITY.md
 */

// ─────────────────────────────────────────────────────────────
// 1. COLOR SYSTEM — Emerald Palm (matches --tokens in index.css)
// ─────────────────────────────────────────────────────────────
/** hsl(var(--name)) helper — safe for inline styles / SVG fills. */
export const token = (name: string) => `hsl(var(--${name}))`;
/** hsl(var(--name) / a) with alpha — 0..1 */
export const tokenA = (name: string, alpha: number) =>
  `hsl(var(--${name}) / ${alpha})`;

/** Raw HSL triplets kept in sync with :root in src/index.css. */
export const brandColors = {
  background:  "44 55% 92%",   // paper
  foreground:  "160 78% 12%",  // emerald ink
  surface:     "44 50% 96%",
  surface2:    "42 40% 88%",
  surface3:    "40 32% 82%",

  dark:        "160 78% 10%",  // near-black emerald
  dark2:       "162 82% 6%",

  gold:        "43 55% 54%",   // #C9A84C
  goldHi:      "43 68% 66%",
  goldLo:      "40 55% 38%",
  goldInk:     "40 60% 30%",

  jade:        "163 80% 26%",  // living emerald / primary

  destructive: "0 65% 45%",
  whatsapp:    "142 70% 39%",
} as const;

// ─────────────────────────────────────────────────────────────
// 2. TYPOGRAPHY
// ─────────────────────────────────────────────────────────────
export const brandFonts = {
  editorialBold: '"DM Serif Display", "Amiri", Georgia, serif',
  editorialSans: '"Fira Sans", "IBM Plex Sans Arabic", system-ui, sans-serif',
  display:       '"Syne", "Cormorant Garamond", serif',
  body:          '"Plus Jakarta Sans", "IBM Plex Sans Arabic", system-ui, sans-serif',
  arabic:        '"Reem Kufi", "IBM Plex Sans Arabic", sans-serif',
} as const;

/** Modular type scale (1.25 major-third) in rem. */
export const typeScale = {
  xs:   "0.75rem",   sm:   "0.875rem", base: "1rem",     md:   "1.125rem",
  lg:   "1.25rem",   xl:   "1.563rem", "2xl":"1.953rem", "3xl":"2.441rem",
  "4xl":"3.052rem", "5xl":"3.815rem", "6xl":"4.768rem", hero: "6.5rem",
} as const;

export const typeWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;
export const lineHeights = { tight: 1.05, snug: 1.2, normal: 1.5, relaxed: 1.7 } as const;

// ─────────────────────────────────────────────────────────────
// 3. SPACING & LAYOUT (8pt grid with editorial offsets)
// Exposed to Tailwind as `brand-xs … brand-4xl`.
// ─────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40, "2xl": 64, "3xl": 96, "4xl": 128,
} as const;

export const layout = {
  maxWidth: 1440,
  gutter: 24,
  columns: 12,
  brokenGridOffset: 40,
} as const;

/** Border radii — exposed to Tailwind as `rounded-brand-{key}`. */
export const radii = { sm: 4, md: 8, lg: 16, xl: 24, "2xl": 32, pill: 9999 } as const;

/** Shadows — exposed to Tailwind as `shadow-{key}`. */
export const shadows = {
  soft:      "0 1px 2px hsl(var(--dark) / 0.06), 0 4px 12px hsl(var(--dark) / 0.06)",
  card:      "0 8px 24px hsl(var(--dark) / 0.10)",
  lift:      "0 24px 60px hsl(var(--dark) / 0.18)",
  luxe:      "0 30px 60px -25px hsl(var(--dark) / 0.35), 0 4px 16px -6px hsl(var(--dark) / 0.18)",
  gold:      "0 14px 36px -10px hsl(var(--gold) / 0.45)",
  glowGold:  "0 10px 28px -8px hsl(var(--gold) / 0.60)",
  glowGoldSm:"0 0 18px -4px hsl(var(--gold) / 0.60)",
} as const;

// ─────────────────────────────────────────────────────────────
// 4. LOGO & ICON SIZE ARRANGEMENTS
// ─────────────────────────────────────────────────────────────
export const logoSizes = {
  favicon: 16, chip: 24, nav: 32, card: 48, section: 72, hero: 120, splash: 240,
} as const;

export const iconSizes = { xs: 14, sm: 18, md: 24, lg: 32, xl: 48, "2xl": 64 } as const;

/** Minimum clear-space around the logo, in units of the logo height. */
export const logoClearSpace = 0.5;

// ─────────────────────────────────────────────────────────────
// 5. MOTION — exposed to Tailwind as `duration-{key}` & `ease-brand`.
// ─────────────────────────────────────────────────────────────
export const motion = {
  duration: { fast: 180, base: 320, slow: 560, cinematic: 1200 },
  ease: {
    standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit:     "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// 6. ICON REGISTRY (URL-imported SVGs)
// ─────────────────────────────────────────────────────────────
import palmMark      from "@/assets/brand/icons/palm-mark.svg";
import charcoalPiece from "@/assets/brand/icons/charcoal-piece.svg";
import flame         from "@/assets/brand/icons/flame.svg";
import leafSustain   from "@/assets/brand/icons/leaf-sustain.svg";
import qualityShield from "@/assets/brand/icons/quality-shield.svg";
import shippingCrate from "@/assets/brand/icons/shipping-crate.svg";
import labFlask      from "@/assets/brand/icons/lab-flask.svg";
import majlisCup     from "@/assets/brand/icons/majlis-cup.svg";

export const brandIcons = {
  palmMark, charcoalPiece, flame, leafSustain,
  qualityShield, shippingCrate, labFlask, majlisCup,
} as const;

export type BrandIconName = keyof typeof brandIcons;
