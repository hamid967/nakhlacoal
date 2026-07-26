# خطة تنفيذ الـ 10 برومبتات — فحم النخلة

مقسّمة على **4 دفعات** لتقليل مخاطر التراجع، مع تحقّق قبل الانتقال.

---

## الدفعة 1 — SEO & Metadata (Prompts 1–4)

### 1) Sitemap & Robots
- `public/sitemap.xml`: حذف `/compare`, `/studio`, `/quotes`, وكل `/blog/*`. الإبقاء على `/articles/*` كمسار قانوني.
- إضافة تحويلات 301 من `/blog/:slug` → `/articles/:slug` و`/blog` → `/articles` عبر `vercel.json` + `public/_redirects`.
- إضافة `<meta name="robots" content="noindex">` عبر `SEO.tsx` (Helmet) للمسارات: `/quotes`, `/compare`, `/studio`, `/profile`, `/auth`, `/login`, `/signup`, `/admin/*`.

### 2) Per-route dynamic meta
- توحيد كل الصفحات على `<SEO />` (react-helmet-async موجود) لضبط title/description/canonical/og:*/twitter بشكل فريد.
- الحقن التلقائي: `canonical` و`og:url` = `https://alnakhlacoal.com${pathname}`.
- إضافة عناوين ثنائية اللغة للمسارات المذكورة (products, trademarks, quote, wholesale, export, quality, about, contact, faq, location, knowledge, uses, for/*, lp/*).
- `/articles/:slug`: يستخدم title/description من بيانات المقال.

### 3) Structured data (JSON-LD)
- **عام**: Organization في `index.html`.
- **/products/***: Product schema (name, description, image, brand).
- **/articles/:slug**: Article schema (headline, datePublished, dateModified, author).
- **/faq**: FAQPage من عناصر FAQ الفعلية.
- **جميع الصفحات**: BreadcrumbList مبني من `pathname`.

### 4) og:image دائمة
- توليد `public/og-image.jpg` بمقاس 1200×630 (خلفية `#0B0B0B`، شعار النخلة، ذهبي `#C9A227`).
- استبدال جميع مراجع `og:image` و`twitter:image` بـ URL مطلق داخلي.

**Checkpoint 1**: تشغيل `seo--trigger_scan` والتحقق من انخفاض التحذيرات.

---

## الدفعة 2 — أمان RLS شامل (Prompt 5)

- استعلام قائمة كل الجداول + حالة RLS + السياسات (تقرير قبل/بعد).
- التأكد من:
  - `profiles/customers`: قراءة/تعديل الصف الخاص فقط + admin كامل.
  - `orders`: العميل يرى `customer_id = auth.uid()` فقط؛ الإدراج/التعديل/الحذف للأدمن.
  - `quotes/quote_requests` (سيُنشأ في الدفعة 3): INSERT عام مسموح، SELECT للمالك أو الأدمن.
  - `inventory_items` الأسعار: سياسة الأدمن فقط (سبق تنفيذها؛ سأتحقق).
  - جداول الأدمن (`activity_log`, `analytics_settings`, `daily_reports`): admin only.
- تأكيد استخدام `has_role()` security-definer وعدم الاعتماد على إخفاء UI.
- فحص `src/` للتأكد من عدم وجود `service_role`.
- ملخص جدولي في الرد.

**Checkpoint 2**: تشغيل `supabase--linter`.

---

## الدفعة 3 — دورة حياة العروض/الطلبات (Prompts 6, 7, 9)

### 6) نموذج `/quote` عام
- جدول `quote_requests` جديد (public INSERT، SELECT للمالك/الأدمن، rate-limit عبر `rate_limits` الموجود).
- ترقية `src/pages/Quote.tsx`: حقول RTL عربية أولاً، honeypot، تحقق رقم الهاتف، رسالة تأكيد + زر WhatsApp.

### 7) دورة الحياة
- جدول `status_history` (entity_type, entity_id, from_status, to_status, changed_by, changed_at).
- Enum عروض الأسعار: `new → under_review → priced → accepted/rejected → converted_to_order`.
- Enum الطلبات: `confirmed → in_preparation → shipped → delivered / cancelled`.
- Trigger يسجّل كل تغيير حالة.
- زر تغيير الحالة في `AdminOrders`/صفحة عروض الأسعار الجديدة.
- Stepper مرئي بلون ذهبي `#C9A227` للخطوة النشطة في `PortalOrders` + Portal Quotes.

### 9) تحويل العرض المقبول لحساب
- Edge Function `accept-quote`: عند `status = accepted` ينشئ `customer` + يرسل دعوة Supabase Auth (`admin.inviteUserByEmail`) إذا لم يوجد الحساب.
- ربط العرض والطلب الناتج بحساب العميل.
- عرض السلسلة (quote → customer → order) في لوحة الأدمن.

**Checkpoint 3**: اختبار تدفق كامل من `/quote` إلى قبول أدمن → إنشاء حساب.

---

## الدفعة 4 — إشعارات وCRM (Prompts 8, 10)

### 8) إشعارات بريدية
- Edge Function `notify-status-change` (Resend عبر `RESEND_API_KEY` — سأطلبه إن لم يوجد).
- جدول `notifications` (recipient, subject, status, sent_at).
- Templates ثنائية اللغة (عربي أولاً، تصميم داكن + شعار + رقم الطلب/العرض + زر WhatsApp).
- Trigger: على تغيير حالة → استدعاء الدالة.
- إخطار الأدمن عند `quote_requests` جديد.

### 10) Mini-CRM + تذكيرات العلامات
- صفحة أدمن `/admin/quotes`: جدول مع فلاتر (status, product, date)، أعمدة: name/company/phone (WhatsApp)/product/quantity/status/last update/notes.
- ترقية `AdminTrademarks`: بيانات ثابتة للسجلات الخمسة، تحويل Hijri→Gregorian، شارات تحذير 12/6/1 شهر، بطاقة "أقرب تجديد" في الداشبورد.
- بطاقة شهرية على `AdminDashboard`: العروض المستلمة + معدل التحويل + توزيع الطلبات حسب الحالة.

**Checkpoint 4**: اختبار بريد كامل + عرض التذكيرات.

---

## Technical Details

- **Head manager**: `react-helmet-async` مثبّت مسبقاً عبر `src/components/SEO.tsx`.
- **Redirects**: `vercel.json` (production) + `public/_redirects` (Netlify احتياط).
- **Auth invitations**: Edge Function يستخدم `SUPABASE_SERVICE_ROLE_KEY` (متاح كسر في الدوال فقط).
- **Email**: Resend (إن غاب المفتاح سأطلبه عبر `add_secret`).
- **RLS baseline**: كل جدول جديد يتبع نمط `has_role('admin')` + `auth.uid()` scoping + GRANTs صريحة.
- **Hijri conversion**: مكتبة `moment-hijri` أو حساب رياضي مبسّط في `src/lib/hijri.ts`.

## Files Impacted (تقريبي)

- SEO: `src/components/SEO.tsx`, `public/sitemap.xml`, `vercel.json`, `public/_redirects`, `index.html`, ~15 صفحة.
- Assets: `public/og-image.jpg` (توليد).
- DB: 3 هجرات (`quote_requests`, `status_history`, `notifications`) + triggers/enums.
- Edge Functions: `accept-quote`, `notify-status-change`, `submit-quote-request`.
- Admin: `AdminQuotes.tsx` جديدة, `AdminTrademarks` ترقية, `AdminDashboard` بطاقات.
- Portal: `Quotes.tsx` جديدة + stepper في `Orders`.

---

**بعد الموافقة**، أبدأ فوراً بالدفعة 1 وأتوقف عند كل Checkpoint لعرض النتائج قبل التالية.
