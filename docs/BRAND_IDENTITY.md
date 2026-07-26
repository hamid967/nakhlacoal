# حزمة هوية العلامة — Palm Charcoal Brand Identity Kit

مصدر واحد للحقيقة لكل قرارات الهوية البصرية: الأيقونات، الألوان، الخطوط، والمقاسات.
الملفات الأساسية:

- `src/lib/brandTokens.ts` — تعريفات TypeScript لكل التوكنز.
- `src/assets/brand/icons/*.svg` — أيقونات SVG مخصّصة تستعمل `currentColor`.
- `src/components/brand/BrandIcon.tsx` — مكوّن React لعرض الأيقونات بأي لون/حجم.

---

## 1) نظام الألوان — Emerald Prestige

| الدور | التوكن | Hex | الاستخدام |
|---|---|---|---|
| Primary | `emerald.600` | `#2C8C72` | أزرار، روابط، تمييز |
| Deep surface | `emerald.900` | `#0B2A24` | خلفيات داكنة |
| Accent | `gold.500` | `#C9A24B` | تفاصيل فاخرة، حدود ذهبية |
| Accent soft | `gold.100` | `#F6EAC7` | خلفيات دافئة |
| Ink | `ink.950` | `#0A0F0D` | نص أساسي على فاتح |
| Muted | `ink.400` | `#7A8681` | نص ثانوي |
| Canvas | `ink.50`  | `#F5F7F5` | خلفية عامة فاتحة |

**قاعدة التباين**: نص Ink 950 على Canvas 50 = AAA، ذهبي 500 على Emerald 900 = AA للنصوص الكبيرة فقط.

---

## 2) الخطوط

- **Display**: `DM Serif Display` — للعناوين الكبيرة والافتتاحيات.
- **Sans**: `Fira Sans` — للنصوص التشغيلية والواجهات.
- **Arabic Display fallback**: `Reem Kufi`.
- **Arabic Sans fallback**: `IBM Plex Sans Arabic`.

**مقياس الطباعة (Major Third 1.25)**: `xs` 12 → `hero` 104 px.
- H1 Hero: `hero` (6.5rem) / weight 400 / line-height 1.05
- H2: `4xl` / 400 / 1.1
- H3: `2xl` / 500 / 1.2
- Body: `base` / 400 / 1.5
- Caption: `sm` / 400 / 1.4

---

## 3) مقاسات الشعار والأيقونات

| السياق | المقاس (px) | ملاحظة |
|---|---|---|
| Favicon | 16 | تبويب المتصفح |
| شارة (chip) | 24 | داخل السطر |
| Navigation | 32 | القائمة العلوية |
| بطاقة منتج | 48 | Bento cards |
| رأس القسم | 72 | قبل عنوان القسم |
| Hero mark | 120 | الشعار الرئيسي |
| Splash | 240 | شاشة الافتتاح |

**Clear-space**: نصف ارتفاع الشعار حوله كحد أدنى، بلا استثناء.

**أحجام الأيقونات**: `xs` 14 · `sm` 18 · `md` 24 · `lg` 32 · `xl` 48 · `2xl` 64.

---

## 4) مكتبة الأيقونات المخصّصة

| اسم | الاستخدام |
|---|---|
| `palmMark` | شعار مصغّر / بصمة النخلة |
| `charcoalPiece` | تمثيل قطعة الفحم |
| `flame` | ميّزة الاحتراق الطويل |
| `leafSustain` | الاستدامة والزراعة |
| `qualityShield` | ضمان الجودة والاختبارات |
| `shippingCrate` | البيع بالجملة والشحن |
| `labFlask` | مختبر الجودة |
| `majlisCup` | تجربة المجلس / القهوة |

**الاستخدام**:
```tsx
import { BrandIcon } from "@/components/brand/BrandIcon";

<BrandIcon name="flame" size="lg" color="var(--gold-500)" title="احتراق طويل" />
```

كل الأيقونات مبنية على `viewBox="0 0 64 64"` بضربة 1.6 وتستعمل `currentColor` لتتبنّى لون النص المحيط تلقائيًا.

---

## 5) الشبكة والفراغ

- عرض أقصى: **1440px**
- أعمدة: **12** بفاصل **24px**
- إزاحة الشبكة المكسورة (Broken Grid): **±40px** لكسر الإيقاع بشكل مقصود
- سلم الفراغ (8pt): 4 · 8 · 16 · 24 · 40 · 64 · 96 · 128

## 6) الظلال والأنصاف الأقطار

- Radii: `sm 4` · `md 8` · `lg 16` · `xl 24` · `pill 999`
- Shadows: `soft` (بطاقات خفيفة) · `card` (بطاقات) · `lift` (Hover) · `gold` (لمعان ذهبي)

## 7) الحركة

- Durations: fast 180ms · base 320ms · slow 560ms · cinematic 1200ms
- Ease standard: `cubic-bezier(0.2, 0.8, 0.2, 1)`

---

## ملاحظة تشغيل

كل القيم متاحة برمجيًا من `@/lib/brandTokens`. عند إضافة توكن جديد، أضِفه هنا أولًا قبل الاستخدام في المكوّنات لضمان اتساق الهوية.
