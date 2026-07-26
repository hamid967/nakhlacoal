import {
  EditorialHero,
  OriginStorySection,
  ProductShowcaseSection,
  CraftProcessSection,
  QualityLabSection,
  LifestyleGridSection,
  TextureFeatureSection,
  FeatureCtaSection,
} from './index';

/**
 * BrokenGridHome — الصفحة الرئيسية للنسخة الافتتاحية
 * تتكوّن من ٨ أقسام مستقلة قابلة لإعادة الاستخدام.
 * راجع docs/DESIGN_PLAN.md للحصول على تفصيل كل قسم.
 */
export function BrokenGridHome() {
  return (
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
  );
}

export default BrokenGridHome;
