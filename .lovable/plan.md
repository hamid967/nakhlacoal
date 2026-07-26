# Phase 1 — Foundations Hardening

الهدف: إغلاق مخاطر P0 التي رصدها تقرير Phase 0 قبل ربط أي بوابة دفع أو إطلاق تجاري كامل.

## نطاق العمل

### 1) التحقق من السعر من جانب الخادم (Server-side pricing)
- إنشاء Edge Function `checkout-validate` تعيد حساب `subtotal / VAT / shipping / total` من `product_variants` + `coupons` + `shipping_rates` بدل الاعتماد على قيم المتصفح.
- تعديل `Checkout.tsx` ليستدعي الدالة قبل إنشاء الطلب، ورفض أي تباين > 0.01 SAR.
- تخزين snapshot السعر النهائي داخل `orders.pricing_snapshot` (JSONB) للتدقيق.

### 2) حجز المخزون (Inventory reservation)
- عمود `reserved_qty` على `product_variants` + جدول `stock_reservations(order_id, variant_id, qty, expires_at)`.
- Trigger على `orders` عند `pending`: يزيد `reserved_qty`؛ عند `paid` يخصمه من `stock_qty`؛ عند `cancelled/expired` يحرره.
- Cron يمسح الحجوزات المنتهية كل 10 دقائق.

### 3) أدوار الموظفين (RBAC توسعة)
- إضافة `manager`, `accountant`, `warehouse`, `support` إلى enum `app_role`.
- تحديث RLS على `orders / invoices / shipments / inventory_items` لتقييد كل دور بصلاحياته:
  - manager: كل شيء عدا حذف
  - accountant: قراءة + تعديل الفواتير فقط
  - warehouse: قراءة الطلبات + تحديث الشحنات والمخزون
  - support: قراءة الطلبات والعملاء فقط

### 4) الصفحات القانونية (Compliance content)
- `/privacy` — سياسة الخصوصية بصياغة PDPL السعودي (ثنائي اللغة).
- `/terms` — شروط الاستخدام والبيع.
- `/refund-policy` — سياسة الاسترجاع والاستبدال.
- `/shipping-policy` — سياسة الشحن.
- روابط في `LuxFooter.tsx` + في checkout كـ checkbox موافقة إجباري.

### 5) صفحات نتائج الدفع (Payment result stubs)
- `/checkout/success?order=...` و `/checkout/failed` جاهزتان لأي بوابة دفع لاحقة.

## تفاصيل تقنية

**جداول جديدة:**
```text
stock_reservations (id, order_id FK, variant_id FK, qty, expires_at, created_at)
```

**تعديلات جداول:**
```text
product_variants  + reserved_qty int default 0
orders            + pricing_snapshot jsonb, legal_accepted_at timestamptz
app_role enum     + manager, accountant, warehouse, support
```

**Edge Functions:**
- `checkout-validate` (POST): input = cart items + coupon + shipping_id → output = authoritative totals + signed token يُمرَّر لخطوة إنشاء الطلب.

**RLS pattern:** `has_role(auth.uid(),'manager') OR has_role(auth.uid(),'admin')` على كل جدول حساس.

**اختبارات القبول:**
1. محاولة تعديل `total_amount` من المتصفح ترفض بـ 400.
2. طلبان متزامنان على نفس الـ variant الأخير: أحدهما ينجح والآخر يرفض.
3. مستخدم `accountant` لا يستطيع تعديل `orders.status`.
4. Checkout بدون قبول الشروط يرفض.

## خارج النطاق
- بوابة الدفع الحقيقية (Phase 2 مع Moyasar/HyperPay/Tap).
- ZATCA Phase-2 API integration.
- B2B wholesale portal (Phase 3).

## المخرجات
- 1 migration واحدة موحّدة للجداول والأدوار وRLS.
- 1 Edge Function جديدة + نشرها.
- 4 صفحات قانونية + تحديث Footer وCheckout.
- تقرير قبول موجز في نهاية التنفيذ.
