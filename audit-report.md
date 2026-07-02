# Palm Charcoal — Audit Report

Base: `http://localhost:8080` · Generated: 2026-07-02T04:14:13.007Z

## Summary

| Priority | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 0 |

## Route timings

| Route | Status | DCL (ms) | Findings |
|---|---|---|---|
| / | 200 | 534 | 1 |
| /products | 200 | 478 | 0 |
| /quality | 200 | 436 | 0 |
| /trademarks | 200 | 471 | 0 |
| /wholesale | 200 | 453 | 0 |
| /quote | 200 | 491 | 0 |
| /checkout | 200 | 501 | 0 |
| /about | 200 | 435 | 0 |
| /contact | 200 | 446 | 0 |
| /auth | 200 | 503 | 0 |
| /portal/login | 200 | 459 | 0 |

## P2 — 1 finding(s)

- **/** · `console_error` — Warning: React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passe
  - Fix: Investigate console error; often an unhandled promise rejection or 401 from Supabase RLS.
