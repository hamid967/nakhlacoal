# Palm Charcoal — Audit Report

Base: `http://localhost:8080` · Generated: 2026-07-01T18:22:53.520Z

## Summary

| Priority | Count |
|---|---|
| P0 | 0 |
| P1 | 13 |
| P2 | 11 |
| P3 | 0 |

## Route timings

| Route | Status | DCL (ms) | Findings |
|---|---|---|---|
| / | 200 | 589 | 3 |
| /products | 200 | 490 | 2 |
| /quality | 200 | 476 | 2 |
| /trademarks | 200 | 566 | 2 |
| /wholesale | 200 | 442 | 2 |
| /quote | 200 | 469 | 2 |
| /checkout | 200 | 518 | 3 |
| /about | 200 | 473 | 2 |
| /contact | 200 | 519 | 2 |
| /auth | 200 | 440 | 3 |
| /portal/login | 200 | 413 | 1 |

## P1 — 13 finding(s)

- **/** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/products** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/quality** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/trademarks** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/wholesale** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/quote** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/checkout** · `short_desc` — 45 chars
  - Fix: Set a unique <meta name=description> per route via SEO.tsx; 120-160 chars.
- **/checkout** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/about** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/contact** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/auth** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/auth** · `img_no_alt` — 4 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.

## P2 — 11 finding(s)

- **/** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/products** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/quality** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/trademarks** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/wholesale** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/quote** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/checkout** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/about** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/contact** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/auth** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
- **/portal/login** · `csp_meta`
  - Fix: `frame-ancestors` is ignored in <meta>; move CSP to hosting HTTP headers or remove the directive.
