# Phase 4 — ZATCA Phase-2 e-Invoicing (Integration)

الهدف: ترقية نظام الفوترة من Phase-1 (QR فقط) إلى **Phase-2 (Integration / التكامل)** المتوافق مع هيئة الزكاة والضريبة والجمارك السعودية (ZATCA/Fatoora): توليد UBL 2.1 XML، توقيع رقمي، تجزئة PIH/ICV، وربط تلقائي بـ Clearance (فواتير ضريبية B2B) وReporting (فواتير مبسطة B2C).

## نطاق العمل

### 1) بنية بيانات الامتثال
- جدول `zatca_credentials`: يخزّن CSR/Compliance CSID/Production CSID + المفاتيح الخاصة (مشفّرة عبر pgsodium) + بيانات الجهاز (device serial, common name).
- جدول `zatca_invoices`: سجل لكل فاتورة صادرة يضم `invoice_id`, `uuid`, `icv` (متسلسل), `pih` (Previous Invoice Hash), `hash`, `xml_signed`, `qr_base64`, `status` (pending/cleared/reported/failed), `zatca_response` jsonb, `submitted_at`, `cleared_at`.
- توسيع `invoices`: `invoice_type` (standard/simplified), `invoice_subtype` (388/381/383)، `counterparty_vat`, `counterparty_address` jsonb، `zatca_status`.

### 2) عملية الأونبوردنغ (Onboarding)
- شاشة إدارة `/admin/zatca`: توليد CSR (Certificate Signing Request) + طلب Compliance CSID من ZATCA Sandbox، ثم Compliance Checks (تشغيل 6 فواتير تجريبية موقّعة)، ثم طلب Production CSID.
- تخزين البيئة (`sandbox`/`simulation`/`production`) لكل جهاز مع إمكانية التبديل.

### 3) Edge Functions
- `zatca-generate-csr`: يبني CSR وفق قالب ZATCA (OID، بيانات المنشأة، الجهاز).
- `zatca-onboard`: يستدعي `/compliance` و`/production/csids`.
- `zatca-sign-invoice`: يبني UBL 2.1 XML، يحسب Invoice Hash (SHA-256 canonical)، يوقّع رقميًا (ECDSA)، يبني QR TLV Base64، يحفظ في `zatca_invoices`.
- `zatca-submit-invoice`: يرسل إلى Clearance (B2B) أو Reporting (B2C) وفق النوع، يخزّن الاستجابة، يحدّث الحالة.
- `zatca-retry-queue` (cron كل 5 دقائق): يعيد إرسال الفواتير الفاشلة (`status='failed'` + محاولات < 5).

### 4) خط أنابيب الفوترة
- Trigger على `invoices` بعد `status='issued'`: يضيف مهمة إلى قائمة `zatca_queue` (LISTEN/NOTIFY أو استدعاء HTTP).
- `zatca-sign-invoice` يحسب `icv = last_icv + 1` و`pih = last_hash` لكل جهاز.
- بعد النجاح: يخزّن `qr_base64` على `invoices.zatca_qr` ويحدّث `zatca_status='cleared'`.
- PDF/A-3: تضمين XML الموقّع كمرفق داخل PDF عبر Edge Function `zatca-embed-pdf`.

### 5) لوحة التحكم `/admin/zatca`
- **Onboarding Wizard**: 4 خطوات (بيانات المنشأة → CSR → Compliance Checks → Production).
- **Invoices Monitor**: قائمة `zatca_invoices` مع فلاتر (cleared/reported/failed/pending)، عرض الاستجابة الكاملة، زر "إعادة إرسال".
- **Chain Integrity**: عرض تسلسل `icv/pih` لكل جهاز مع تحذير عند كسر السلسلة.
- **Settings**: تبديل البيئة، دوران الشهادات (تنتهي كل سنة)، تصدير النسخ الاحتياطية.

### 6) الأمان والامتثال
- المفاتيح الخاصة مشفّرة داخل قاعدة البيانات باستخدام `pgsodium` (secret_key vaulted).
- RLS: `zatca_credentials` و`zatca_invoices` مقصور على `admin`/`accountant` فقط.
- سجل تدقيق كامل في `activity_log` لكل عملية توقيع/إرسال.
- الاحتفاظ بالأرشيف 6 سنوات (متطلب هيئة الزكاة).

### 7) الاختبارات
1. Onboarding كامل في `sandbox` مع اجتياز Compliance Checks الستة.
2. فاتورة B2C مبسّطة → Reporting → `status='reported'` خلال < 3s.
3. فاتورة B2B قياسية → Clearance → `status='cleared'` + QR ساري.
4. كسر متعمّد لسلسلة `pih` → تنبيه واضح + منع الإرسال.
5. Cron يعيد إرسال الفواتير الفاشلة بنجاح.

## Technical Details

**جداول جديدة:**
```text
zatca_credentials(id, environment, org_name, org_vat, device_serial,
                  common_name, csr text, private_key_encrypted bytea,
                  compliance_csid text, production_csid text,
                  cert_expires_at, active bool)
zatca_invoices(id, invoice_id FK, uuid, icv int, pih text, hash text,
               xml_signed text, qr_base64 text, invoice_type,
               submission_type text, status, zatca_response jsonb,
               attempts int, submitted_at, cleared_at)
```

**تعديلات:**
```text
invoices + invoice_type text, invoice_subtype text,
         + counterparty_vat text, counterparty_address jsonb,
         + zatca_status text default 'pending', zatca_qr text
```

**Edge Functions:** 5 دوال جديدة + cron واحد.

**المكتبات المطلوبة (Deno):**
- `node-forge` لتوليد CSR و ECDSA.
- `xmldsig` أو تنفيذ يدوي لـ XML C14N + توقيع.
- `sha256` (built-in Web Crypto).

**Endpoints ZATCA:**
- Sandbox: `https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/*`
- Production: `https://gw-fatoora.zatca.gov.sa/e-invoicing/core/*`

**Secrets مطلوبة:**
- `ZATCA_ENVIRONMENT` (sandbox/simulation/production)
- `ZATCA_ENCRYPTION_KEY` (لتشفير المفاتيح الخاصة داخل القاعدة)

**صفحات جديدة:**
```text
/admin/zatca              (dashboard + monitor)
/admin/zatca/onboarding   (4-step wizard)
/admin/zatca/invoice/:id  (تفاصيل + استجابة + إعادة إرسال)
```

## خارج النطاق
- طباعة حرارية للفواتير المبسّطة (تحتاج SDK POS).
- التكامل مع أنظمة ERP خارجية.
- Cross-border e-invoicing (خارج KSA).

## المخرجات
- 2 migrations (جداول + RLS + triggers).
- 5 Edge Functions + 1 cron.
- 3 صفحات إدارة + Onboarding Wizard.
- توثيق Onboarding مختصر بالعربية.
- تقرير قبول مع لقطات شاشة.

## ملاحظة هامة
هذا التنفيذ **يتطلب مفاتيح ZATCA حقيقية** لبيئة الإنتاج. سنعمل كامل التطوير على **Sandbox** أولاً، وعند جاهزية المنشأة (رقم ضريبي مفعّل + تسجيل في Fatoora) نبدّل إلى Production بضغطة زر.
