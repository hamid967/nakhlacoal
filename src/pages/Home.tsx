import { lazy, memo, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { SectionSkeleton } from '@/components/SectionSkeleton';
// EditorialHero is above-the-fold → keep eager for fast LCP.
import { EditorialHero } from '@/components/editorial';

// Below-the-fold sections are code-split so the initial Home bundle stays
// small and the hero paints as early as possible. Each lazy chunk resolves
// against a reserved-height <SectionSkeleton> to keep CLS ≈ 0.
const OriginStorySection = lazy(() =>
  import('@/components/editorial/OriginStorySection').then((m) => ({
    default: m.OriginStorySection,
  })),
);
const ProductShowcaseSection = lazy(() =>
  import('@/components/editorial/ProductShowcaseSection').then((m) => ({
    default: m.ProductShowcaseSection,
  })),
);
const CraftProcessSection = lazy(() =>
  import('@/components/editorial/CraftProcessSection').then((m) => ({
    default: m.CraftProcessSection,
  })),
);
const QualityLabSection = lazy(() =>
  import('@/components/editorial/QualityLabSection').then((m) => ({
    default: m.QualityLabSection,
  })),
);
const LifestyleGridSection = lazy(() =>
  import('@/components/editorial/LifestyleGridSection').then((m) => ({
    default: m.LifestyleGridSection,
  })),
);
const TextureFeatureSection = lazy(() =>
  import('@/components/editorial/TextureFeatureSection').then((m) => ({
    default: m.TextureFeatureSection,
  })),
);
const FeatureCtaSection = lazy(() =>
  import('@/components/editorial/FeatureCtaSection').then((m) => ({
    default: m.FeatureCtaSection,
  })),
);

/**
 * الصفحة الرئيسية — Palm Charcoal
 * تجربة موحّدة مبنية على نظام Broken-Grid Editorial.
 * راجع docs/DESIGN_PLAN.md لتفاصيل كل قسم.
 *
 * Perf:
 *  - EditorialHero eager → fastest possible LCP paint (image also preloaded
 *    via vite-plugins/lcp-preload).
 *  - Remaining 7 sections lazy-loaded with reserved-height skeletons.
 *  - Whole tree wrapped in `memo` so Layout re-renders (route change, theme
 *    toggle) don't re-render Home unnecessarily.
 */
function HomeInner() {
  return (
    <>
      <SEO
        title="فحم النخلة | Palm Charcoal — فحم سعودي فاخر"
        description="فحم النخلة السعودي الفاخر — كربنة نقية، احتراق طويل، رماد شبه معدوم. من نخيل الجزيرة العربية إلى موائد العالم."
        path="/"
      />
      <h1 className="sr-only">فحم النخلة | Palm Charcoal — Premium Saudi Charcoal</h1>
      <div className="bg-background text-foreground font-editorial-sans">
        <EditorialHero />
        <Suspense fallback={<SectionSkeleton variant="band" />}>
          <OriginStorySection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <ProductShowcaseSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="timeline" />}>
          <CraftProcessSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <QualityLabSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <LifestyleGridSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="film" />}>
          <TextureFeatureSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton variant="band" />}>
          <FeatureCtaSection />
        </Suspense>
      </div>
      <StickyMobileCTA />
    </>
  );
}

const Home = memo(HomeInner);
export default Home;
