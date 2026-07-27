# Phase 10 — Intelligence, Automation & Growth

After Phase 8 (Omnichannel Retail) and Phase 9 (Marketplace Sync), the platform has broad surface area but limited *automation intelligence*. Phase 10 adds a data & automation layer that turns the collected signals (orders, POS, reviews, WhatsApp, marketplace, loyalty) into actionable revenue.

## Goals

1. **Merchandising Intelligence** — automated pricing, restock alerts, ABC classification.
2. **Customer Intelligence** — RFM segmentation, churn risk, personalized recommendations.
3. **Automation Workflows** — rule engine (WHEN → THEN) covering emails, WhatsApp, discounts, stock.
4. **Growth Console** — unified KPI dashboard, cohort retention, marketing attribution.
5. **AI Copilot for Admins** — natural-language query over the business data (read-only).

## Scope by Track

### 1. Data & Analytics Layer
- Migration: `daily_kpi_snapshots` (revenue, orders, AOV, conversion, refunds, cogs).
- Migration: `customer_segments` (rfm_score, tier, last_order_at, ltv_sar, churn_risk).
- Migration: `product_intelligence` (velocity_30d, days_of_cover, abc_class, reorder_point).
- Cron: `analytics-nightly-rollup` (03:00 KSA) computes snapshots + segments + intelligence.

### 2. Automation Rule Engine
- Migration: `automation_rules` (trigger_event, conditions jsonb, actions jsonb, active, throttle).
- Migration: `automation_runs` (rule_id, entity_id, status, log).
- Edge Function: `automation-dispatch` invoked from DB triggers on orders/reviews/stock.
- Built-in action handlers: `send_email`, `send_whatsapp`, `apply_coupon`, `notify_admin`, `low_stock_reorder`.
- Admin UI at `/admin/automations` — visual rule builder (trigger → conditions → actions).

### 3. Growth Console
- New admin route `/admin/growth` with:
  - KPI header (Today / 7d / 30d / MTD with sparklines).
  - Retention cohort heatmap.
  - Marketing attribution (from `analytics_events` UTM data).
  - Top movers & laggards (products, categories, cities).

### 4. Personalization
- Edge Function `recommend-for-user` — merges product velocity + user history + loyalty tier.
- Enhance `/portal/dashboard` and product pages with "moves fast in your city" & "based on your last order".

### 5. Admin AI Copilot
- Edge Function `admin-copilot` — Lovable AI (gemini-2.5-flash) with strict schema-scoped SQL read-only tools.
- Floating command palette in AdminLayout: "كم بلغت المبيعات هذا الأسبوع في جدة؟" etc.
- Guardrails: read-only role, whitelisted tables, row limits, no PII leakage.

### 6. Alerts & Health
- Nightly digest email to managers: revenue vs. target, low-stock, negative reviews, failed ZATCA, aged unpaid invoices.
- Anomaly detection: revenue day-over-day drop > 30% triggers Slack/email alert.

## Technical Details

- **DB**: 4 new tables, all with GRANTs + RLS (admin/manager/accountant read; service_role write). Nightly rollup uses a security-definer function invoked by `pg_cron`.
- **Edge Functions**: 4 new (`analytics-nightly-rollup`, `automation-dispatch`, `recommend-for-user`, `admin-copilot`).
- **Frontend**: 3 new admin pages (`Automations.tsx`, `Growth.tsx`, plus copilot palette component). Reuses existing Coal/Gold token system, `ui-lux` primitives, and `recharts`.
- **Model**: All AI calls via Lovable AI Gateway with `google/gemini-2.5-flash` (no external key needed).
- **Security**: Copilot uses a dedicated read-only Postgres role via RPC; no arbitrary SQL from client — LLM emits a schema-validated JSON query DSL server-side.

## Delivery Order

1. Migrations (KPI + intelligence + automation tables).
2. Nightly rollup Edge Function + cron.
3. Growth console page (immediate visible value).
4. Automation rule engine (schema → dispatcher → admin UI).
5. Recommender + personalization surfaces.
6. Admin AI Copilot.
7. Alerts & digest emails.

## Out of Scope (deferred)

- Paid ad platform integrations (Google/Meta Ads API).
- Predictive ML models beyond simple velocity/RFM heuristics.
- Multi-currency (SAR only remains).

Approve to begin with the migrations and nightly rollup.
