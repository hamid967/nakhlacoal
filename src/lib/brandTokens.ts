/**
 * Palm Charcoal — Brand Identity Tokens
 * Source of truth for typography, color, spacing, and iconography.
 * Design plan reference: docs/DESIGN_PLAN.md and docs/BRAND_IDENTITY.md
 */

// ─────────────────────────────────────────────────────────────
// 1. COLOR SYSTEM — Emerald Prestige
// ─────────────────────────────────────────────────────────────
export const brandColors = {
  // Core
  emerald: {
    900: "#0B2A24", // deep — primary surfaces on dark
    800: "#12463A",
    700: "#1B6A56",
    600: "#2C8C72", // brand primary
    500: "#3FA98A",
    300: "#8FD6BF",
    100: "#E4F4EE",
  },
  gold: {
    900: "#6E5218",
    700: "#A07A24",
    500: "#C9A24B", // brand accent
    300: "#E4C77E",
    100: "#F6EAC7",
  },
  ink: {
    950: "#0A0F0D", // near-black text on light
    800: "#1A211E",
    600: "#3A4642",
    400: "#7A8681",
    200: "#D7DDD9",
    50:  "#F5F7F5", // canvas
  },
  signal: {
    success: "#2C8C72",
    warning: "#C9A24B",
    danger:  "#B4453B",
    info:    "#3E7BC0",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// 2. TYPOGRAPHY
// ─────────────────────────────────────────────────────────────
export const brandFonts = {
  display: '"DM Serif Display", "Reem Kufi", Georgia, serif',
  sans:    '"Fira Sans", "IBM Plex Sans Arabic", system-ui, sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
} as const;

/** Modular type scale (1.25 major-third) in rem. */
export const typeScale = {
  xs:   "0.75rem",   // 12
  sm:   "0.875rem",  // 14
  base: "1rem",      // 16
  md:   "1.125rem",  // 18
  lg:   "1.25rem",   // 20
  xl:   "1.563rem",  // 25
  "2xl":"1.953rem",  // 31
  "3xl":"2.441rem",  // 39
  "4xl":"3.052rem",  // 49
  "5xl":"3.815rem",  // 61
  "6xl":"4.768rem",  // 76
  hero: "6.5rem",    // editorial hero
} as const;

export const typeWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;
export const lineHeights = { tight: 1.05, snug: 1.2, normal: 1.5, relaxed: 1.7 } as const;

// ─────────────────────────────────────────────────────────────
// 3. SPACING & LAYOUT (8pt grid with editorial offsets)
// ─────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40, "2xl": 64, "3xl": 96, "4xl": 128,
} as const;

export const layout = {
  maxWidth: 1440,
  gutter: 24,
  columns: 12,
  brokenGridOffset: 40, // deliberate ±40px vertical rhythm break
} as const;

export const radii = { sm: 4, md: 8, lg: 16, xl: 24, pill: 999 } as const;

export const shadows = {
  soft: "0 1px 2px rgba(10,15,13,.06), 0 4px 12px rgba(10,15,13,.06)",
  card: "0 8px 24px rgba(10,15,13,.10)",
  lift: "0 24px 60px rgba(10,15,13,.18)",
  gold: "0 8px 32px rgba(201,162,75,.35)",
} as const;

// ─────────────────────────────────────────────────────────────
// 4. LOGO & ICON SIZE ARRANGEMENTS
// ─────────────────────────────────────────────────────────────
export const logoSizes = {
  favicon:  16,   // browser tab
  chip:     24,   // inline badges
  nav:      32,   // top navigation
  card:     48,   // product cards
  section:  72,   // section headers
  hero:    120,   // hero mark
  splash:  240,   // splash / intro
} as const;

export const iconSizes = {
  xs: 14, sm: 18, md: 24, lg: 32, xl: 48, "2xl": 64,
} as const;

/** Minimum clear-space around the logo, measured in units of the logo height. */
export const logoClearSpace = 0.5;

// ─────────────────────────────────────────────────────────────
// 5. MOTION
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
import palmMark        from "@/assets/brand/icons/palm-mark.svg";
import charcoalPiece   from "@/assets/brand/icons/charcoal-piece.svg";
import flame           from "@/assets/brand/icons/flame.svg";
import leafSustain     from "@/assets/brand/icons/leaf-sustain.svg";
import qualityShield   from "@/assets/brand/icons/quality-shield.svg";
import shippingCrate   from "@/assets/brand/icons/shipping-crate.svg";
import labFlask        from "@/assets/brand/icons/lab-flask.svg";
import majlisCup       from "@/assets/brand/icons/majlis-cup.svg";

export const brandIcons = {
  palmMark, charcoalPiece, flame, leafSustain,
  qualityShield, shippingCrate, labFlask, majlisCup,
} as const;

export type BrandIconName = keyof typeof brandIcons;
