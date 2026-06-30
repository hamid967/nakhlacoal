import { lazy, Suspense } from 'react';
import { WebGLBoundary } from '@/components/WebGLBoundary';
import { Link } from 'react-router-dom';
import { Flame, Clock, Leaf, Wind, ShieldCheck, Award } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';

// Heavy WebGL/3D hero — code-split so it doesn't block first paint
const BrandHero = lazy(() => import('@/components/BrandHero').then((m) => ({ default: m.BrandHero })));
const GoldParticles = lazy(() => import('@/components/GoldParticles').then((m) => ({ default: m.GoldParticles })));
const ProcessSection = lazy(() => import('@/components/ProcessSection').then((m) => ({ default: m.ProcessSection })));
const JourneySection = lazy(() => import('@/components/JourneySection').then((m) => ({ default: m.JourneySection })));
const LocationSection = lazy(() => import('@/components/LocationSection').then((m) => ({ default: m.LocationSection })));
const FaqSection = lazy(() => import('@/components/FaqSection').then((m) => ({ default: m.FaqSection })));

const TrademarksShowcase = lazy(() => import('@/components/TrademarksShowcase').then((m) => ({ default: m.TrademarksShowcase })));


import { Certifications } from '@/components/Certifications';
import { AudienceTracks } from '@/components/AudienceTracks';
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
  TestimonialCard,
  CtaBand,
} from '@/components/ui-lux';

import productBbq from '@/assets/product-bbq.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productLump from '@/assets/product-lump.jpg';
import heroTrademark from '@/assets/trademarks/trademark-0.webp';


export default function Home() {
  const { isAr, Arrow } = useDir();
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

  const reviews = [
    { name: isAr ? 'علي الزهراني' : 'Ali Al-Zahrani', role: isAr ? 'جدة' : 'Jeddah', meta: isAr ? 'معسل وشيشة 💨' : 'Hookah 💨', body: isAr ? 'جربت كثير وما تركت الفحم الصيني — أداء الفحم الطبيعي أحسن بكثير. أنصح الجميع.' : 'Tried many — natural beats imported by far. Highly recommend.' },
    { name: isAr ? 'سعد القحطاني' : 'Saad Al-Qahtani', role: isAr ? 'الرياض' : 'Riyadh', meta: isAr ? 'بخور وعود 🪔' : 'Incense 🪔', body: isAr ? 'استخدمته للبخور في عرس أخوي — الرائحة طلعت رائعة وما حس أحد برائحة الفحم.' : 'Used it for incense at a wedding — pure aroma, zero smoke smell.' },
    { name: isAr ? 'أحمد العتيبي' : 'Ahmed Al-Otaibi', role: isAr ? 'مكة المكرمة' : 'Makkah', meta: isAr ? 'شواء 🔥' : 'BBQ 🔥', body: isAr ? 'اللحم يطلع طعمه مختلف. الحرارة ثابتة من أول الشوية لآخرها بدون إعادة إشعال.' : 'Different flavor entirely. Stable heat from start to finish.' },
  ];

  return (
    <>
      
      <SEO
        title={isAr ? 'فحم النخلة | الفحم السعودي الفاخر' : 'Palm Charcoal | Premium Saudi Charcoal'}
        description={isAr ? 'فحم طبيعي ١٠٠٪ — احتراق أطول، حرارة أعلى، ورماد أقل.' : '100% natural charcoal — longer burn, higher heat, less ash.'}
        path="/"
        preloadImages={[
          { href: heroTrademark, type: 'image/png', fetchPriority: 'high' },
        ]}
      />

      {/* HERO — first impression (lazy-loaded WebGL) */}
      <div className="relative pt-24 md:pt-28">
        <WebGLBoundary>
          <Suspense fallback={null}>
            <GoldParticles className="z-0 opacity-70" />
          </Suspense>
        </WebGLBoundary>
        <div className="relative z-10">
          <Suspense fallback={<SectionSkeleton variant="hero" label={isAr ? 'جارٍ تحميل الواجهة' : 'Loading hero'} />}>
            <BrandHero />
          </Suspense>
        </div>
      </div>


      {/* Trust strip — credibility right after the hero */}
      <section className="mt-2 md:mt-6">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {topStrip.map((f, i) => <TrustItem key={i} icon={f.icon} text={f.text} index={i} />)}
        </div>
      </section>


      <SectionDivider />

      {/* Audience tracks — clear commercial paths: Individuals / Wholesale / Export */}
      <AudienceTracks />



      {/* Features */}
      <LuxSection tone="surface">
        <div className="container"><SectionNumber index={2} /></div>
        <SectionHeader
          eyebrow={isAr ? 'لماذا فحم النخلة' : 'Why Palm Charcoal'}
          title={isAr ? 'تفوّق ملموس في كل تفصيلة' : 'Excellence in every detail'}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => <FeatureCard key={i} icon={f.icon} title={f.title} body={f.body} index={i} />)}
        </div>

        {/* Technical metrics strip */}
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

      <SectionDivider flip />

      {/* Products — move higher for conversion */}
      <LuxSection tone="surface" className="section">
        <div className="container"><SectionNumber index={3} /></div>
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

      <SectionDivider />



      <Suspense fallback={<SectionSkeleton variant="timeline" />}>
        <ProcessSection />
        <JourneySection />
      </Suspense>


      <SectionDivider flip />

      {/* About band — story after the user has seen products & process */}
      <LuxSection className="section">
        <div className="container"><SectionNumber index={5} align="end" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ScrollReveal className="lg:col-span-7">
            <Eyebrow>{isAr ? 'من نحن' : 'Our story'}</Eyebrow>
            <h2 className={`my-6 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
              {isAr ? 'الخيار الأمثل لعشاق الجودة' : 'The first choice for quality lovers'}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-foreground/75 mb-8 font-arabic max-w-2xl">
              {isAr ? 'فحم النخلة هو الخيار الأمثل لعشاق الجودة. نحرص على تقديم فحم طبيعي ١٠٠٪ يتم إنتاجه بأحدث التقنيات وبمعايير عالمية ليمنحك أفضل تجربة.' : 'Palm Charcoal is the first choice for quality lovers — 100% natural, latest tech, international standards.'}
            </p>
            <LuxButton to="/about" variant="ghost" withArrow>{isAr ? 'تعرف علينا أكثر' : 'Learn more'}</LuxButton>
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

      {/* Certifications */}
      <Certifications />

      <Suspense fallback={<SectionSkeleton variant="grid" />}>
        <TrademarksShowcase />
      </Suspense>

      <SectionDivider />

      {/* Testimonials */}
      <LuxSection tone="dark" className="section">
        <div className="container"><SectionNumber index={6} /></div>
        <SectionHeader
          eyebrow={isAr ? 'آراء عملائنا' : 'Customer voices'}
          title={isAr ? 'ثقة تتجدد مع كل تجربة' : 'Trusted with every order'}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => <TestimonialCard key={i} {...r} index={i} />)}
        </div>
      </LuxSection>

      <Suspense fallback={<SectionSkeleton variant="band" />}>
        <FaqSection />
        <LocationSection />
      </Suspense>


      <CtaBand
        title={isAr ? 'جاهز لتجربة الفحم الفاخر؟' : 'Ready to taste the premium difference?'}
        lead={isAr ? 'تواصل معنا الآن واحصل على عرض خاص لجملة وتجزئة وتصدير.' : 'Contact us for wholesale, retail and export offers.'}
        ctaLabel={isAr ? 'تواصل معنا' : 'Contact us'}
        ctaTo="/contact"
      />

      <StickyMobileCTA />
    </>
  );
}

