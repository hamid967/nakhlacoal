import { lazy, memo, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { SectionSkeleton } from '@/components/SectionSkeleton';
// EditorialHero is above-the-fold → keep eager for fastest LCP.
import { EditorialHero } from '@/components/editorial';

// Below-the-fold sections are code-split so the initial Home bundle stays
// small and the hero paints as early as possible.
const OriginStorySection = lazy(() =>
  import('@/components/editorial/OriginStorySection').then((m) => ({ default: m.OriginStorySection })),
);
const ProductShowcaseSection = lazy(() =>
  import('@/components/editorial/ProductShowcaseSection').then((m) => ({ default: m.ProductShowcaseSection })),
);
const CraftProcessSection = lazy(() =>
  import('@/components/editorial/CraftProcessSection').then((m) => ({ default: m.CraftProcessSection })),
);
const QualityLabSection = lazy(() =>
  import('@/components/editorial/QualityLabSection').then((m) => ({ default: m.QualityLabSection })),
);
const LifestyleGridSection = lazy(() =>
  import('@/components/editorial/LifestyleGridSection').then((m) => ({ default: m.LifestyleGridSection })),
);
const TextureFeatureSection = lazy(() =>
  import('@/components/editorial/TextureFeatureSection').then((m) => ({ default: m.TextureFeatureSection })),
);
const TestimonialsSection = lazy(() =>
  import('@/components/editorial/TestimonialsSection').then((m) => ({ default: m.TestimonialsSection })),
);
const JournalPreviewSection = lazy(() =>
  import('@/components/editorial/JournalPreviewSection').then((m) => ({ default: m.JournalPreviewSection })),
);
const NewsletterSection = lazy(() =>
  import('@/components/editorial/NewsletterSection').then((m) => ({ default: m.NewsletterSection })),
);
const FeatureCtaSection = lazy(() =>
  import('@/components/editorial/FeatureCtaSection').then((m) => ({ default: m.FeatureCtaSection })),
);

/**
 * الصفحة الرئيسية — Palm Charcoal
 * Coal · Palm Gold · Ember · Ivory — Editorial rhythm per redesign brief §5.
 *
 * Section order (light/dark cadence):
 *  1. Hero (dark)              — EditorialHero
 *  2. Origin (ivory)           — OriginStorySection
 *  3. Products (ivory)         — ProductShowcaseSection
 *  4. Craft (dark)             — CraftProcessSection
 *  5. Quality lab (ivory)      — QualityLabSection
 *  6. Lifestyle (ivory-2)      — LifestyleGridSection
 *  7. Texture feature (dark)   — TextureFeatureSection
 *  8. Testimonials (ivory)     — TestimonialsSection
 *  9. Journal (surface-2)      — JournalPreviewSection
 * 10. Newsletter (dark)        — NewsletterSection
 * 11. Closing CTA (ivory)      — FeatureCtaSection
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

        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="grid" />}>
          <JournalPreviewSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="band" />}>
          <NewsletterSection />
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
