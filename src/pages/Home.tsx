import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Leaf, Wind, ShieldCheck, Award } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ScrollScene } from '@/components/ScrollScene';

import { EditorialHero } from '@/components/EditorialHero';
import { EditorialStory } from '@/components/EditorialStory';
import { CasesShowcase } from '@/components/CasesShowcase';
import { OpeningCtaBadge } from '@/components/OpeningCtaBadge';
import { AudienceTracks } from '@/components/AudienceTracks';
import { GlowingCubes } from '@/components/GlowingCubes';
import { StatsGrid } from '@/components/StatsGrid';
import { ExportMap } from '@/components/ExportMap';

const BrandTimeline = lazy(() => import('@/components/BrandTimeline').then((m) => ({ default: m.BrandTimeline })));
const LocationSection = lazy(() => import('@/components/LocationSection').then((m) => ({ default: m.LocationSection })));
const FaqSection = lazy(() => import('@/components/FaqSection').then((m) => ({ default: m.FaqSection })));
const TrademarksShowcase = lazy(() => import('@/components/TrademarksShowcase').then((m) => ({ default: m.TrademarksShowcase })));
const OurBrands3D = lazy(() => import('@/components/OurBrands3D'));
const ProductShowcase3D = lazy(() => import('@/components/ProductShowcase3D').then((m) => ({ default: m.ProductShowcase3D })));
const TestimonialsMarquee = lazy(() => import('@/components/TestimonialsMarquee').then((m) => ({ default: m.TestimonialsMarquee })));
const CertificationsWall = lazy(() => import('@/components/CertificationsWall').then((m) => ({ default: m.CertificationsWall })));
const PressLogos = lazy(() => import('@/components/PressLogos').then((m) => ({ default: m.PressLogos })));
const AwardsRibbon = lazy(() => import('@/components/AwardsRibbon').then((m) => ({ default: m.AwardsRibbon })));
const PartnersConstellation = lazy(() => import('@/components/PartnersConstellation').then((m) => ({ default: m.PartnersConstellation })));
const InsightsEditorial = lazy(() => import('@/components/InsightsEditorial').then((m) => ({ default: m.InsightsEditorial })));
const SustainabilityReport = lazy(() => import('@/components/SustainabilityReport').then((m) => ({ default: m.SustainabilityReport })));
const CareersInvite = lazy(() => import('@/components/CareersInvite').then((m) => ({ default: m.CareersInvite })));

import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { SectionSkeleton } from '@/components/SectionSkeleton';
import { SectionDivider } from '@/components/SectionDivider';
import { SectionNumber } from '@/components/SectionNumber';
import { useLiveOrderCount } from '@/hooks/useLiveOrderCount';
import {
  useDir,
  LuxSection,
  SectionHeader,
  Eyebrow,
  LuxButton,
  FeatureCard,
  TrustItem,
  Stat,
  ProductCard,
  CtaBand,
} from '@/components/ui-lux';

import productBbq from '@/assets/product-bbq.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productLump from '@/assets/product-lump.jpg';
import heroTrademark from '@/assets/trademarks/trademark-0.webp';


