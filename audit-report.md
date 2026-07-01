# Palm Charcoal — Audit Report

Base: `http://localhost:8080` · Generated: 2026-07-01T18:18:40.417Z

## Summary

| Priority | Count |
|---|---|
| P0 | 2 |
| P1 | 26 |
| P2 | 26 |
| P3 | 0 |

## Route timings

| Route | Status | DCL (ms) | Findings |
|---|---|---|---|
| / | 200 | 651 | 3 |
| /products | 200 | 13232 | 5 |
| /quality | 200 | 457 | 4 |
| /trademarks | 200 | 17077 | 4 |
| /wholesale | 200 | 440 | 6 |
| /quote | 200 | 436 | 3 |
| /checkout | 200 | 450 | 4 |
| /about | 200 | 470 | 3 |
| /contact | 200 | 445 | 4 |
| /auth | 200 | 457 | 6 |
| /portal/login | 200 | 443 | 2 |
| /faq | 200 | 438 | 5 |
| /pricing | 200 | 476 | 5 |

## P0 — 2 finding(s)

- **/products** · `slow_dcl` — DCL 13232ms
  - Fix: Wrap heavy 3D/canvas components with React.lazy + Suspense, and prefer `frameloop="demand"` for r3f.
- **/trademarks** · `slow_dcl` — DCL 17077ms
  - Fix: Wrap heavy 3D/canvas components with React.lazy + Suspense, and prefer `frameloop="demand"` for r3f.

## P1 — 26 finding(s)

- **/** · `short_desc` — 52 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/products** · `short_desc` — 54 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/products** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/quality** · `short_desc` — 78 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/quality** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/trademarks** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/wholesale** · `short_desc` — 41 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/wholesale** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/wholesale** · `img_no_alt` — 4 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/wholesale** · `duplicate_desc` — shared with /auth
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/quote** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/checkout** · `short_desc` — 45 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/checkout** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/about** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/contact** · `short_desc` — 41 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/contact** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/auth** · `short_desc` — 41 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/auth** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/auth** · `img_no_alt` — 4 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/auth** · `duplicate_desc` — shared with /wholesale
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/faq** · `short_desc` — 18 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/faq** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/faq** · `duplicate_desc` — shared with /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/pricing** · `short_desc` — 18 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/pricing** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/pricing** · `duplicate_desc` — shared with /faq
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.

## P2 — 26 finding(s)

- **/** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/products** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/products** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/quality** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/quality** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/trademarks** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/trademarks** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/wholesale** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/wholesale** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/quote** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/quote** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/checkout** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/checkout** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/about** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/about** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/contact** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/contact** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/auth** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/auth** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/portal/login** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/portal/login** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/faq** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/faq** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
- **/pricing** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/pricing** · `console_error` — The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
