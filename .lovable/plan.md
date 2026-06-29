# Palm Charcoal — Enterprise Admin Dashboard

This is a large enterprise build. I'll split it into 4 phases so each is shippable and reviewable. Phase 1 lays the foundation + the highest-value screens; later phases add depth.

## Stack (kept consistent with this project)
- React 18 + Vite + TypeScript + Tailwind + shadcn/ui (project is Vite, not Next.js 15)
- Framer Motion for animation
- Recharts for analytics
- Lovable Cloud (Supabase) for data, RLS, Edge Functions
- New admin shell mounted at `/admin/*`, protected by `ProtectedRoute requireRole="admin"`

## Design system (new admin-only tokens)
- Palette: Ivory `#FAF8F3`, Palm Green `#1A4A00`, Luxury Gold `#C9A84C`, Charcoal `#0F0F0F`, Soft Gray `#E8E5DE`
- Radius 20–24px, glass cards, soft shadow `0 8px 32px rgba(15,15,15,.06)`
- Typography: Instrument Serif (display) + Inter (UI)
- Dark + Light mode via `data-theme` on admin shell
- Motion presets: hover-lift, fade-up, count-up, sidebar slide, page transition

---

## Phase 1 — Foundation + Core (this turn)
1. **Admin shell**: `src/admin/AdminLayout.tsx` with collapsible glass sidebar (28 sections grouped), topbar (search, theme, notifications, profile), page transitions.
2. **Routing**: nested `/admin` routes in `App.tsx`; gated by admin role.
3. **Design tokens**: `src/admin/admin.css` scoped to `.admin-shell` so it won't affect the public site.
4. **Dashboard Home** (`/admin`): 8 summary cards, revenue line chart, orders bar chart, sales by product pie, activity timeline, quick actions, notifications panel — wired to real `orders` + `inventory_items` tables.
5. **Orders** (`/admin/orders`): redesigned premium table with filters, status pills, drawer detail (timeline, notes, attachments).
6. **Products / Inventory** (`/admin/products`): redesigned grid + table from `inventory_items`, search, bulk actions UI, AI description generator (reuses Lovable AI).
7. **Customers** (`/admin/customers`): from `profiles` + `user_roles` + aggregated `orders`; CRM drawer.
8. **Reports** (`/admin/reports`): merges current `AdminAnalytics` into the new shell with PDF/CSV export.
9. **Settings** (`/admin/settings`): general/company/theme/notifications scaffolding (local for now).
10. Old admin routes (`/admin/orders`, `/admin/inventory`, `/admin/analytics`) redirect into new shell.

## Phase 2 — Catalog depth
Categories, Brands (5 trademarks management), Suppliers, Media Library (Supabase Storage bucket + drag-drop + AI tagging), Quality Control (lab results table + batch approve/reject), Certificates.

## Phase 3 — Commerce & Ops
Wholesale, Export (countries/containers/customs docs), Warehouse (locations, stock alerts, barcode/QR), Invoices, Payments, Refunds, VAT, Expenses.

## Phase 4 — Growth & System
Marketing (banners, coupons, email/WhatsApp campaigns), Website Builder (homepage section editor), AI Center (centralized generators), Blog/Knowledge admin, SEO panel, Users/Roles/Permissions + Activity Logs + 2FA, System Logs, Backup.

---

## Database additions (added as needed per phase)
Phase 1 needs no new tables — works on existing `orders`, `inventory_items`, `profiles`, `user_roles`.

Later phases will add (each with GRANTs + RLS admin-only):
`categories`, `brands`, `suppliers`, `media_assets`, `lab_results`, `certificates`, `warehouses`, `stock_movements`, `invoices`, `payments`, `coupons`, `campaigns`, `homepage_sections`, `activity_logs`.

## Auth note
The credentials in the prompt (`abs005599@gmail.com`) — I will NOT hardcode them. After Phase 1 ships, sign up that email via `/auth`, then I'll grant it the `admin` role via a one-line `user_roles` insert so it can access `/admin`.

## Deliverable for this turn
Phase 1 only — a working premium admin shell + Dashboard, Orders, Products, Customers, Reports, Settings. Confirm and I'll build it.
