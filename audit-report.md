# Palm Charcoal — Audit Report

Base: `http://localhost:8080` · Generated: 2026-07-01T18:03:36.813Z

## Summary

| Priority | Count |
|---|---|
| P0 | 0 |
| P1 | 28 |
| P2 | 26 |
| P3 | 0 |

## Route timings

| Route | Status | DCL (ms) | Findings |
|---|---|---|---|
| / | 200 | 560 | 5 |
| /products | 200 | 456 | 4 |
| /quality | 200 | 444 | 4 |
| /trademarks | 200 | 524 | 4 |
| /wholesale | 200 | 447 | 5 |
| /quote | 200 | 482 | 4 |
| /checkout | 200 | 445 | 4 |
| /about | 200 | 556 | 4 |
| /contact | 200 | 461 | 4 |
| /auth | 200 | 595 | 5 |
| /portal/login | 200 | 475 | 3 |
| /faq | 200 | 493 | 4 |
| /pricing | 200 | 472 | 4 |

## P1 — 28 finding(s)

- **/** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/** · `duplicate_desc` — shared with /products, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/products** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/products** · `duplicate_desc` — shared with /, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/quality** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/quality** · `duplicate_desc` — shared with /, /products, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/trademarks** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/trademarks** · `duplicate_desc` — shared with /, /products, /quality, /wholesale, /quote, /checkout, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/wholesale** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/wholesale** · `img_no_alt` — 4 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/wholesale** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /quote, /checkout, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/quote** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/quote** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /checkout, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/checkout** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/checkout** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /about, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/about** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/about** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /checkout, /contact, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/contact** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/contact** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /auth, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/auth** · `multiple_h1` — 2 h1s
  - Fix: Reduce to a single <h1>; convert extras to <h2>.
- **/auth** · `img_no_alt` — 4 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/auth** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /portal/login, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/portal/login** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /auth, /faq, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/faq** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/faq** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /auth, /portal/login, /pricing
  - Fix: Same description used on multiple routes — differentiate to avoid SEO duplication penalties.
- **/pricing** · `img_no_alt` — 3 imgs
  - Fix: Add descriptive alt text (or alt="" for decorative). Enforce via lint rule jsx-a11y/alt-text.
- **/pricing** · `duplicate_desc` — shared with /, /products, /quality, /trademarks, /wholesale, /quote, /checkout, /about, /contact, /auth, /portal/login, /faq
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
