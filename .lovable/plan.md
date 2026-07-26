# Phase 7 — Marketplace Sync & Growth Engine

بعد اكتمال المدفوعات والفوترة، المرحلة 7 تفتح **قنوات بيع خارجية** (Amazon.sa + Noon) وتُنشئ **محرك نمو** (SEO تقني عميق، تحليلات سلوكية، ولاء العملاء، ريفيرال، وأتمتة تسويقية) لتحويل الموقع من متجر مستقل إلى **شبكة توزيع رقمية**.

## نطاق العمل

### 1) Marketplace Sync (Amazon.sa + Noon Seller)
- جدول `marketplace_channels(id, provider, name, active, credentials_ref, last_sync_at, config jsonb)`.
- جدول `marketplace_listings(id, channel_id, variant_id, external_sku, external_id, price_sar, stock_qty, status, last_pushed_at, last_error)`.
- جدول `marketplace_orders(id, channel_id, external_order_id, order_id FK nullable, raw jsonb, imported_at, status)`.
- Edge Functions:
  - `marketplace-push-inventory` (Cron كل 15 دقيقة): يرفع المخزون والأسعار لكل قناة نشطة.
  - `marketplace-pull-orders` (Cron كل 5 دقائق): يسحب طلبات جديدة ويحوّلها إلى `orders` محلية بعلامة `source='amazon'|'noon'`.
  - `marketplace-update-tracking`: يدفع رقم التتبع للقناة عند إنشاء الشحنة.
- شاشة `/admin/marketplace`: قائمة القنوات، ربط SKUs، سجل المزامنة، وإعادة رفع يدوية.

### 2) SEO تقني متقدم
- `sitemap.xml` ديناميكي (Edge Function `sitemap-generate` يومي) يشمل كل منتج/مقال/تاجرت مارك.
- `robots.txt` محدّث + `llms.txt` (موجود).
- JSON-LD مُوسّع: `Product` (offers, aggregateRating, reviews), `BreadcrumbList`, `FAQPage`, `Organization`, `LocalBusiness`.
- Canonical + hreflang لكل صفحة (ar/en).
- `Open Graph` ديناميكي لكل منتج/مقال عبر Edge Function `og-image` (توليد PNG بـ Coal/Gold).
- Core Web Vitals: LCP < 2s، CLS < 0.05.

### 3) Reviews & Ratings
- جدول `product_reviews(id, product_id, user_id, order_id, rating 1-5, title, body, verified, approved, created_at)`.
- RLS: Insert لمن اشترى فعلاً (تحقق من `orders.status='delivered'`)، Read عام للـapproved.
- عرض متوسط التقييم في `ProductDetail.tsx` + نموذج مراجعة بعد التسليم.
- ربط `aggregateRating` بـSchema.org.

### 4) برنامج الولاء (Palm Points)
- جدول `loyalty_accounts(user_id, points_balance, tier, lifetime_spend_sar)`.
- جدول `loyalty_transactions(id, user_id, order_id, type earn|redeem|expire, points, reason)`.
- قواعد: 1 نقطة لكل 10 ر.س، 100 نقطة = 10 ر.س خصم، انتهاء بعد 12 شهرًا.
- شاشة `/portal/loyalty` (رصيد، سجل، مكافآت متاحة).
- Trigger على `orders.status='delivered'` يمنح النقاط تلقائيًا.

### 5) نظام الإحالة (Referral)
- جدول `referral_codes(user_id, code unique, uses, total_reward_sar)`.
- كل مستخدم يحصل على كود فريد. عند استخدام صديق للكود على أول طلب: الصديق يحصل على 10% خصم (سقف 50 ر.س)، والمُحيل يحصل على 50 نقطة ولاء.
- شاشة `/portal/referrals` + تكامل مع WhatsApp Share.

