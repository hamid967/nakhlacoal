## الهدف
رفع الموقع لمستوى استوديوهات عالمية (Awwwards) عبر دمج 4 توقيعات بصرية بدون كسر البنية الحالية.

## المراحل

### المرحلة 1 — Locomotive: Smooth Scroll + Parallax
- تثبيت `lenis` (الإصدار الحديث من `@studio-freight/lenis`).
- إنشاء `src/components/SmoothScroll.tsx` يلفّ التطبيق ويُفعّل Lenis مع RAF.
- إضافة hook `useParallax(speed)` يستخدم `requestAnimationFrame` + `transform: translate3d`.
- تطبيق Parallax على:
  - صور Hero في `HeroSlideshow.tsx` (speed 0.3).
  - خلفية `LocationSection` و `ProcessSection` (speed 0.5).
- تعطيل Lenis تلقائياً عند `prefers-reduced-motion`.

### المرحلة 2 — Clay: بطاقات منتجات 3D
- إعادة بناء `ProductCard` (المستخدم في `/products` و `Home`) مع:
  - `transform-style: preserve-3d` + tilt بالـ mouse (بدون مكتبة، حساب يدوي).
  - إضاءة gold sheen تتحرك مع المؤشر (radial-gradient overlay).
  - hover: ارتفاع 8px + ظل ذهبي أعمق + تكبير الصورة 1.05.
  - حواف زجاجية رقيقة (border + backdrop-blur).
- تطبيق نفس النمط على بطاقات `AdminOrders` و `AdminInventory` المختصرة.

### المرحلة 3 — Basic: تبسيط الطباعة والمسافات
- توحيد سلم الطباعة في `index.css`:
  - H1: `clamp(3rem, 8vw, 7rem)` — تتبع `-0.04em`.
  - H2: `clamp(2rem, 5vw, 4rem)`.
  - body: 17px / line-height 1.7.
- مضاعفة المسافات الرأسية بين الأقسام (`py-32` بدل `py-20`).
- تقليل عدد الـ CTAs الظاهرة في كل قسم لواحد رئيسي.
- تنظيف `Home.tsx` و `About.tsx` و `Quality.tsx` من الكتل الزائدة.

### المرحلة 4 — Active Theory: WebGL على الانترو/Hero
- استخدام `three` + `@react-three/fiber@^8.18` + `@react-three/drei@^9.122.0` (مثبّتة سابقاً).
- إنشاء `src/components/webgl/GoldParticles.tsx`:
  - 2000 جسيم ذهبي (Points + ShaderMaterial) ينجذبون للمؤشر.
  - Bloom خفيف عبر `@react-three/postprocessing` (اختياري).
- دمج في `SplashScreen.tsx` كطبقة خلف الشعار.
- إنشاء `src/components/webgl/HeroOrb.tsx`: كرة Distort ذهبية شفافة خلف الـ Hero في `Home.tsx`.
- Lazy load بالكامل عبر `React.lazy` + Suspense fallback شفاف.

## ملفات التعديل الرئيسية
- جديد: `SmoothScroll.tsx`, `useParallax.ts`, `webgl/GoldParticles.tsx`, `webgl/HeroOrb.tsx`.
- تعديل: `App.tsx`, `index.css`, `HeroSlideshow.tsx`, `ProductCard` (داخل `Products.tsx` أو ملفه)، `Home.tsx`, `SplashScreen.tsx`.

## ضمانات الأداء
- WebGL خلف `IntersectionObserver` — لا يعمل خارج الشاشة.
- Lenis يحترم `prefers-reduced-motion`.
- جميع مكونات WebGL lazy-loaded → لا تأثير على bundle الأساسي.
- اختبار Lighthouse بعد كل مرحلة.

## التنفيذ
أنفّذ المراحل بالترتيب (1 → 4) في رسائل متتابعة، كل مرحلة قابلة للتحقق بصرياً قبل الانتقال للتالية. هل أبدأ بالمرحلة 1 الآن؟
