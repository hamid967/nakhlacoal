import { Link } from 'react-router-dom';
import { ArrowUpRight, Flame, Leaf, Shield, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import heroEditorial from '@/assets/design/hero-editorial.jpg';
import productHero from '@/assets/design/product-hero.jpg';
import packagingImg from '@/assets/design/packaging.jpg';
import palmOrigin from '@/assets/design/palm-origin.jpg';
import craftProcess from '@/assets/design/craft-process.jpg';
import lifestyleMajlis from '@/assets/design/lifestyle-majlis.jpg';
import textureMacro from '@/assets/design/texture-macro.jpg';
import qualityLab from '@/assets/design/quality-lab.jpg';
import { ResponsiveImage } from './ResponsiveImage';

/* Shared eyebrow chip */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold-ink font-editorial-sans font-medium">
      <span className="h-px w-8 bg-gold/60" />
      {children}
    </span>
  );
}

/* Big decorative section number */
function BigNumber({ n }: { n: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none font-editorial-bold text-gold/10 leading-none"
      style={{ fontSize: 'clamp(140px, 22vw, 320px)' }}
    >
      {n}
    </div>
  );
}

function GoldCTA({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-3 bg-gradient-to-br from-gold-hi to-gold-lo px-8 py-4 text-dark font-editorial-sans font-semibold text-sm uppercase tracking-[0.18em] shadow-[0_18px_40px_-14px_hsl(var(--gold)/0.55)] transition-transform duration-500 hover:-translate-y-0.5"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}

function GhostCTA({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-3 border border-gold/60 text-gold-ink hover:text-gold px-8 py-4 font-editorial-sans font-medium text-sm uppercase tracking-[0.18em] transition-colors duration-500 hover:border-gold"
    >
      {children}
    </Link>
  );
}

export function BrokenGridHome() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <div className="bg-background text-foreground font-editorial-sans">

      {/* ============ 1 · HERO EDITORIAL ============ */}
      <section className="relative min-h-[100vh] bg-dark text-dark-foreground overflow-hidden">
        {/* Image bleed */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
          <ResponsiveImage
            base="hero-editorial"
            fallback={heroEditorial}
            alt=""
            className="h-full w-full object-cover opacity-90"
            {...({ fetchpriority: 'high' } as Record<string, string>)}
            loading="eager"
            width={1920}
            height={1088}
            sizes="(max-width: 1024px) 100vw, 62vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent lg:from-dark lg:via-dark/40" />
        </div>

        <div className="relative container min-h-[100vh] grid grid-cols-12 items-center py-24 lg:py-32">
          {/* Left: text */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-6 space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
            <Eyebrow>{isAr ? 'فحم النخلة السعودي' : 'Saudi Palm Charcoal'}</Eyebrow>
            <h1
              className="font-editorial-bold text-dark-foreground leading-[0.92] tracking-tight"
              style={{ fontSize: 'clamp(56px, 9vw, 148px)' }}
            >
              {isAr ? (
                <>
                  فحم<br />
                  <span className="text-gold italic">النخلة</span>
                </>
              ) : (
                <>
                  Rooted<br />
                  <span className="text-gold italic">in nature.</span>
                </>
              )}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-dark-foreground/75">
              {isAr
                ? 'من نخيل الجزيرة العربية إلى موائد العالم — فحم فاخر بكربنة نقية، احتراق طويل، ورماد شبه معدوم.'
                : 'From the palm groves of Arabia to the world\'s finest tables — pure carbon, long burn, near-zero ash.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <GoldCTA to="/products">{isAr ? 'اطلب الآن' : 'Shop Now'}</GoldCTA>
              <GhostCTA to="/quote">{isAr ? 'احسب عرض السعر' : 'Get a Quote'}</GhostCTA>
            </div>

            {/* Certifications strip */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-10 text-[11px] uppercase tracking-[0.28em] text-dark-foreground/50">
              <span>ISO 9001</span>
              <span className="h-px w-6 bg-dark-foreground/25" />
              <span>ZATCA</span>
              <span className="h-px w-6 bg-dark-foreground/25" />
              <span>SASO</span>
              <span className="h-px w-6 bg-dark-foreground/25" />
              <span>{isAr ? 'صنع في السعودية' : 'Made in KSA'}</span>
            </div>
          </div>

          {/* Vertical caption */}
          <div className="hidden lg:flex absolute right-8 bottom-16 flex-col items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-dark-foreground/40">
            <span className="h-16 w-px bg-dark-foreground/25" />
            <span style={{ writingMode: 'vertical-rl' }}>Vol. 01 · Origin</span>
          </div>
        </div>
      </section>

      {/* ============ 2 · ORIGIN STORY (broken grid) ============ */}
      <section className="relative bg-background py-24 lg:py-40 overflow-hidden">
        <div className="container grid grid-cols-12 gap-6 lg:gap-10 items-center">
          <div className="col-span-12 lg:col-span-7 relative">
            <div className="absolute -top-16 -left-4 lg:-left-8 z-0">
              <BigNumber n="01" />
            </div>
            <img
              src={palmOrigin}
              alt={isAr ? 'مزارع النخيل السعودية' : 'Saudi palm groves'}
              className="relative z-10 w-full aspect-[16/10] object-cover shadow-luxe"
              loading="lazy"
              width={1920}
              height={1088}
            />
          </div>
          <div
            className="col-span-12 lg:col-span-5 lg:-ml-16 xl:-ml-24 z-20 bg-surface p-8 lg:p-12 space-y-6 shadow-luxe"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <Eyebrow>{isAr ? 'الأصل' : 'Origin'}</Eyebrow>
            <h2
              className="font-editorial-bold leading-[0.95] text-foreground"
              style={{ fontSize: 'clamp(36px, 4.4vw, 68px)' }}
            >
              {isAr ? (
                <>من نخيل المدينة<br /><span className="italic text-jade">إلى موائد العالم</span></>
              ) : (
                <>From Madinah palms<br /><span className="italic text-jade">to the world&apos;s tables</span></>
              )}
            </h2>
            <p className="text-foreground/75 leading-relaxed">
              {isAr
                ? 'نختار جذوع النخيل المتساقطة من مزارع المدينة والقصيم — مادة عضوية فائقة الكثافة تُكربَن ببطء على درجات محكومة لتنتج جمرة نقية بلا مواد كيميائية.'
                : 'We hand-select fallen palm trunks from Madinah and Qassim — dense organic material slow-carbonized at controlled temperatures for a pure, chemical-free ember.'}
            </p>
            <div className="pt-4 flex items-center gap-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              <span>{isAr ? '١٠٠٪ طبيعي' : '100% Natural'}</span>
              <span className="h-px w-8 bg-gold/50" />
              <span>{isAr ? 'خالٍ من المواد الكيميائية' : 'Chemical-free'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3 · PRODUCT SHOWCASE (broken bento) ============ */}
      <section className="relative bg-dark text-dark-foreground py-24 lg:py-32 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 mb-16 items-end" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <Eyebrow>{isAr ? 'مجموعتنا' : 'The Collection'}</Eyebrow>
              <h2
                className="font-editorial-bold leading-[0.95]"
                style={{ fontSize: 'clamp(40px, 5.6vw, 96px)' }}
              >
                {isAr ? (
                  <>منتجات <span className="italic text-gold">مصنوعة بإتقان</span></>
                ) : (
                  <>Crafted <span className="italic text-gold">to perfection</span></>
                )}
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9 space-y-4">
              <p className="text-dark-foreground/70 leading-relaxed">
                {isAr
                  ? 'أربع تشكيلات فاخرة صُممت للطهي المهني، الشيشة، والمناسبات — كل قطعة تحمل هوية النخلة.'
                  : 'Four premium collections engineered for professional cooking, shisha, and hospitality — each carrying the palm signature.'}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-hi text-sm uppercase tracking-[0.22em]"
              >
                {isAr ? 'كل المنتجات' : 'View all'} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Broken bento grid */}
          <div className="grid grid-cols-12 grid-rows-2 gap-4 lg:gap-6" style={{ minHeight: '640px' }}>
            {/* Hero product */}
            <Link
              to="/products"
              className="group relative col-span-12 lg:col-span-7 row-span-2 overflow-hidden bg-dark-2"
            >
              <img
                src={productHero}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <Eyebrow>Signature</Eyebrow>
                <h3 className="mt-3 font-editorial-bold text-4xl lg:text-6xl text-dark-foreground">
                  {isAr ? 'الفاخر' : 'The Signature'}
                </h3>
                <p className="mt-2 text-dark-foreground/70 text-sm max-w-xs">
                  {isAr ? 'مكعبات النخيل الفاخرة — احتراق ٤ ساعات، رماد <٣٪.' : 'Premium palm cubes — 4-hour burn, <3% ash.'}
                </p>
              </div>
            </Link>
            {/* Product B */}
            <Link
              to="/products"
              className="group relative col-span-6 lg:col-span-3 row-span-1 overflow-hidden bg-dark-2"
            >
              <img src={packagingImg} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold">Gift Edition</p>
                <h3 className="mt-1 font-editorial-bold text-2xl">{isAr ? 'الهدية' : 'The Gift'}</h3>
              </div>
            </Link>
            {/* Product C */}
            <Link
              to="/products"
              className="group relative col-span-6 lg:col-span-2 row-span-1 overflow-hidden bg-jade"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-jade to-dark" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <p className="text-xs uppercase tracking-[0.24em] text-gold">Bulk</p>
                <div>
                  <h3 className="font-editorial-bold text-2xl leading-tight">{isAr ? 'الجملة' : 'Wholesale'}</h3>
                  <ArrowUpRight className="mt-2 h-5 w-5 text-gold" />
                </div>
              </div>
            </Link>
            {/* Product D */}
            <Link
              to="/products"
              className="group relative col-span-12 lg:col-span-5 row-span-1 overflow-hidden bg-dark-2"
            >
              <img src={textureMacro} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-transparent" />
              <div className="absolute inset-y-0 left-0 p-6 lg:p-8 flex flex-col justify-center max-w-xs">
                <p className="text-xs uppercase tracking-[0.24em] text-gold">Shisha</p>
                <h3 className="mt-1 font-editorial-bold text-3xl">{isAr ? 'شيشة' : 'Shisha'}</h3>
                <p className="mt-2 text-dark-foreground/70 text-sm">{isAr ? 'كتل ثلاثية عالية الكثافة' : 'High-density triple cubes'}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 4 · CRAFT PROCESS ============ */}
      <section className="relative py-24 lg:py-40 overflow-hidden bg-dark-2 text-dark-foreground">
        <img src={craftProcess} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-2/70 via-dark-2/85 to-dark-2" />

        <div className="relative container" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="max-w-2xl mb-20 space-y-6">
            <Eyebrow>{isAr ? 'الحرفة' : 'The Craft'}</Eyebrow>
            <h2
              className="font-editorial-bold leading-[0.95]"
              style={{ fontSize: 'clamp(40px, 5.6vw, 88px)' }}
            >
              {isAr ? <>أربع خطوات<br /><span className="italic text-gold">من الجذع إلى الجمرة</span></> : <>Four steps<br /><span className="italic text-gold">from trunk to ember</span></>}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 relative">
            {[
              { n: '01', ar: 'الحصاد', en: 'Harvest', ar_d: 'اختيار جذوع النخيل الطبيعية', en_d: 'Selecting fallen palm trunks' },
              { n: '02', ar: 'الكربنة', en: 'Carbonize', ar_d: '٧٢ ساعة على حرارة مضبوطة', en_d: '72 hours at controlled heat' },
              { n: '03', ar: 'التنقية', en: 'Purify', ar_d: 'فحص الكربون في المختبر', en_d: 'Lab-tested carbon content' },
              { n: '04', ar: 'التعبئة', en: 'Package', ar_d: 'تعبئة فاخرة يدوية', en_d: 'Hand-finished premium packaging' },
            ].map((step) => (
              <div key={step.n} className="relative border-t border-gold/30 pt-8 space-y-3">
                <div className="font-editorial-bold text-gold text-5xl">{step.n}</div>
                <h3 className="font-editorial-bold text-2xl text-dark-foreground">{isAr ? step.ar : step.en}</h3>
                <p className="text-dark-foreground/60 text-sm leading-relaxed">{isAr ? step.ar_d : step.en_d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5 · QUALITY LAB (split screen) ============ */}
      <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
        <div className="container grid grid-cols-12 gap-8 lg:gap-16 items-center" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="col-span-12 lg:col-span-6 relative">
            <img
              src={qualityLab}
              alt={isAr ? 'مختبر جودة الفحم' : 'Charcoal quality lab'}
              className="w-full aspect-[4/3] object-cover shadow-luxe"
              loading="lazy"
            />
            <div className="hidden lg:block absolute -bottom-8 -right-8 bg-dark text-dark-foreground p-6 shadow-luxe max-w-[220px]">
              <p className="text-xs uppercase tracking-[0.24em] text-gold">ISO 9001</p>
              <p className="mt-2 text-sm text-dark-foreground/70">{isAr ? 'كل دفعة تُختبر مخبريًا' : 'Every batch lab-tested'}</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-10">
            <div className="space-y-6">
              <Eyebrow>{isAr ? 'الجودة' : 'Quality'}</Eyebrow>
              <h2
                className="font-editorial-bold leading-[0.95] text-foreground"
                style={{ fontSize: 'clamp(36px, 4.6vw, 72px)' }}
              >
                {isAr ? <>معايير <span className="italic text-jade">لا تقبل التنازل</span></> : <>Standards <span className="italic text-jade">without compromise</span></>}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10">
              {[
                { v: '85%', l: isAr ? 'كربون ثابت' : 'Fixed carbon' },
                { v: '<8%', l: isAr ? 'الرطوبة' : 'Moisture' },
                { v: '4-5h', l: isAr ? 'مدة الاحتراق' : 'Burn time' },
                { v: '<3%', l: isAr ? 'الرماد' : 'Ash content' },
              ].map((stat) => (
                <div key={stat.l} className="border-t border-gold/40 pt-4">
                  <div className="font-editorial-bold text-4xl lg:text-5xl text-foreground">{stat.v}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6 · LIFESTYLE MASONRY ============ */}
      <section className="relative bg-surface-2 py-24 lg:py-32 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-12 gap-6 mb-16 items-end" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <Eyebrow>{isAr ? 'التجربة' : 'The Ritual'}</Eyebrow>
              <h2
                className="font-editorial-bold leading-[0.95] text-foreground"
                style={{ fontSize: 'clamp(36px, 4.8vw, 76px)' }}
              >
                {isAr ? <>لحظات <span className="italic text-jade">تُشعلها الجمرة</span></> : <>Moments <span className="italic text-jade">the ember creates</span></>}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <div className="col-span-12 md:col-span-7 relative overflow-hidden group">
              <img src={lifestyleMajlis} alt="" className="w-full aspect-[16/10] object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-4 lg:gap-6">
              <div className="relative overflow-hidden group">
                <img src={packagingImg} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="relative overflow-hidden group">
                <img src={productHero} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 7 · TEXTURE FEATURE ============ */}
      <section className="relative bg-dark text-dark-foreground overflow-hidden">
        <div className="relative">
          <img src={textureMacro} alt="" className="w-full h-[70vh] object-cover opacity-70" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6" dir={isAr ? 'rtl' : 'ltr'}>
              <Eyebrow>Palm Carbon</Eyebrow>
              <h2
                className="font-editorial-bold leading-[0.9] text-dark-foreground mt-6"
                style={{ fontSize: 'clamp(56px, 12vw, 200px)' }}
              >
                {isAr ? <>مادة عضوية <span className="italic text-gold">١٠٠٪</span></> : <>100% <span className="italic text-gold">organic</span></>}
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8 · FEATURES + FINAL CTA ============ */}
      <section className="relative bg-dark-2 text-dark-foreground py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--gold) / 0.25), transparent 60%)' }}
        />
        <div className="relative container" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {[
              { Icon: Flame, ar: 'حرارة عالية', en: 'High Heat' },
              { Icon: Clock, ar: 'احتراق طويل', en: 'Long Burn' },
              { Icon: Leaf, ar: 'طبيعي ١٠٠٪', en: '100% Natural' },
              { Icon: Shield, ar: 'جودة موثقة', en: 'Certified Quality' },
            ].map(({ Icon, ar, en }) => (
              <div key={en} className="flex flex-col items-start gap-4 border-t border-gold/30 pt-6">
                <Icon className="h-8 w-8 text-gold" strokeWidth={1.25} />
                <p className="font-editorial-bold text-2xl text-dark-foreground">{isAr ? ar : en}</p>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h2
              className="font-editorial-bold leading-[0.95] text-dark-foreground"
              style={{ fontSize: 'clamp(48px, 7vw, 120px)' }}
            >
              {isAr ? <>ابدأ تجربة <span className="italic text-gold">الفخامة</span></> : <>Begin your <span className="italic text-gold">luxury ritual</span></>}
            </h2>
            <p className="text-dark-foreground/70 max-w-xl mx-auto">
              {isAr
                ? 'تواصل معنا لطلب عينة، عرض سعر للجملة، أو استشارة منتج مخصصة لعملك.'
                : 'Reach out for a sample, wholesale quote, or a tailored product consultation.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <GoldCTA to="/products">{isAr ? 'اطلب الآن' : 'Shop Now'}</GoldCTA>
              <GhostCTA to="/quote">{isAr ? 'احسب عرض السعر' : 'Get a Quote'}</GhostCTA>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BrokenGridHome;
