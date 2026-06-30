import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, Sparkles, Package } from 'lucide-react';
import { SectionSkeleton } from './SectionSkeleton';

const ProcessSection = lazy(() => import('./ProcessSection').then(m => ({ default: m.ProcessSection })));
const JourneySection = lazy(() => import('./JourneySection').then(m => ({ default: m.JourneySection })));

/**
 * BrandTimeline — merges ProcessSection + JourneySection into one continuous
 * chronological story. A vertical gold rail visually connects the Hero
 * (#hero) at the top to the Products grid (#products) at the bottom.
 */
export function BrandTimeline() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section id="timeline" aria-label={isAr ? 'الخط الزمني للعلامة' : 'Brand timeline'} className="relative">
      {/* Continuous gold rail running through both sub-sections */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-px hidden md:block"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, hsl(var(--gold) / 0.45) 12%, hsl(var(--gold) / 0.45) 88%, transparent 100%)',
        }}
      />

      {/* Anchor pill — comes FROM the hero */}
      <div className="container mx-auto px-4 pt-10 md:pt-14 flex justify-center">
        <a
          href="#hero"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--gold))]/35 bg-[hsl(var(--background))]/60 backdrop-blur-sm text-xs font-arabic text-[hsl(var(--gold-hi))] hover:bg-[hsl(var(--gold))]/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'من الواجهة' : 'From the hero'}</span>
          <span className="opacity-40">·</span>
          <span>{isAr ? 'الفصل ١ — الحكاية' : 'Chapter 1 — The story'}</span>
        </a>
      </div>

      {/* Stage 1 — How it's made (filmstrip) */}
      <Suspense fallback={<SectionSkeleton variant="timeline" />}>
        <ProcessSection />
      </Suspense>

      {/* Mid-rail connector with chevron */}
      <div className="container mx-auto px-4 -my-2 md:-my-4 flex flex-col items-center" aria-hidden>
        <span className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold-hi))]/70 font-mono mb-2">
          {isAr ? 'الفصل ٢' : 'Chapter 2'}
        </span>
        <ArrowDown className="w-4 h-4 text-[hsl(var(--gold-hi))]/70 animate-bounce [animation-duration:2.4s]" />
      </div>

      {/* Stage 2 — Scene-by-scene journey */}
      <Suspense fallback={<SectionSkeleton variant="timeline" />}>
        <JourneySection />
      </Suspense>

      {/* Anchor pill — leads TO the products */}
      <div className="container mx-auto px-4 pb-12 md:pb-16 flex justify-center">
        <a
          href="#products"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[hsl(var(--gold))] text-[hsl(var(--background))] text-sm font-arabic font-bold shadow-[0_10px_30px_-12px_hsl(var(--gold)/0.6)] hover:bg-[hsl(var(--gold-hi))] transition-colors"
        >
          <Package className="w-4 h-4" />
          <span>{isAr ? 'تابع إلى المنتجات' : 'Continue to products'}</span>
          <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
