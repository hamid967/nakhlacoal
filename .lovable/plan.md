# Phase 5 — Payments & Order Fulfillment

بعد اكتمال الفوترة الإلكترونية (Phase 4 ZATCA)، المرحلة التالية الطبيعية هي **قبول المدفوعات الحقيقية وتشغيل عمليات المستودع والشحن** لإغلاق دورة B2C كاملة: من السلة → الدفع → تجهيز → شحن → إثبات تسليم → فاتورة ZATCA → تحصيل.

## نطاق العمل

### 1) بوابة الدفع (Moyasar — البوابة الرسمية السعودية)
لماذا Moyasar: تدعم Mada + Visa/Master + Apple Pay + STC Pay + Tamara بحساب واحد، معتمدة من SAMA، وثائق عربية، ورسوم منافسة. بديلاً: HyperPay أو Tap.

- Edge Function `payments-create-session`: يستلم `order_id`، يعيد التحقق من الأسعار عبر `checkout-validate`، ويُنشئ Payment Session لدى Moyasar ويرجع `redirect_url` + `payment_id`.
- Edge Function `payments-webhook`: يستقبل Callbacks (paid/failed/refunded)، يتحقق من التوقيع، ويحدّث `orders.status` و`payments` بشكل idempotent.
- Edge Function `payments-refund`: للمرتجعات الجزئية/الكاملة (Admin only) — تُنشئ Credit Note ZATCA تلقائيًا.
- جدول جديد `payments(id, order_id, provider, provider_ref, method, amount_sar, status, raw_response jsonb, created_at)`.
- توسيع `orders`: `payment_status`, `paid_at`, `payment_method`.
- الأسرار: `MOYASAR_SECRET_KEY`, `MOYASAR_WEBHOOK_SECRET`, `MOYASAR_PUBLISHABLE_KEY` (الأخيرة فقط قابلة للاستخدام في الواجهة).

### 2) صفحة Checkout حقيقية
- استبدال التدفق الحالي (Order → WhatsApp) بخيار **"ادفع الآن"** مع إبقاء "اطلب عبر واتساب" كخيار ثانٍ.
- عرض طرق الدفع المتاحة (Mada, Apple Pay, Visa, STC Pay, Tamara للتقسيط) مع Logos.
- بعد الدفع الناجح: تحرير الحجز (`stock_reservations`) → خصم فعلي من `product_variants.stock_qty` → إصدار فاتورة ZATCA → إرسال البريد.
- صفحات `/checkout/success?order=<id>` و`/checkout/failed?order=<id>&reason=...` (موجودتان — تحديث الربط).

### 3) عمليات المستودع (Warehouse Operations)
شاشة `/admin/fulfillment` لدور `warehouse` + `admin`:
- **قائمة الالتقاط (Pick List)**: طلبات `paid` وغير مشحونة، مرتبة بأولوية (Same-day → قديم).
- **زر تجهيز**: يضع الطلب في `status='processing'`، يطبع Pick Ticket A5 (منتجات + كميات + موقع رف اختياري).
- **إنشاء شحنة**: نموذج مبسّط (شركة الشحن، عنوان، وزن) → يُنشئ سجلًا في `shipments` مع `tracking_no`.
- **مسح باركود** (اختياري في هذه المرحلة): إدخال يدوي للـ tracking + التقاط صورة إثبات.

### 4) تكامل الشحن (SMSA / Aramex / DHL)
اختياري لكن يوصى به: Edge Function `shipping-create-label` يستدعي API الناقل (نبدأ بـ **SMSA Express** — الأكثر شيوعًا محليًا) لإنشاء بوليصة PDF ورقم تتبع.
- Fallback: إدخال يدوي إذا كان الحساب غير مفعّل.
- Webhook `shipping-tracking-webhook` لتحديث حالات (out_for_delivery, delivered).
- سر مطلوب: `SMSA_API_KEY` (نطلبه لاحقًا عند التفعيل).

### 5) استرداد وإلغاء
- سياسة استرداد واضحة (موجودة في `/refund-policy`).
- زر "استرداد" في `/admin/orders/:id` (لأدوار admin/accountant فقط) → يستدعي `payments-refund` → يُصدر Credit Note ZATCA (`invoice_subtype=381`) → يعيد المخزون.

### 6) إعادة الحجز عند الفشل
- Cron موجود `expire_stock_reservations` يُشغَّل كل 5 دقائق.
- إضافة: إذا فشل الدفع أو انتهت الجلسة، إطلاق `release_order_reservations(order_id)` فورًا.

### 7) الاختبارات
1. طلب B2C كامل → Mada Test Card → paid → فاتورة ZATCA → بريد → شحنة → delivered.
2. طلب فاشل → المخزون يُحرَّر خلال دقيقة.
3. استرداد جزئي → Credit Note + إشعار للعميل.
4. Webhook مكرر → لا ازدواج (idempotency).
5. طلب Wholesale مدفوع بالائتمان (بدون بوابة) → يبقى `payment_status=on_account`.

## Technical Details

**جداول جديدة:**
```text
payments(id, order_id FK, provider text, provider_ref text unique,
         method text, amount_sar numeric(12,2), status text,
         raw_response jsonb, created_at, updated_at)
```

**تعديلات:**
```text
orders + payment_status text default 'unpaid',
       + paid_at timestamptz, payment_method text
```

**Edge Functions:** 4 جديدة (`payments-create-session`, `payments-webhook`, `payments-refund`, `shipping-create-label`).

**صفحات جديدة:**
```text
/admin/fulfillment       (Pick list + Ship)
/admin/payments          (Payments log + refunds)
```

**Secrets مطلوبة (نطلبها لاحقًا بعد موافقتك):**
- `MOYASAR_SECRET_KEY`, `MOYASAR_WEBHOOK_SECRET`, `MOYASAR_PUBLISHABLE_KEY`
- (اختياري) `SMSA_API_KEY`

## خارج النطاق
- POS طرفيات ومزامنة مبيعات الفروع.
- تعدد العملات (SAR فقط).
- Marketplace (Amazon/Noon) — Phase 7 لاحقًا.

## المخرجات
- 1 migration (`payments` + توسيع `orders`).
- 4 Edge Functions + Webhook Endpoints.
- Checkout حقيقي + `/admin/fulfillment` + `/admin/payments`.
- تكامل Moyasar Test Mode جاهز للتبديل إلى Live بضغطة.

## ملاحظة
سنبدأ في **Test Mode لـ Moyasar** فورًا (لا تحتاج ترخيص فعلي)، وعند جاهزية الحساب التجاري نبدّل المفاتيح.
