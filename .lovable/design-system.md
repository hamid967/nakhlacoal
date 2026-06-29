# Palm Charcoal — Design System Inheritance Contract

> **Source of truth.** Every new page, component, edge function, image, and animation MUST inherit from what is documented here. Do not introduce a parallel UI language. If a requirement cannot be satisfied with the tokens/primitives below, extend them in `src/index.css` + `tailwind.config.ts` + `src/components/ui-lux/` — never inline new styles.

---

## 1. Brand identity
- Name: **فحم النخلة | Palm Charcoal** (Jeddah, Saudi Arabia).
- Voice: editorial, premium, restrained. Arabic-first (RTL default) with mirrored English.
- Imagery: cinematic, warm gold key-light on deep emerald/charcoal, shallow DoF, watermarked via `ImageWatermark.tsx`.

## 2. Color tokens (HSL, defined in `src/index.css`)
Never hardcode `#hex` or `text-white`/`bg-black` in components. Use semantic tokens only.

| Token | Role |
|---|---|
| `background` / `foreground` | Cream paper canvas + emerald ink |
| `dark` / `dark-foreground` | Deep emerald editorial sections |
| `gold` / `gold-hi` / `gold-lo` / `gold-ink` | Primary metallic spectrum (use `gold-lo`/`gold-ink` for AA contrast on cream) |
| `jade` | Secondary accent |
| `surface` / `surface-2` / `surface-3` | Layered card backgrounds |
| `primary` / `secondary` / `accent` / `muted` / `destructive` | shadcn aliases |

Themes: `data-theme="emerald" | "noir" | "sand"` toggle via `ThemeToggle.tsx`. All three must render correctly — verify before shipping.

## 3. Gradients, shadows, easing
- `--gradient-gold`, `--gradient-ember`, `--gradient-night`
- `shadow-luxe`, `shadow-gold`
- Motion easing: `--ease-luxe` `cubic-bezier(0.16, 1, 0.3, 1)`

## 4. Typography
| Family | Use |
|---|---|
| `font-display` — Cormorant Garamond | Headlines, hero, section titles |
| `font-body` — Karla | Body, UI, captions |
| `font-arabic` — Tajawal | All Arabic strings (auto via `dir="rtl"`) |

Section numbering uses editorial `01–15` via `SectionNumber.tsx` / `PageHero.tsx`.

## 5. Layout & grid
- Container via Tailwind `container` (centered, 1.5rem padding, breakpoints `sm 40 / md 48 / lg 64 / xl 80 / 2xl 90 rem`).
- Radius scale: `--radius: 0.25rem` (hairline luxury — do not round to pill unless explicitly a chip).
- Spacing rhythm: section padding `py-20 md:py-28`, content gaps `gap-6/8/12`.

## 6. Glass / Neo Glassmorphism 2.0
Use the existing utilities — do not write new blur recipes:
- `.glass-card` — 32px blur frosted panel
- `.glass-dark` — emerald-tinted variant
- `.glass-grain` — opt-in film grain (auto-weakened under `prefers-reduced-motion`)
- `.lux-glass-hover` — interactive lift
- `.lux-parallax` + `useParallax.ts` for depth

## 7. Component library (reuse — do not duplicate)
Primitives in `src/components/ui-lux/index.tsx`: `LuxSection`, `SectionHeader`, `Eyebrow`, `LuxButton`, `FeatureCard`, `TrustItem`, `Stat`, `ProductCard`, `TestimonialCard`.
Shared building blocks in `src/components/`: `PageHero`, `GlassCard`, `Picture` (AVIF/srcset), `ImageWatermark`, `SectionDivider`, `ScrollReveal`, `SectionSkeleton`, `Layout` (provides single `<main>`).
shadcn primitives in `src/components/ui/` — always extend via variants, never fork.

**Rule:** if a new page needs a card/button/section, import from `ui-lux` first. Only add a new primitive when no existing one fits — then add it to `ui-lux/index.tsx` and document it here.

## 8. Navigation & chrome
- Header: `LuxNav.tsx` (glass megamenu, mobile drawer, RTL aware). Order is fixed by routing — do not reorder.
- Footer: `LuxFooter.tsx`.
- Floating assistant: `AssistantWidget.tsx` — single global instance, do not embed per-page.
- Splash: `HomeIntro.tsx` mounted once in `App.tsx`, session-gated.

