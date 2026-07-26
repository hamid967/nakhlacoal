# خطة: توحيد نظام `brandTokens` عبر الواجهة

## الوضع الحالي

- `src/lib/brandTokens.ts` يعرّف لوحة **Emerald Prestige** (hex) لكن التطبيق فعليًا يعمل على لوحة **Emerald Palm** المعرّفة في `src/index.css` بصيغة HSL، ومكشوفة كـ utilities في `tailwind.config.ts` (`bg-gold`, `text-jade`, `shadow-luxe`…).
- النتيجة: `brandTokens` نظري فقط، والمكوّنات ما زالت تخلط بين tokens وقيم ثابتة (hex عشوائي، أحجام px، ظلال مكتوبة يدويًا).

الهدف: **مصدر واحد للحقيقة** — `brandTokens.ts` يعكس ما في `index.css`، ثم استبدال القيم الثابتة في المكوّنات بـ utilities الرسمية.

## الخطوات

### 1) مزامنة `brandTokens.ts` مع الرانتايم (لا تغيير بصري)
- تحديث `brandColors` لتطابق قيم HSL في `index.css` بالضبط (Emerald Palm + Gold).
- إضافة helper `token(name)` يعيد `hsl(var(--name))` لاستخدامه في inline styles عند الضرورة.
- إضافة `shadows.luxe/gold` و`gradients` كمراجع للأسماء الموجودة في Tailwind.
- إبقاء `logoSizes` و`iconSizes` كما هي (مستخدمة عبر `BrandIcon`).

### 2) توسيع Tailwind بالتوكنز الناقصة
في `tailwind.config.ts` نضيف:
- `spacing`: القيم من `brandTokens.spacing` بأسماء `brand-xs…brand-4xl`.
- `borderRadius`: القيم من `brandTokens.radii`.
- `boxShadow.soft` و`boxShadow.card` و`boxShadow.lift` (Luxe و Gold موجودان).
- `transitionDuration.{fast,base,slow,cinematic}` و`transitionTimingFunction.brand`.

### 3) كنس القيم الثابتة في المكوّنات
مسح تلقائي عبر `rg` ثم استبدال:

| نمط ثابت | البديل التوكن |
|---|---|
| `bg-[#...] / text-[#...] / border-[#...]` (hex عشوائي) | أقرب utility (`bg-gold`, `text-jade`, `bg-dark`…) |
| `shadow-[0_...]` أو `boxShadow` inline | `shadow-luxe / shadow-gold / shadow-card` |
| `rounded-[Npx]` | `rounded-{sm,md,lg,xl,pill}` |
| `w-[Npx] h-[Npx]` على أيقونات/شعارات | `size-{iconSizes|logoSizes}` من `brandTokens` عبر `BrandIcon` |

النطاق (المكوّنات الأعلى ظهورًا فقط في هذه الجولة، حفاظًا على مدى محدود):
- `src/components/editorial/*` (Hero, CraftProcess, QualityLab, Lifestyle, Texture, Origin, ProductShowcase, FeatureCta, primitives)
- `src/components/LuxNav.tsx`, `TaglineStrip.tsx`, `SplashScreen.tsx`, `WhatsAppFab.tsx`, `AssistantWidget.tsx`
- `src/components/ui-lux/*`

نستثني في هذه الجولة: صفحات الأدمن، `chartsRecharts`، مكوّنات `shadcn/ui` الأصلية.

### 4) قاعدة lint خفيفة
إضافة سكربت `scripts/audit-tokens.mjs` يفحص:
- استخدام hex في ملفات `.tsx/.css` خارج `index.css` و`brandTokens.ts`.
- `shadow-[...]` و`rounded-[Npx]` كتحذيرات.

يُضاف إلى `package.json` كـ `audit:tokens` (لا يفشل البناء).

### 5) توثيق
تحديث `docs/BRAND_IDENTITY.md`:
- جدول «Utility ↔ Token» (مثال: `bg-gold` → `--gold` → `brandColors.gold[500]`).
- قاعدة: **لا hex في المكوّنات — استعمل utilities**.

## التفاصيل التقنية

- الجولة لا تغيّر أي HSL موجود؛ فقط تعكسه في `brandTokens.ts` وتستبدل قيمًا مكافئة بصريًا في المكوّنات.
- أي `#hex` في مكوّن لا يوجد له مقابل توكن → يُترك مع تعليق `// TODO(tokens)` بدل الحذف، ويُدرج في تقرير `audit:tokens`.
- التحقق: `bunx tsgo`، ثم Playwright screenshot للصفحة الرئيسية قبل/بعد للتأكد من عدم وجود انحراف بصري.

## ما هو خارج النطاق

- تغيير أي لون فعلي (تنسيق فقط).
- إضافة theme variants جديدة.
- refactor صفحات الأدمن أو Recharts.
