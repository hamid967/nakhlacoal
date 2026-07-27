# Phase 11 — Automation Runtime & Notification Center

Phase 10 delivered analytics + a rule builder UI, but rules don't execute yet and admins have no unified inbox. Phase 11 makes automation actually run and gives operators a real-time notification hub.

## Goals

1. Turn `automation_rules` from data into a working engine (evaluate → act → log).
2. Give admins a single place to see everything that needs attention.
3. Push urgent events (low stock, ZATCA failures, high-risk churn, big orders) as toasts + browser notifications.

## Scope

### 1. Automation Engine
- Edge Function `automation-dispatcher` (cron every 5 min + on-demand).
- Supported triggers: `low_stock`, `abandoned_cart`, `churn_risk`, `order_status`, `zatca_failed`, `kpi_threshold`.
- Supported actions: `send_email` (Resend), `send_whatsapp`, `create_notification`, `webhook`, `assign_tag`.
- Every execution appended to `automation_runs` with input snapshot, action result, duration, status.
- Rate-limit per rule via existing `check_rate_limit`.

### 2. Admin Notification Center
- Reuse existing `notifications` table (already 9 cols, RLS).
- Bell icon in `AdminTopbar` shows unread count + realtime updates via Supabase channels.
- Dropdown: last 20, mark read/all-read, deep-link to source entity.
- New `/admin/notifications` full-page view with filters (type, severity, date, unread).

### 3. Automations Page Upgrade
- Add "Runs" tab beside rules: paginated `automation_runs` with rule name, trigger payload, action outcome, retry button.
- Add "Test Rule" button that dry-runs against last 24h data without executing actions.

### 4. Signal Sources (wired to engine)
- DB trigger on `product_variants` when `stock - reserved_qty <= reorder_point` → enqueues event.
- DB trigger on `carts` inactive > 24h → abandoned_cart event (nightly).
- Existing ZATCA failure alert reused as an event source.
- `compute_customer_segments` writes churn_risk → engine picks up nightly.

### Technical Details

Files added:
- `supabase/functions/automation-dispatcher/index.ts`
- `src/admin/pages/Notifications.tsx`
- `src/admin/components/NotificationBell.tsx`
- `src/admin/hooks/useNotifications.ts`

Files edited:
- `src/admin/AdminTopbar.tsx` — wire real bell with unread badge + dropdown.
- `src/admin/pages/Automations.tsx` — add Runs tab, Test button, per-rule status.
- `src/App.tsx` + `src/admin/AdminSidebar.tsx` — register `/admin/notifications`.

Database migration:
- New table `automation_events` (queue: id, kind, payload jsonb, processed_at, dedupe_key).
- Trigger `trg_low_stock_event` on `product_variants`.
- Cron: dispatcher every 5 min, abandoned-cart sweep hourly.
- GRANTs + RLS (admin/manager read; service_role all).

Out of scope: customer-facing push (already in Phase 8 push_subscriptions), SMS providers, visual rule builder v2.

## Deliverable

Working automation runtime with observable runs, a live admin notification bell, and a notifications page — driven by real DB events, not mock data.

Reply "ابدأ" to execute, or tell me what to adjust.