import { useTranslation } from 'react-i18next';
import heroEditorial from '@/assets/design/hero-editorial.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { Eyebrow, GoldCTA, GhostCTA } from './primitives';
import { BrandIcon } from '@/components/brand/BrandIcon';

/**
 * القسم 1 — Hero Editorial (بارتفاع شاشة كاملة)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.1
 */
export function EditorialHero() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative min-h-[100vh] bg-dark text-dark-foreground overflow-hidden">
      {/* Image bleed */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
        <ResponsiveImage
          base="hero-editorial"
          fallback={heroEditorial}
          alt=""
          className="h-full w-full object-cover opacity-90"
          fetchPriority="high"
          loading="eager"
          width={1920}
          height={1088}
          sizes="(max-width: 1024px) 100vw, 62vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent lg:from-dark lg:via-dark/40" />
      </div>

      <div className="relative container min-h-[100vh] grid grid-cols-12 items-center py-24 lg:py-32">
        <div
          className="col-span-12 lg:col-span-7 xl:col-span-6 space-y-8"
          dir={isAr ? 'rtl' : 'ltr'}
        >
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
              : "From the palm groves of Arabia to the world's finest tables — pure carbon, long burn, near-zero ash."}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <GoldCTA to="/products">{isAr ? 'اطلب الآن' : 'Shop Now'}</GoldCTA>
            <GhostCTA to="/quote">{isAr ? 'احسب عرض السعر' : 'Get a Quote'}</GhostCTA>
          </div>

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

        <div className="hidden lg:flex absolute right-8 bottom-16 flex-col items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-dark-foreground/40">
          <BrandIcon name="palmMark" size="xl" color="hsl(var(--gold))" title="Palm Charcoal" />
          <span className="h-16 w-px bg-dark-foreground/25" />
          <span style={{ writingMode: 'vertical-rl' }}>Vol. 01 · Origin</span>
        </div>
      </div>
    </section>
  );
}

export default EditorialHero;