## 9. Motion language
- Library: framer-motion + light CSS transitions; WebGL only via `IntroWebGL`/`Trademarks3D` with `detectTier()` fallbacks.
- Reveal: `ScrollReveal` (stagger 60–120ms, duration 600–900ms, `ease-luxe`).
- Hover lift: `lux-glass-hover` (translateY −2 to −4px, shadow `shadow-luxe`).
- Hero/marquee timings: 1000–1600ms via arbitrary `[transition-duration:Xms]` (not `duration-[Xms]` — ambiguous in Tailwind).
- Always honor `@media (prefers-reduced-motion: reduce)`.

## 10. Imagery
- Generate with prompt cues: *Jeddah studio, warm gold key, emerald rim light, matte black backdrop, 50mm, shallow DoF, editorial product photography*.
- Pipe through `Picture` (AVIF + WebP + fallback, lazy by default, eager only for LCP).
- Stamp brand-facing photos with `ImageWatermark`.

## 11. Forms & data
- Validation: Zod schemas + react-hook-form (see `OrderModal.tsx`, `NewOrder.tsx`).
- Inputs: shadcn `Input`/`Select`/`Textarea` only.
- Toasts: `sonner` via existing wrapper.
- Tables/charts in admin: shadcn `Table` + `recharts` (see `AdminAnalytics.tsx`, `AdminInventory.tsx`).

## 12. Backend contract
- Tables: `profiles`, `user_roles`, `orders`, `inventory_items`, `lab_reports`, `pending_orders` (RLS + GRANT enforced).
- Roles via `has_role(uuid, app_role)` SECURITY DEFINER — never check role from client state.
- VAT auto-computed via `calc_order_totals` trigger (15%). Do not recompute client-side.
- Edge functions: HTML-escape Resend payloads, generic DB error messages, admin-only gates via `has_role`.
- Supabase client: `@/integrations/supabase/client` — never edit the generated client/types.

## 13. Auth & permissions
- Email/password + Google. No anonymous sign-ups.
- Route gating: `ProtectedRoute.tsx` + role check in `App.tsx`. `/admin/*` requires `admin`; `/portal/*` requires authenticated user; everything else public.

## 14. SEO
- Per-page `SEO.tsx` (title <60ch, desc <160ch, OG/Twitter, canonical).
- JSON-LD via existing schema helpers. One `<h1>` per page. Alt text required on every `Picture`.
- `sitemap.xml` + `robots.txt` in `public/` — extend when adding routes.

## 15. Responsive & a11y
- Use `h-dvh` (never `h-screen`) for full-viewport surfaces (iOS Safari).
- Mobile-first; verify at 375 / 768 / 1024 / 1440.
- WCAG AA contrast — use `gold-lo`/`gold-ink` on cream; `gold` on emerald.
- All interactive elements: focus-visible ring (`ring` token), ARIA labels, keyboard nav.
- Status updates via `aria-live="polite"`.

## 16. Performance budgets
- Lazy-load heavy routes/3D (`React.lazy` + `Suspense` with `SectionSkeleton`).
- Images: AVIF + responsive `srcset` via `Picture`.
- No new global CSS — extend `index.css` tokens.
- No duplicate framer/three instances.

---

## Acceptance checklist (run before shipping any new page/feature)

- [ ] Uses only tokens from §2/§3 — no hex/inline colors.
- [ ] Fonts from §4 only.
- [ ] Composed from `ui-lux` + shared components (§7); no parallel primitives.
- [ ] Glass effects via §6 utilities; reduced-motion verified.
- [ ] Motion timings use `[transition-duration:Xms]` form (not `duration-[Xms]`).
- [ ] Arabic + English render correctly; RTL mirroring verified.
- [ ] All three themes (emerald/noir/sand) tested.
- [ ] SEO block present; one `<h1>`; alt text on images.
- [ ] RLS + GRANT for any new table; role checks via `has_role`.
- [ ] WCAG AA contrast; keyboard + screen-reader paths verified.
- [ ] Lighthouse: no regression in bundle / LCP / CLS.

> If a deliverable fails any box above, it does not ship. Adapt until it is visually indistinguishable from the existing site.
