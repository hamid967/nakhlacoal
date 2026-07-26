import { SEO } from '@/components/SEO';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import {
  EditorialHero,
  OriginStorySection,
  ProductShowcaseSection,
  CraftProcessSection,
  QualityLabSection,
  LifestyleGridSection,
  TextureFeatureSection,
  FeatureCtaSection,
} from '@/components/editorial';

/**
 * الصفحة الرئيسية — Palm Charcoal
 * تجربة موحّدة مبنية على نظام Broken-Grid Editorial.
 * راجع docs/DESIGN_PLAN.md لتفاصيل كل قسم.
 */
export default function Home() {
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
        <OriginStorySection />
        <ProductShowcaseSection />
        <CraftProcessSection />
        <QualityLabSection />
        <LifestyleGridSection />
        <TextureFeatureSection />
        <FeatureCtaSection />
      </div>
      <StickyMobileCTA />
    </>
  );
}
