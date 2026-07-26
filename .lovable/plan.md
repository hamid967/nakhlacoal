# فحم النخلة — $10K Premium Redesign · Change Manifest & Plan

مرجع: `ALNAKHLA_COAL_LOVABLE_PREMIUM_REDESIGN.md` (872 سطرًا).
حالة: **بانتظار الاعتماد قبل بدء التنفيذ الفعلي** (Phase 0 من الملف).

---

## 0) ملخّص الفارق بين الحالة الحالية والمستهدف

| المحور | الحالي | المستهدف في الملف |
|---|---|---|
| الهوية | Emerald Prestige (كريم + زمردي + ذهبي) | Coal + Palm Gold + Ember + Ivory (داكن أولًا) |
| الخطوط | DM Serif Display + Plus Jakarta + Reem Kufi | IBM Plex Sans Arabic + Manrope فقط |
| الصفحة الرئيسية | 8 أقسام editorial | 14 قسم محدد + AnnouncementBar + MegaMenu |
| المسارات | ~30 مسارًا موجودًا | 20 مسارًا محددًا (بعضها ناقص: `/our-story`, `/sustainability`, `/journal/*`, `/verify-batch`, `/shipping-returns`, `/order-success`) |
| i18n | RTL/LTR شغّال، لكن كثير من النصوص Hardcoded | كل نص من ملفات ترجمة |
| المخطط | 27 جدول (orders/invoices/…) | يضيف: `product_variants`, `product_images`, `categories`, `inventory_movements`, `carts/cart_items`, `order_items`, `addresses`, `articles`, `testimonials`, `newsletter_subscribers`, `wholesale_leads`, `export_leads`, `site_settings`, `certifications`, `production_batches` |
| الدفع | غير مربوط ببوابة فعلية | يجب طبقة Integration حقيقية (بدون محاكاة نجاح) |
| المكونات | مكتبة editorial جزئية | 31 مكونًا محددًا (AnnouncementBar, MegaMenu, MiniCart, QuantityStepper, VariantSelector, PhoneInput, FilterDrawer …) |

---

## 1) ما سيُحفظ كما هو (لا يُمَس)

- كل جداول Supabase الحيّة وسياسات RLS.
- Edge Functions (email/notifications/ZATCA/invoices/chat-assistant).
- بيانات المنتجات والطلبات والعملاء الفعلية.
- `src/integrations/supabase/*` (auto-generated).
- منطق المصادقة والأدوار (`user_roles`, `has_role`).
- إعدادات SEO الأساسية والـ Workflows (lhci, security-scan, deadcode).

## 2) ما سيُعاد بناؤه

- `src/index.css`: طبقة Design Tokens جديدة (`--coal-*`, `--palm-gold`, `--ember`, `--sand`, `--ivory`) مع الاحتفاظ بالأسماء الوسيطة (`--background`, `--primary`…) لعدم كسر shadcn.
- `tailwind.config.ts`: mapping للألوان الجديدة + font-families الجديدة.
- `index.html`: استبدال الخطوط بـ IBM Plex Sans Arabic + Manrope (font-display: swap).
- **الصفحة الرئيسية** (`src/pages/Home.tsx` + `src/components/editorial/*`): إعادة تصميم كامل وفق §7 (14 قسمًا) بلغة Coal + Gold.
- Header + Footer + MegaMenu + AnnouncementBar (§7.1–7.2, 7.14).
- Product Listing + Product Detail (§8).
- Cart + Checkout + Order Success + Track Order.
- صفحات B2B: `/wholesale` + `/export` مع نموذج التأهيل الكامل (§9).
- لوحة الإدارة: تنظيم موديولات §10 على الموجود حاليًا (بدون إعادة بناء كاملة).

## 3) ما سيُضاف (جديد)

- مسارات: `/our-story`, `/sustainability`, `/journal`, `/journal/[slug]`, `/order-success`, `/shipping-returns`, `/verify-batch`.
- جداول جديدة (Migration واحدة، غير مدمّرة): `addresses`, `product_variants`, `product_images`, `categories`, `carts`, `cart_items`, `order_items`, `articles`, `testimonials`, `newsletter_subscribers`, `wholesale_leads`, `export_leads`, `site_settings`, `certifications`, `production_batches`, `inventory_movements`.
- مكوّنات مكتبة الواجهة الـ31 المطلوبة (§17).
- Schema JSON-LD: Organization, WebSite, BreadcrumbList, Product, Offer, FAQPage, Article.
- `hreflang` كامل + sitemap ديناميكي متعدد اللغات.

