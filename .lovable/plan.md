# Phase 3 — B2B Wholesale Portal

الهدف: إطلاق بوابة B2B متكاملة للموزّعين وتجّار الجملة تعمل بأسعار خاصة، حدود ائتمانية، وطلبات ضخمة، مع فصل واضح عن تجربة B2C.

بحسب Phase 0، Phase 3 هو **B2B wholesale portal**. Phase 2 (بوابة الدفع الفعلية) بقي خارج النطاق ويُنفَّذ لاحقًا عند اختيار المزوّد (Moyasar/HyperPay/Tap).

## نطاق العمل

### 1) بيانات الجملة (Wholesale schema)
- جدول `wholesale_accounts`: يربط `user_id` بحساب شركة (اسم، سجل تجاري، رقم ضريبي، حد ائتماني، شروط دفع Net-15/Net-30، مندوب المبيعات، حالة موافقة).
- جدول `wholesale_price_tiers`: قواعد خصم لكل حساب أو مجموعة (نسبة/سعر ثابت لكل `product_variant` أو `category`).
- عمود `wholesale_account_id` على `orders` و`quote_requests` لتمييز طلبات B2B.
- ترقية `wholesale_leads` (موجود) → عند الموافقة يُنشأ `wholesale_accounts` تلقائيًا + دور `wholesale`.

### 2) واجهة الموزّع `/portal/wholesale/*`
- **Dashboard:** ملخّص الحساب (الحد الائتماني، المستحق، آخر الطلبات، الأسعار الحالية).
- **Catalog:** كتالوج بأسعار الجملة (يستدعي RPC `get_wholesale_price(variant_id)`).
- **Bulk Order:** نموذج طلب سريع بإدخال SKU/كمية أو رفع CSV، مع تحقق مخزون فوري.
- **Quotes:** طلبات عروض أسعار مخصّصة (متصلة بجدول `quote_requests`).
- **Invoices:** فواتير الحساب + رصيد مستحق + تنزيل PDF (ZATCA QR).
- **Statement:** كشف حساب دوري (شهري) قابل للتصدير.

### 3) لوحة الإدارة `/admin/wholesale/*`
- **Leads:** مراجعة `wholesale_leads` والموافقة/الرفض بنقرة → ينشئ الحساب ويرسل بريد ترحيب.
- **Accounts:** إدارة الحسابات، تعديل الحد الائتماني وشروط الدفع.
- **Price Tiers:** واجهة CRUD لقواعد التسعير لكل حساب.
- **Sales rep view:** فلترة بالحسابات المُسنَدة للمندوب الحالي.

### 4) منطق التسعير والائتمان (Business rules)
- Edge Function `wholesale-pricing`: يحسب السعر الفعّال لكل بند وفق tier + عملة + كمية (سعر جملة يظهر تلقائيًا في `/products` للمستخدمين ذوي دور `wholesale`).
- تعديل `checkout-validate`: يقبل `wholesale_account_id`، يتحقق من الحد الائتماني قبل السماح بطلب Net-terms بلا دفع فوري.
- Trigger على `invoices`: يحدّث الرصيد المستحق للحساب.

### 5) RBAC وأمان
- توسيع دور `wholesale` (موجود) + دور جديد `sales_rep`.
- RLS: كل موزّع يرى بيانات حسابه فقط؛ `sales_rep` يرى حساباته المُسنَدة؛ `admin/manager` يرون الكل.
- GRANTs كاملة على الجداول الجديدة وفق قاعدة المشروع.

### 6) إشعارات وقوالب بريد
- Edge Function `wholesale-lead-approved`: يرسل بريد ترحيب مع بيانات الدخول.
- Edge Function `wholesale-credit-alert`: تنبيه عند بلوغ 80% من الحد الائتماني.
- إضافة قوالب لـ `email_settings` مع مفاتيح تفعيل.

## Technical Details

**جداول جديدة:**
```text
wholesale_accounts (id, user_id FK auth.users, company_name, cr_number,
                    vat_number, credit_limit_sar, payment_terms text,
                    sales_rep_id FK auth.users, status text, approved_at)
wholesale_price_tiers (id, account_id FK, variant_id FK nullable,
                       category_id FK nullable, discount_pct numeric,
                       fixed_price_sar numeric, min_qty int, valid_until)
wholesale_statements (id, account_id, period_start, period_end,
                      opening_balance, closing_balance, pdf_url)
```

**تعديلات:**
```text
orders          + wholesale_account_id uuid FK nullable
quote_requests  + wholesale_account_id uuid FK nullable
app_role enum   + sales_rep
```

**Edge Functions جديدة:**
- `wholesale-pricing` (POST): يعيد السعر الفعّال لعنصر أو سلة.
- `wholesale-lead-approve` (POST, admin only): يُنشئ حساب + دور + بريد.
- `wholesale-statement-generate` (cron شهري): يولّد كشف حساب PDF.

**RPC:**
- `get_wholesale_price(_variant_id uuid, _qty int)` — SECURITY DEFINER يعيد أفضل سعر للمستخدم الحالي.
- `get_account_balance(_account_id uuid)` — رصيد مستحق + متاح من الائتمان.

**صفحات جديدة:**
```text
/portal/wholesale/dashboard
/portal/wholesale/catalog
/portal/wholesale/bulk-order
/portal/wholesale/quotes
/portal/wholesale/invoices
/portal/wholesale/statement
/admin/wholesale/leads
/admin/wholesale/accounts
/admin/wholesale/price-tiers
```

**اختبارات القبول:**
1. موزّع مسجّل يرى أسعار جملة في `/products` تختلف عن أسعار B2C.
2. طلب bulk بكمية > الحد الائتماني يُرفض بـ 402.
3. رفع CSV بـ 50 SKU يُنشئ سلة صحيحة خلال < 3s.
4. `sales_rep` يرى فقط الحسابات المُسنَدة له.
5. موافقة lead → بريد ترحيب + دور `wholesale` مضاف تلقائيًا.

## خارج النطاق
- بوابة دفع فعلية (Phase 2).
- ZATCA Phase-2 e-invoice API.
- تطبيق موبايل للموزّعين.
- تكامل ERP خارجي.

## المخرجات
- 2 migrations: (أ) الجداول والأدوار، (ب) RLS + دوال + triggers.
- 3 Edge Functions جديدة + 1 cron.
- 9 صفحات جديدة (6 portal + 3 admin).
- قوالب بريد + مفاتيح تفعيل.
- تقرير قبول موجز مع لقطات شاشة.
