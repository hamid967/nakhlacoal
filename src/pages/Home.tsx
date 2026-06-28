import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Flame, Clock, Leaf, Wind, ShieldCheck, Award, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { WhatsAppFab } from '@/components/WhatsAppFab';
import heroCharcoal from '@/assets/hero-charcoal.jpg';
import productBbq from '@/assets/product-bbq.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productLump from '@/assets/product-lump.jpg';

export default function Home() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: Flame,
      title: isAr ? 'حرارة عالية' : 'High Heat',
      body: isAr ? 'حرارة مرتفعة بأداء ثابت تناسب جميع أنواع الشواء.' : 'Consistent high heat ideal for every grill.',
    },
    {
      icon: Clock,
      title: isAr ? 'احتراق أطول' : 'Longer Burn',
      body: isAr ? 'يدوم لفترة أطول مقارنة بالفحم التقليدي.' : 'Burns longer than ordinary charcoal.',
    },
    {
      icon: Leaf,
      title: isAr ? 'خشب طبيعي' : 'Natural Wood',
      body: isAr ? 'مصنوع من أجود أنواع الخشب الطبيعي ١٠٠٪.' : 'Made from 100% premium natural wood.',
    },
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
    {
      name: isAr ? 'أحمد العتيبي' : 'Ahmed Al-Otaibi',
      role: isAr ? 'صاحب مطعم' : 'Restaurant Owner',
      body: isAr
        ? 'فحم النخلة الأفضل للمعسل والشواء — يدوم طويلاً والرماد قليل. جودة عالية.'
        : 'Palm Charcoal is the best for hookah and grilling — long burn, low ash, premium quality.',
    },
    {
      name: isAr ? 'سعد القحطاني' : 'Saad Al-Qahtani',
      role: isAr ? 'مستخدم منزلي' : 'Home User',
      body: isAr
        ? 'أستخدمه للبخور والعود بدون أي روائح. التعبئة فاخرة والتسليم سريع.'
        : 'I use it for incense and oud — no smell, premium packaging, fast delivery.',
    },
    {
      name: isAr ? 'منى الزهراني' : 'Mona Al-Zahrani',
      role: isAr ? 'شيف' : 'Chef',
      body: isAr
        ? 'حرارة ثابتة ومثالية للشواء البطيء. أصبح خياري الأول في المطبخ.'
        : 'Stable heat, perfect for slow grilling. My first choice in the kitchen.',
    },
  ];

  return (
    <>
      <SEO
        title={isAr ? 'فحم النخلة | الفحم السعودي الفاخر' : 'Palm Charcoal | Premium Saudi Charcoal'}
        description={
          isAr
            ? 'فحم طبيعي ١٠٠٪ مصنوع من أجود أنواع الخشب — احتراق أطول، حرارة أعلى، ورماد أقل.'
            : '100% natural charcoal from the finest wood — longer burn, higher heat, less ash.'
        }
        path="/"
      />

      {/* ===================== TOP TRUST STRIP ===================== */}
      <section className="pt-24 md:pt-28">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {topStrip.map((f, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="flex items-center gap-4 rounded-2xl border-luxe bg-surface/70 backdrop-blur-sm px-5 py-4 hover:border-luxe-strong transition-all duration-500">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gold/15 text-gold-lo shrink-0">
                    <f.icon className="w-5 h-5" />
                  </span>
                  <p className="text-sm font-arabic text-foreground/80 leading-snug">{f.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HERO ===================== */}
      <section className="py-14 md:py-24">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <ScrollReveal className="lg:col-span-6 order-2 lg:order-1">
            <span className="eyebrow mb-6">
              {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
            </span>
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 ${
                isAr ? 'font-arabic font-bold' : 'font-display font-bold'
              }`}
            >
              {isAr ? (
                <>
                  جودة طبيعية..
                  <br />
                  <span className="text-jade italic font-light">احتراق يدوم</span>
                </>
              ) : (
                <>
                  Natural Quality.
                  <br />
                  <span className="text-jade italic font-light">Lasting Burn.</span>
                </>
              )}
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-foreground/75 mb-10 max-w-xl font-arabic">
              {isAr
                ? 'فحم طبيعي ١٠٠٪ مصنوع من أجود أنواع الخشب الطبيعي بدون مواد كيميائية. يمنحك احتراقاً أطول، حرارة عالية، ورماد أقل.'
                : '100% natural charcoal crafted from the finest wood — no chemicals. Longer burn, higher heat, less ash.'}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/products" className="btn-gold !rounded-full group">
                {isAr ? 'تسوق المنتجات' : 'Shop Products'}
                <Arrow className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/about"
                className="text-dark/80 hover:text-gold-lo border-b border-gold/40 hover:border-gold pb-1 font-medium tracking-wide text-sm font-arabic transition-colors"
              >
                {isAr ? 'تعرف علينا أكثر' : 'About us'}
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: '+5', l: isAr ? 'سنوات خبرة' : 'Years' },
                { n: '100%', l: isAr ? 'طبيعي' : 'Natural' },
                { n: '12+', l: isAr ? 'دولة تصدير' : 'Countries' },
              ].map((s, i) => (
                <div key={i} className="text-start">
                  <div className="text-3xl md:text-4xl font-bold text-jade font-display">{s.n}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-foreground/60 mt-1 font-arabic">{s.l}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Image */}
          <ScrollReveal delay={150} className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-[2rem] border-luxe shadow-luxe">
              <img src={heroCharcoal} alt={isAr ? 'فحم النخلة' : 'Palm Charcoal'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 inset-x-6 flex items-center justify-between text-background">
                <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">
                  {isAr ? 'صناعة سعودية' : 'Made in KSA'}
                </span>
                <span className="flex items-center gap-1 text-gold-hi">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </span>
              </div>
            </div>
            {/* Floating badge */}
            <div className="hidden md:flex absolute -bottom-6 -start-6 bg-surface rounded-2xl border-luxe shadow-luxe p-4 items-center gap-3 max-w-[220px]">
              <span className="w-12 h-12 rounded-full bg-jade/10 text-jade flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <div className="text-sm font-bold text-jade font-arabic">{isAr ? 'جودة معتمدة' : 'Certified Quality'}</div>
                <div className="text-[11px] text-foreground/60 font-arabic">{isAr ? 'فحص مخبري دوري' : 'Lab tested'}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===================== 3 FEATURE CARDS ===================== */}
      <section className="py-16 md:py-24 bg-surface/60 border-y border-foreground/10">
        <div className="container">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow mb-4">{isAr ? 'لماذا فحم النخلة' : 'Why Palm Charcoal'}</span>
            <h2 className={`text-3xl md:text-5xl mt-4 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
              {isAr ? 'تفوّق ملموس في كل تفصيلة' : 'Excellence in every detail'}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="group h-full rounded-3xl bg-background border-luxe p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe hover:border-luxe-strong shimmer-card">
                  <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 text-gold-lo flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <f.icon className="w-6 h-6" />
                  </span>
                  <h3 className={`text-2xl mb-3 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>{f.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/70 font-arabic">{f.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ABOUT BAND ===================== */}
      <section className="py-20 md:py-28">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ScrollReveal className="lg:col-span-7">
            <span className="eyebrow mb-5">{isAr ? 'من نحن' : 'Our story'}</span>
            <h2 className={`text-3xl md:text-5xl leading-tight mt-4 mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
              {isAr ? 'الخيار الأمثل لعشاق الجودة' : 'The first choice for quality lovers'}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-foreground/75 mb-8 font-arabic max-w-2xl">
              {isAr
                ? 'فحم النخلة هو الخيار الأمثل لعشاق الجودة. نحرص على تقديم فحم طبيعي ١٠٠٪ يتم إنتاجه بأحدث التقنيات وبمعايير عالمية ليمنحك أفضل تجربة لجميع استخداماتك.'
                : 'Palm Charcoal is the first choice for quality lovers. We craft 100% natural charcoal with the latest technology and international standards to deliver the best experience for every use.'}
            </p>
            <Link to="/about" className="btn-ghost-gold !rounded-full">
              {isAr ? 'تعرف علينا أكثر' : 'Learn more'}
              <Arrow className="w-4 h-4" />
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={150} className="lg:col-span-5">
            <div className="rounded-3xl border-luxe bg-surface p-8 md:p-10">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-6xl md:text-7xl font-bold text-jade font-display leading-none">+5</span>
                <span className="text-sm uppercase tracking-[0.25em] text-foreground/60 font-arabic">{isAr ? 'سنوات' : 'years'}</span>
              </div>
              <p className="text-foreground/70 mb-8 font-arabic">
                {isAr ? 'من الخبرة في صناعة الفحم الفاخر للسوق المحلي والعالمي.' : 'crafting premium charcoal for local and global markets.'}
              </p>
              <div className="divider-luxe my-6" />
              <div className="grid grid-cols-2 gap-6">
                {[
                  { n: '12+', l: isAr ? 'دولة' : 'Countries' },
                  { n: '50K+', l: isAr ? 'عميل' : 'Clients' },
                  { n: '24/7', l: isAr ? 'دعم' : 'Support' },
                  { n: '100%', l: isAr ? 'طبيعي' : 'Natural' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-dark font-display">{s.n}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-foreground/60 font-arabic mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===================== PRODUCTS ===================== */}
      <section className="py-20 md:py-28 bg-surface/60 border-y border-foreground/10">
        <div className="container">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="eyebrow mb-4">{isAr ? 'منتجاتنا' : 'Our products'}</span>
              <h2 className={`text-3xl md:text-5xl mt-4 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
                {isAr ? 'أفضل أنواع الفحم لجميع الاستخدامات' : 'Premium charcoal for every use'}
              </h2>
            </div>
            <Link to="/products" className="text-gold-lo border-b border-gold/40 hover:border-gold pb-1 text-sm font-arabic shrink-0">
              {isAr ? 'عرض كل المنتجات' : 'View all products'}
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {products.map((p, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <Link to="/products" className="group block">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl border-luxe bg-background mb-4 relative">
                    <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-base md:text-lg mb-1 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>{p.name}</h3>
                      <p className="text-xs text-foreground/60 font-arabic">{p.tag}</p>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-dark text-background flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                      <Arrow className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="py-20 md:py-28">
        <div className="container">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow mb-4">{isAr ? 'آراء عملائنا' : 'Customer voices'}</span>
            <h2 className={`text-3xl md:text-5xl mt-4 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
              {isAr ? 'ثقة تتجدد مع كل تجربة' : 'Trusted with every order'}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <figure className="h-full rounded-3xl border-luxe bg-surface p-8 flex flex-col">
                  <span className="flex gap-0.5 text-gold-hi mb-5">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </span>
                  <blockquote className="text-foreground/80 leading-relaxed font-arabic mb-6 flex-1">
                    “{r.body}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 pt-5 border-t border-foreground/10">
                    <span className="w-10 h-10 rounded-full bg-dark text-background flex items-center justify-center font-bold font-display">
                      {r.name.charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-bold font-arabic">{r.name}</div>
                      <div className="text-xs text-foreground/60 font-arabic">{r.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA BAND ===================== */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <ScrollReveal>
            <div className="section-dark rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 ember-glow opacity-50" />
              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8">
                  <h2 className={`text-3xl md:text-5xl leading-tight ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
                    {isAr ? 'جاهز لتجربة الفحم الفاخر؟' : 'Ready to taste the premium difference?'}
                  </h2>
                  <p className="mt-4 text-background/75 font-arabic max-w-xl">
                    {isAr ? 'تواصل معنا الآن واحصل على عرض خاص لجملة وتجزئة وتصدير.' : 'Contact us today for wholesale, retail and export offers.'}
                  </p>
                </div>
                <div className="md:col-span-4 flex md:justify-end gap-3 flex-wrap">
                  <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-dark text-sm font-bold hover:bg-gold-hi transition-colors">
                    {isAr ? 'تواصل معنا' : 'Contact us'}
                    <Arrow className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <WhatsAppFab />
    </>
  );
}
