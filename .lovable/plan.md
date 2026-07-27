# Phase 8 — Omnichannel Retail & Operations

بعد اكتمال المتجر الإلكتروني والفوترة (ZATCA Phase-2) والمدفوعات والنمو (Reviews/Loyalty/Referrals)، المرحلة 8 تُوسّع «فحم النخلة» من متجر رقمي إلى **شبكة تشغيل متعددة القنوات**: نقطة بيع للمعرض، إدارة مستودعات، تواصل عبر WhatsApp Business، تطبيق PWA قابل للتثبيت، ومركز دعم متكامل.

## نطاق العمل

### 1) POS — نقطة بيع للمعرض (Retail Terminal)
- جدول `pos_registers(id, name, location, active, cash_float_sar)` و`pos_shifts(id, register_id, cashier_id, opened_at, closed_at, opening_cash, closing_cash, sales_total_sar, status)`.
- جدول `pos_sales(id, shift_id, order_id, payment_method cash|card|stcpay|mixed, amount_sar, vat_amount_sar, created_at)`.
- شاشة `/pos` مخصّصة (خارج `AdminLayout`) بواجهة تعمل باللمس: بحث سريع بالباركود/SKU، سلة مباشرة، دفع نقدي/بطاقة، طباعة إيصال ZATCA فوري (نفس pipeline التوقيع).
- ربط تلقائي بـ`orders` + `zatca_invoices` (simplified invoice) وخصم مباشر من `product_variants.stock`.

### 2) إدارة مستودعات متعددة (Multi-Warehouse WMS)
- جدول `warehouses(id, name, city, address, is_default, active)`.
- جدول `stock_by_warehouse(warehouse_id, variant_id, qty, reserved_qty)` — يحلّ محل حقل `stock` المفرد (مع الحفاظ عليه كـview مجمّع).
- جدول `stock_movements(id, warehouse_id, variant_id, type in|out|transfer|adjust, qty, reference_type, reference_id, note, created_by, created_at)` — سجل حركات كامل.
- شاشات `/admin/warehouses` و`/admin/stock-movements` (استلام بضاعة، تحويل بين فروع، جرد يدوي).
- Trigger على `order_items` يخصم من المستودع الأقرب حسب عنوان الشحن.

### 3) WhatsApp Business Cloud API
- Edge Function `whatsapp-send`: إرسال رسائل قوالب معتمدة (تأكيد طلب، رقم تتبع، عرض سعر جاهز).
- Edge Function `whatsapp-webhook`: استقبال ردود العملاء وحفظها في محادثة موحّدة.
- جدول `whatsapp_conversations(id, customer_phone, user_id, last_message_at, status)` و`whatsapp_messages(id, conversation_id, direction, template_name, body, media_url, wa_message_id, status, created_at)`.
- شاشة `/admin/whatsapp` (Inbox موحّد لخدمة العملاء، ردود سريعة، ربط بطلب/عرض سعر).
- Triggers تلقائية: عند `orders.status='shipped'` → إرسال قالب تتبع. عند `quote_requests.status='quoted'` → إرسال قالب عرض السعر.

### 4) PWA — تطبيق قابل للتثبيت
- `manifest.webmanifest` كامل (أيقونات كل المقاسات، shortcuts للطلب السريع/تتبع الشحنة).
- Service Worker (Workbox عبر `vite-plugin-pwa`): تخزين مؤقت للصور والصفحات الثابتة، صفحة Offline أنيقة، تحديث تلقائي مع toast.
- Push Notifications (Web Push): جدول `push_subscriptions(user_id, endpoint, p256dh, auth, user_agent)` + Edge Function `push-send` للإشعارات (حالة الطلب، عروض).
- iOS Add-to-Home banner ذكي.

### 5) Support Center — مركز دعم متكامل
- جدول `support_tickets(id, user_id, subject, category, priority, status open|pending|resolved|closed, assigned_to, order_id?, created_at, updated_at, closed_at)`.
- جدول `support_messages(id, ticket_id, sender_id, body, attachments jsonb, is_internal, created_at)`.
- شاشة `/portal/support` (فتح تذكرة، متابعة، تقييم بعد الحل).
- شاشة `/admin/support` (قائمة أولوية، تعيين، SLA counter، ردود قوالب).
- تكامل مع WhatsApp: تذكرة تُنشأ تلقائيًا من محادثة WhatsApp غير مرتبطة بطلب.