### 6) Analytics & Behavior Tracking
- جدول `analytics_events(id, session_id, user_id, event_name, properties jsonb, url, referrer, created_at)` — Retention 90 يوم.
- Client hook `useTrack(event, props)` — يرسل: `product_view`, `add_to_cart`, `checkout_start`, `checkout_complete`, `quote_request`, `search`, `filter_apply`.
- شاشة `/admin/analytics` (تحلّ محل الحالية): Funnel، Top products، Top search terms، Cart abandonment، LTV، Cohort retention.
- Optional: تكامل GA4 عبر gtag.js (إذا وافق المدير).

### 7) Marketing Automation
- جدول `email_campaigns(id, name, template, segment jsonb, scheduled_at, status, sent_count, opened_count)`.
- 4 حملات جاهزة:
  1. **Cart abandonment** (بعد 4 ساعات من هجر السلة).
  2. **Post-purchase upsell** (بعد 3 أيام من التسليم).
  3. **Win-back** (لعميل لم يطلب منذ 90 يومًا).
  4. **Wholesale onboarding** (سلسلة 5 رسائل للحسابات الجديدة).
- Cron `marketing-run-campaigns` يومي.

### 8) Content Hub تحسين
- تحسين `/knowledge` بمحرّر Markdown كامل للمدير.
- SEO auto-suggestions (meta description، keywords) عبر Lovable AI.
- Related products/articles تلقائي حسب embeddings.

## Technical Details

**جداول جديدة (10):**
```text
marketplace_channels, marketplace_listings, marketplace_orders,
product_reviews, loyalty_accounts, loyalty_transactions,
referral_codes, referral_redemptions,
analytics_events, email_campaigns
```

**Edge Functions جديدة (8):**
```text
marketplace-push-inventory   (cron 15m)
marketplace-pull-orders      (cron 5m)
marketplace-update-tracking  (trigger)
sitemap-generate             (cron daily)
og-image                     (on-demand)
loyalty-award                (trigger on order delivered)
marketing-run-campaigns      (cron daily)
analytics-ingest             (client → server)
```

**Secrets مطلوبة (لاحقًا، بعد موافقتك على كل قناة):**
- `AMAZON_SP_API_CLIENT_ID`, `AMAZON_SP_API_CLIENT_SECRET`, `AMAZON_REFRESH_TOKEN`, `AMAZON_SELLER_ID`
- `NOON_PARTNER_CODE`, `NOON_API_KEY`
- (اختياري) `GA4_MEASUREMENT_ID`

**صفحات جديدة:**
```text
/admin/marketplace     (channels + listings + sync log)
/admin/reviews         (moderation queue)
/admin/campaigns       (marketing automation)
/portal/loyalty        (points balance + rewards)
/portal/referrals      (referral code + earnings)
```

**قياس النجاح (KPIs):**
- +30% Organic traffic خلال 90 يوم.
- +15% Conversion rate من مراجعات المنتجات.
- 25% من الطلبات الجديدة عبر Amazon/Noon خلال 6 أشهر.
- 40% Retention rate عبر برنامج الولاء.

## خارج النطاق
- POS/Terminal integration (Phase 8).
- WhatsApp Business API (Meta) — يحتاج ترخيص منفصل.
- TikTok Shop / Instagram Shopping.
- Multi-currency (USD/AED).

## المخرجات
- 1 Migration واحدة (10 جداول + GRANT + RLS + POLICIES).
- 8 Edge Functions + 3 Cron schedules.
- 5 شاشات جديدة (3 Admin + 2 Portal) + توسعة `/analytics` و`/knowledge`.
- Marketplace Test Mode جاهز (Sandbox Amazon/Noon).

## ملاحظة تنفيذ
سنبدأ بـ **Analytics + Reviews + Loyalty** (لا تحتاج مفاتيح خارجية) → ثم SEO + Marketing Automation → ثم Marketplace (يحتاج حسابات Seller Central معتمدة). أخبرني إن أردت البدء بترتيب مختلف أو تقليص النطاق.