export default function Home() {
  const { isAr } = useDir();
  const liveOrders = useLiveOrderCount(50000);


  const features = [
    { icon: Flame, title: isAr ? 'حرارة عالية' : 'High Heat', body: isAr ? 'حرارة مرتفعة بأداء ثابت تناسب جميع أنواع الشواء.' : 'Consistent high heat ideal for every grill.' },
    { icon: Clock, title: isAr ? 'احتراق أطول' : 'Longer Burn', body: isAr ? 'يدوم لفترة أطول مقارنة بالفحم التقليدي.' : 'Burns longer than ordinary charcoal.' },
    { icon: Leaf, title: isAr ? 'خشب طبيعي' : 'Natural Wood', body: isAr ? 'مصنوع من أجود أنواع الخشب الطبيعي ١٠٠٪.' : 'Made from 100% premium natural wood.' },
  ];

  const topStrip = [
    { icon: Wind, text: isAr ? 'لا يصدر روائح مزعجة أثناء الاشتعال' : 'No unpleasant odors when lit' },
    { icon: ShieldCheck, text: isAr ? 'منتجاتنا تخضع لأعلى معايير الجودة' : 'Tested against the highest quality standards' },
    { icon: Award, text: isAr ? 'علامات تجارية مسجلة ومعتمدة' : 'Registered & certified trademarks' },
  ];

  const products = [
    { img: productBbq, name: isAr ? 'فحم الشواء' : 'BBQ Charcoal', tag: isAr ? 'للمطاعم والبيوت' : 'Restaurants & Home' },
    { img: productHookah, name: isAr ? 'فحم المعسل' : 'Hookah Charcoal', tag: isAr ? 'للجلسات الفاخرة' : 'Premium Sessions' },
    { img: productCoconut, name: isAr ? 'فحم جوز الهند' : 'Coconut Charcoal', tag: isAr ? 'احتراق نظيف' : 'Clean Burn' },
    { img: productLump, name: isAr ? 'فحم القطع' : 'Lump Charcoal', tag: isAr ? 'قطع كبيرة طبيعية' : 'Large Natural Pieces' },
  ];




  const SITE = 'https://alnakhlacoal.com';
  const absUrl = (u: string) => (u?.startsWith('http') ? u : `${SITE}${u?.startsWith('/') ? '' : '/'}${u || ''}`);
  const productsLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isAr ? 'منتجات فحم النخلة' : 'Palm Charcoal Products',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/products`,
      item: {
        '@type': 'Product',
        name: p.name,
        category: p.tag,
        brand: { '@type': 'Brand', name: 'Palm Charcoal' },
        image: absUrl(p.img),
        url: `${SITE}/products`,
      },
    })),
  };

  // Unified section wrapper — same template for every block
  const Section = ({
    children,
    intensity = 0.4,
    axis = 'y' as 'x' | 'y',
    divider = true,
  }: {
    children: React.ReactNode;
    intensity?: number;
    axis?: 'x' | 'y';
    divider?: boolean;
  }) => (
    <>
      <ScrollScene intensity={intensity} axis={axis}>
        <section className="relative">{children}</section>
      </ScrollScene>
      {divider && <SectionDivider />}
    </>
  );

  // Wrapped-in-Suspense helper for lazy components
  const S = (Cmp: React.ComponentType, variant: React.ComponentProps<typeof SectionSkeleton>['variant'] = 'band') =>
    () => (
      <Suspense fallback={<SectionSkeleton variant={variant} />}>
        <Cmp />
      </Suspense>
    );

  const HeroBlock = () => (
    <div id="hero" className="relative scroll-mt-24">
      <EditorialHero />
      <div className="container mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {topStrip.map((f, i) => <TrustItem key={i} icon={f.icon} text={f.text} index={i} />)}
      </div>
      <OpeningCtaBadge />
    </div>
  );

  const WhyBlock = () => (
    <LuxSection tone="surface">
      <div className="container"><SectionNumber index={3} /></div>
      <SectionHeader
        eyebrow={isAr ? 'لماذا فحم النخلة' : 'Why Palm Charcoal'}
        title={isAr ? 'تفوّق ملموس في كل تفصيلة' : 'Excellence in every detail'}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((f, i) => <FeatureCard key={i} icon={f.icon} title={f.title} body={f.body} index={i} />)}
      </div>
      <ScrollReveal delay={300}>
        <div className="mt-12 md:mt-16 rounded-3xl clay-card-dark p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 text-center">
          {[
            { v: '750°C', l: isAr ? 'حرارة قصوى' : 'Max Heat' },
            { v: '90', l: isAr ? 'دقيقة احتراق' : 'Min Burn' },
            { v: '85%', l: isAr ? 'كربون ثابت' : 'Fixed Carbon' },
            { v: '3%', l: isAr ? 'رماد فقط' : 'Ash Only' },
          ].map((s, i) => (
            <div key={i} className={`${i > 0 ? 'md:border-s md:border-gold/15' : ''}`}>
              <div className="text-3xl md:text-4xl font-bold text-gold-hi font-display leading-none">{s.v}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-background/70 mt-2 font-arabic">{s.l}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </LuxSection>
  );

  const ProductsBlock = () => (
    <LuxSection id="products" tone="surface" className="scroll-mt-24">
      <div className="container"><SectionNumber index={4} /></div>
      <SectionHeader
        align="between"
        eyebrow={isAr ? 'منتجاتنا' : 'Our products'}
        title={isAr ? 'أفضل أنواع الفحم لجميع الاستخدامات' : 'Premium charcoal for every use'}
        action={
          <Link to="/products" className="text-gold-lo border-b border-gold/40 hover:border-gold pb-1 text-sm font-arabic shrink-0">
            {isAr ? 'عرض كل المنتجات' : 'View all products'}
          </Link>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
        {products.map((p, i) => <ProductCard key={i} {...p} index={i} />)}
      </div>
    </LuxSection>
  );

  const AboutBlock = () => (
    <LuxSection>
      <div className="container"><SectionNumber index={6} align="end" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <ScrollReveal className="lg:col-span-7">
          <Eyebrow>{isAr ? 'من نحن' : 'Our story'}</Eyebrow>
          <h2 className={`my-6 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
            {isAr ? 'الخيار الأمثل لعشاق الجودة' : 'The first choice for quality lovers'}
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-foreground/75 mb-8 font-arabic max-w-2xl">
            {isAr ? 'فحم النخلة هو الخيار الأمثل لعشاق الجودة. نحرص على تقديم فحم طبيعي ١٠٠٪ يتم إنتاجه بأحدث التقنيات وبمعايير عالمية ليمنحك أفضل تجربة.' : 'Palm Charcoal is the first choice for quality lovers — 100% natural, latest tech, international standards.'}
          </p>
          <LuxButton to="/about" variant="ghost" withArrow>{isAr ? 'تعرف على قصة فحم النخلة' : 'Read our story'}</LuxButton>
        </ScrollReveal>
        <ScrollReveal delay={150} className="lg:col-span-5">
          <div className="rounded-3xl clay-card p-8 md:p-10">
            <Stat value="+5" label={isAr ? 'سنوات من الخبرة' : 'years of expertise'} size="lg" />
            <div className="divider-luxe my-8" />
            <div className="grid grid-cols-2 gap-6">
              <Stat value="12+" label={isAr ? 'دولة' : 'Countries'} size="sm" />
              <Stat
                value={`${liveOrders.toLocaleString(isAr ? 'ar-SA' : 'en-US')}+`}
                label={
                  <span className="inline-flex items-center gap-2">
                    <span className="relative inline-flex w-2 h-2" aria-hidden>
                      <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                    <span aria-live="polite">{isAr ? 'طلب مُنجز' : 'Orders fulfilled'}</span>
                  </span>
                }
                size="sm"
              />
              <Stat value="24/7" label={isAr ? 'دعم' : 'Support'} size="sm" />
              <Stat value="100%" label={isAr ? 'طبيعي' : 'Natural'} size="sm" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </LuxSection>
  );

  const CtaBlock = () => (
    <CtaBand
      title={isAr ? 'جاهز لتجربة الفحم الفاخر؟' : 'Ready to taste the premium difference?'}
      lead={isAr ? 'تواصل معنا الآن واحصل على عرض خاص لجملة وتجزئة وتصدير.' : 'Contact us for wholesale, retail and export offers.'}
      ctaLabel={isAr ? 'تواصل معنا' : 'Contact us'}
      ctaTo="/contact"
    />
  );

  // Single source of truth for section order — edit here to reorder/add/remove
  const SECTIONS: {
    id: string;
    Component: React.ComponentType;
    intensity?: number;
    axis?: 'x' | 'y';
    divider?: boolean;
  }[] = [
    { id: 'hero',            Component: HeroBlock,                     intensity: 0, divider: false },
    { id: 'story',           Component: EditorialStory,                intensity: 0.5, axis: 'x' },
    { id: 'cubes',           Component: GlowingCubes,                  intensity: 0.7 },
    { id: 'stats',           Component: StatsGrid,                     intensity: 0.4 },
    { id: 'export-map',      Component: ExportMap,                     intensity: 0.5 },
    { id: 'audience',        Component: AudienceTracks },
    { id: 'why',             Component: WhyBlock },
    { id: 'products',        Component: ProductsBlock },
    { id: 'showcase-3d',     Component: S(ProductShowcase3D, 'band') },
    { id: 'cases',           Component: CasesShowcase },
    { id: 'timeline',        Component: S(BrandTimeline, 'timeline') },
    { id: 'about',           Component: AboutBlock },
    { id: 'certifications',  Component: S(CertificationsWall, 'grid') },
    { id: 'press',           Component: S(PressLogos, 'press') },
    { id: 'awards',          Component: S(AwardsRibbon, 'awards') },
    { id: 'brands-3d',       Component: S(OurBrands3D, 'grid') },
    { id: 'trademarks',      Component: S(TrademarksShowcase, 'grid') },
    { id: 'partners',        Component: S(PartnersConstellation, 'constellation') },
    { id: 'testimonials',    Component: S(TestimonialsMarquee, 'band') },
    { id: 'insights',        Component: S(InsightsEditorial, 'grid') },
    { id: 'sustainability',  Component: S(SustainabilityReport, 'grid') },
    { id: 'careers',         Component: S(CareersInvite, 'band') },
    { id: 'faq',             Component: S(FaqSection, 'band') },
    { id: 'location',        Component: S(LocationSection, 'band') },
    { id: 'cta',             Component: CtaBlock, divider: false },
  ];

  // Guard against accidental duplicate ids
  if (import.meta.env.DEV) {
    const ids = SECTIONS.map((s) => s.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) console.warn('[Home] duplicate section ids:', dupes);
  }

  return (
    <>
      <SEO
        title={isAr ? 'فحم النخلة | الفحم السعودي الفاخر' : 'Palm Charcoal | Premium Saudi Charcoal'}
        description={isAr ? 'فحم النخلة السعودي الفاخر من نخيل المدينة المنورة — احتراق أطول، حرارة أعلى، رماد أقل، ودخان نقي. مصنّع ومصدَّر لأفخم المطاعم والفنادق والشيشة عالميًا.' : 'Palm Charcoal — premium Saudi date-palm charcoal delivering longer burn, higher heat, and lower ash. Trusted by luxury restaurants, hotels, and hookah lounges worldwide.'}
        path="/"
        jsonLd={productsLd}
        preloadImages={[{ href: heroTrademark, type: 'image/webp', fetchPriority: 'high' }]}
      />

      {SECTIONS.map(({ id, Component, intensity, axis, divider }) => (
        <Section key={id} intensity={intensity} axis={axis} divider={divider}>
          <div id={id} className="scroll-mt-24"><Component /></div>
        </Section>
      ))}

      <StickyMobileCTA />
    </>
  );
}

