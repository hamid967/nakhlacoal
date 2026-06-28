# CHANGELOG — فحم النخلة | Palm Charcoal

تتبّع التغييرات المُطبَّقة من تقرير `palm-charcoal-audit.md`.
Format: [أولوية] الملف/الوحدة — الوصف.

## 2026-06-28 — Sprint 1 · Quick Wins

### ✅ مُطبَّق
- 🟡 **`src/components/Certifications.tsx` (جديد)** — شريط شهادات/علامات ثقة بـ٦ بطاقات (علامة تجارية، SASO، طبيعي ١٠٠٪، حلال، ISO، جاهز للتصدير) بتأثير hover ذهبي و ScrollReveal متتالي.
- 🟡 **`src/pages/Home.tsx`** — إدراج `<Certifications />` بين قسم Features وقسم About لرفع الثقة قبل قراءة قصة الشركة.
- 🟢 **`src/components/Layout.tsx`** — تحويل `WhatsAppFab` إلى `React.lazy` + `Suspense` (تخفيف JS الأولي، الـFAB ليس LCP-critical).
- 🟢 **`src/components/ProcessSection.tsx`** (سابقًا) — زر تشغيل/إيقاف + سحب سلس + rAF auto-scroll.
- 🟢 **`src/components/HeroSlideshow.tsx`** (سابقًا) — `loading="eager"` + `fetchpriority="high"` على أول سلايد لـLCP.

### 🔜 معلّق (يتطلب قرار/مفاتيح)
- 🔴 **AI Gateway credits** — إعادة الشحن أو تبديل النموذج الافتراضي (خارج الكود).
- 🔴 **AVIF + responsive srcset** — يتطلب `vite-imagetools` وإعادة بناء جميع `<img>` كـ`<picture>`.
- 🟡 **Admin email on order** — إضافة `RESEND_API_KEY` ودمج Resend في `supabase/functions/submit-order`.
- 🟢 **مدوّنة محتوى** — بنية تحتية + ٤ مقالات أولى.
- 🟢 **light/dark toggle** — إضافة theme provider + تخزين localStorage.
- 🟢 **OG images مخصصة لكل صفحة** — توليد 1200×630 لـHome/Products/About/Contact.

### 📊 المقاييس المستهدفة (تحقق لاحقًا)
- LCP < 2.0s
- Bundle initial < 250KB gzip (بعد lazy FAB)
- Lighthouse Mobile 90+
