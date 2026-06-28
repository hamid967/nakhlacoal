## Reality check

You've asked for ~20 routes, full auth, e‑commerce, wholesale/export portals, admin panel, AI assistant, bilingual AR/EN with RTL, and 8 payment methods. That's roughly 4–6 weeks of work — not one chat turn. I'll ship it in **5 phases**, each one a working, shippable milestone you can review before we move on.

Today's turn delivers **Phase 1** end-to-end. Phases 2–5 happen on your "go" after each review.

## Design system (locked across all phases)

- **Palette:** Matte Black `#0B0B0B` (bg) · Metallic Gold `#C9A227` (accent) · Charcoal Gray `#1A1A1A` / `#2A2A2A` (surfaces) · Off‑White `#F5F5F0` (text)
- **Typography:** Display = **Cormorant Garamond** (luxury serif, Apple‑esque restraint) · Body Latin = **Inter Tight** · Arabic = **Tajawal** (display + body). Loaded via `@fontsource`.
- **Motion:** Framer Motion. Cinematic ease `[0.16, 1, 0.3, 1]`, 600–900ms hero reveals, subtle parallax, gold shimmer on hover, no bouncy springs.
- **Surfaces:** Rounded `2xl`, hairline gold borders `#C9A227/20`, glass blur on overlays only, deep ambient shadows.
- **i18n:** `react-i18next` + `dir` attribute swap. Every component built RTL‑aware (logical properties: `ps-*`, `pe-*`, `text-start`).

## Phase 1 — Luxury marketing site + bilingual shell (this turn)

Replaces the entire current template with the new luxury design.

- **Stack additions:** `react-i18next`, `i18next-browser-languagedetector`, `framer-motion` (already present), `@fontsource/cormorant-garamond`, `@fontsource/inter-tight`, `@fontsource/tajawal`, `react-helmet-async`, `lucide-react` (present).
- **i18n shell:** `src/i18n/index.ts` + `locales/en.json` + `locales/ar.json`. Language toggle in nav writes `<html lang dir>` and persists choice.
- **Pages (real routes, not anchors):** `/`, `/products`, `/about`, `/quality`, `/wholesale`, `/export`, `/knowledge`, `/contact`. Each is a full premium page with hero, sections, and footer.
- **Components:** `LuxNav` (transparent → blurred on scroll, AR/EN toggle), `LuxFooter`, `FireHero` (full‑screen video hero with gold-treated overlays + CTAs Order Now / Wholesale / Become Distributor / Talk to Assistant), `FeatureGrid` (6 cards: Long Burn, High Heat, Low Ash, Eco Friendly, Odor Free, Certified), `ProductCard`, `SpecBar`, `CertificateMarquee`, `QualityDial` (animated metric rings), `LanguageToggle`, `ScrollReveal`.
- **SEO:** per‑route `<Helmet>` with AR/EN titles, descriptions, canonical, OG; Organization + Product JSON‑LD; `public/sitemap.xml`, `public/robots.txt`.
- **AI key:** provision `LOVABLE_API_KEY` (no UI yet — wired in Phase 4).
- **Cloud:** enable Lovable Cloud so Phases 2–5 are unblocked.

**Out of Phase 1:** auth UI, cart, orders, admin, AI chat UI, payments. The site is fully browsable, bilingual, and looks like a luxury international brand.

## Phase 2 — Auth + Customer Portal

Email/password + Google sign-in (Lovable Cloud native), phone+OTP, password reset, `profiles` table, `user_roles` table (enum: customer, wholesale, admin), `/login`, `/signup`, `/reset-password`, `/portal` dashboard shell, `/portal/profile`, `/portal/addresses`, `/portal/security`. Protected routes via session guard.

## Phase 3 — Catalog + E‑commerce + Quotations

`products`, `product_specs`, `product_media`, `categories`, `orders`, `order_items`, `quotations`, `addresses` tables with RLS. Cart (zustand, localStorage), `/products/:slug` detail page with gallery + spec table + datasheet PDF, `/cart`, `/checkout`, `/portal/orders`, `/portal/orders/:id` with timeline, `/portal/quotations`, wholesale quotation flow with document upload, server-side PDF generation via edge function.

## Phase 4 — Payments + AI Assistant + Shipping

`enable_stripe_payments` (covers Apple Pay, Google Pay, Visa, Mastercard, Mada via Stripe Saudi). STC Pay, Bank Transfer, COD added as manual methods. Floating `AssistantWidget` using Lovable AI (`google/gemini-3-flash-preview`) with bilingual system prompt, streaming via edge function, tools: `recommend_product`, `estimate_quantity`, `track_order`. Shipping calculator + tracking page.

## Phase 5 — Admin Panel + Knowledge Center + Polish

`/admin` (role-gated) with manage customers/products/orders/quotes/inventory/discounts/coupons/certificates/blog. Sales + revenue analytics with Recharts. Knowledge Center articles (markdown via DB), FAQ accordion, comparison tables. Final SEO audit, performance pass, PWA manifest.

## Technical notes (for the record)

- Stack stays Vite + React + TS + Tailwind + shadcn. Your prompt mentioned Next.js, but this is a Lovable Vite project — Next.js isn't an option. React Router DOM handles routing; SSR isn't available, so per‑route head tags ship via `react-helmet-async` (good for Googlebot, limited for non-JS social crawlers).
- All colors live as HSL CSS variables in `index.css` and Tailwind tokens — no hardcoded hex in components.
- Every table created in Phases 2–5 ships with `GRANT` + RLS + policies in the same migration.
- Roles always live in a separate `user_roles` table with a `has_role()` security‑definer function — never on profiles.

---

**Confirm to start Phase 1.** I'll then enable Cloud + provision the AI key, wipe the current template, and rebuild the home + 7 sibling pages in the new matte black + gold luxury system, bilingual from the first commit.