### 6) Returns & Refunds — إدارة الإرجاع
- جدول `return_requests(id, order_id, user_id, reason, status requested|approved|received|refunded|rejected, refund_amount_sar, notes, created_at, updated_at)`.
- جدول `return_items(id, return_id, order_item_id, qty, condition new|damaged|used)`.
- شاشة `/portal/returns` (طلب إرجاع خلال 14 يوم من التسليم مع رفع صور).
- شاشة `/admin/returns` (موافقة/رفض، إصدار Credit Note ZATCA تلقائيًا، ربط بـ`payments-refund`).
- Trigger: عند `status='refunded'` → إعادة المخزون وإصدار فاتورة دائنة (invoice_type='credit_note').

### 7) Reporting & BI — تقارير تشغيلية
- شاشة `/admin/reports-v2` بتقارير جاهزة قابلة للتصدير (CSV/PDF):
  - مبيعات يومية/أسبوعية/شهرية حسب القناة (Online/POS/Marketplace).
  - أعلى المنتجات مبيعًا + Slowest movers.
  - تقرير ZATCA (فواتير مُصفَّاة/معلّقة/فاشلة لكل فترة).
  - تقرير WMS (قيمة المخزون، أدنى حد، نفاد قريب).
  - Aging Report للحسابات الآجلة (Wholesale).
- تصدير مجدول تلقائي أسبوعي بالبريد للمدير.

## Technical Details

**جداول جديدة (12):**
```text
pos_registers, pos_shifts, pos_sales,
warehouses, stock_by_warehouse, stock_movements,
whatsapp_conversations, whatsapp_messages,
push_subscriptions,
support_tickets, support_messages,
return_requests, return_items
```

**Edge Functions جديدة (5):**
```text
whatsapp-send            (on-demand + triggers)
whatsapp-webhook         (Meta callback)
push-send                (on-demand)
returns-issue-credit-note (trigger)
reports-scheduled-export  (cron weekly)
```

**Secrets مطلوبة (لاحقًا حسب التفعيل):**
- WhatsApp: `META_WABA_ID`, `META_WABA_TOKEN`, `META_WABA_PHONE_ID`, `META_WABA_VERIFY_TOKEN`.
- Web Push: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (نُولّدها تلقائيًا).

**صفحات جديدة (8):**
```text
/pos                       (Retail terminal, touch-optimized)
/admin/warehouses          (multi-warehouse management)
/admin/stock-movements     (WMS ledger)
/admin/whatsapp            (unified inbox)
/admin/support             (helpdesk)
/admin/returns             (RMA management)
/admin/reports-v2          (BI reports)
/portal/returns            (customer RMA)
```

**قياس النجاح (KPIs):**
- تفعيل POS بمعرض واحد قبل نهاية الشهر.
- 60% من إشعارات الطلبات عبر WhatsApp خلال 30 يوم.
- < 4 ساعات متوسط زمن الرد على تذاكر الدعم.
- 15% من المستخدمين النشطين يثبّتون PWA.
- < 2% معدل الإرجاع مع دورة استرداد < 3 أيام.

## خارج النطاق
- ERP كامل (Odoo/SAP integration) — Phase 9.
- Multi-currency (USD/AED) — Phase 9.
- Franchise/Multi-tenant — بعيد المدى.
- TikTok Shop / Instagram Shopping — يحتاج موافقات منفصلة.

## المخرجات
- 1 Migration (12 جداول + GRANT + RLS + Policies + Views).
- 5 Edge Functions + 2 Cron schedules.
- 8 شاشات جديدة + توسعة `/portal` بإرجاع/دعم.
- PWA جاهز للتثبيت مع Offline mode.
- WhatsApp Inbox عملي (Test mode قبل تفعيل Meta).

## ترتيب التنفيذ المقترح
1. **PWA + Support Center + Returns** (لا يحتاج مفاتيح خارجية) — قابل للإطلاق فورًا.
2. **Multi-Warehouse + POS** (تشغيلي داخلي) — يحتاج تدريب فريق.
3. **WhatsApp Business** (يحتاج اعتماد قوالب Meta 3-7 أيام).
4. **Reporting v2 + Push Notifications** (تحسينات ختامية).

أخبرني إن أردت البدء بترتيب مختلف، تقليص النطاق (مثلاً حذف POS إن لم يكن هناك معرض)، أو تأجيل WhatsApp حتى استلام اعتماد Meta.