## 4) ما سيُحذف

- الثيمات القديمة (`data-theme="noir"`, `"sand"`, hue slider) — تعارض مع هوية Coal الجديدة.
- أي أصل تصميم "Emerald Prestige" غير مستخدم بعد الترقية (تنظيف dead-code لاحقًا عبر knip).
- عدم حذف أي بيانات أو Edge Function.

## 5) مخاطر يجب التنبّه لها

1. **بوابة الدفع**: الملف يمنع محاكاة نجاح الدفع. Checkout الحالي ينشئ طلبًا بدون charge. الحل: طبقة Integration فارغة + طلب مفاتيح Stripe/Moyasar عند اعتمادها (secret via add_secret).
2. **بيانات وهمية**: الملف يمنع Lorem / logos / testimonials وهمية. سنعتمد Empty States واضحة حتى يزود المدير محتوى حقيقي.
3. **الأداء**: Lighthouse ≥90 على الجوال — نحتاج تحسين حزم framer-motion و three.js إن بقيت.
4. **502 Bad Gateway (P0)**: الملف يذكر خطأ خارجي. الاستضافة عبر Lovable — يُبلَّغ للفريق ولا يُعالج من داخل الكود.

---

## 6) الخطة الزمنية (7 مراحل، دفعات قابلة للاعتماد)

كل مرحلة = رسالة/دفعة تنتهي بـ Diff قابل للمراجعة.

### Phase 1 — Foundation (هذه الدفعة إن اعتُمدت)
- استبدال `src/index.css` بطبقة tokens جديدة (Coal + Palm Gold + Ember + Ivory).
- تحديث `tailwind.config.ts` بالألوان والخطوط الجديدة.
- تحميل IBM Plex Sans Arabic + Manrope في `index.html` (preconnect + swap).
- تحديث `mem://index.md` بالهوية الجديدة.
- إزالة `data-theme` toggle من `ThemeToggle.tsx` (اختصاره لـ Auto/Light/Dark فقط).

### Phase 2 — Header + Footer + Announcement + MegaMenu
- `AnnouncementBar` (dismissible + localStorage).
- إعادة صياغة `LuxNav` بألوان Coal + MegaMenu للمنتجات.
- Footer وفق §7.14 مع `tel:+966540060085`.

### Phase 3 — Home (14 قسمًا)
- إعادة بناء `Home.tsx` وأقسام `editorial/*` وفق §7.1–7.14.

### Phase 4 — Commerce
- `/products` (فلاتر + URL params + skeleton).
- `/products/[slug]` (Gallery + Variants + Specs Accordion + JSON-LD Product).
- `/cart`, `/checkout`, `/order-success`, `/track-order`.
- Migration الجداول التجارية الجديدة.

### Phase 5 — B2B + Content
- `/wholesale`, `/export` + نموذج التأهيل + جدولا `wholesale_leads`/`export_leads`.
- `/our-story`, `/sustainability`, `/journal`, `/journal/[slug]`, `/verify-batch`, `/shipping-returns`.

### Phase 6 — Admin polish
- تنظيم موديولات §10 داخل `AdminLayout` الحالي (لا إعادة بناء).
- CRUD للمنتجات/المقالات/الشهادات/AnnouncementBar/SEO.

### Phase 7 — Hardening
- Accessibility (WCAG 2.2 AA) sweep.
- Performance (LCP/CLS/INP) + budgets.
- SEO (hreflang + sitemap + robots).
- QA smoke على 320/375/768/1024/1440/1920.
- Cross-browser via Playwright.

---

## 7) الاعتماد المطلوب

قل **"ابدأ Phase 1"** فقط، وأنفّذ الدفعة الأولى (Foundation) في رسالة واحدة، ثم أنتقل للتي تليها بعد اعتمادك — أو **"ابدأ كل المراحل تباعًا"** لأخوض الدفعات جميعها بدون توقف بينها (يستهلك رصيدًا كبيرًا وقد يستغرق عدة جولات).
