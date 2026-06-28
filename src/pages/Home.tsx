import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Flame, Clock, Leaf, ShieldCheck, Wind, Sparkles,
  ShoppingCart, Package, Calculator, Truck, Users, Star,
  MapPin, Mail, Phone, Instagram, Twitter, Facebook, Youtube,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { WhatsAppFab } from '@/components/WhatsAppFab';
import heroCharcoal from '@/assets/hero-charcoal.jpg';
import productBbq from '@/assets/product-bbq.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productLump from '@/assets/product-lump.jpg';
import productBox from '@/assets/product-box.jpg';

const features = [
  { icon: Clock, title: 'احتراق أطول', desc: 'احتراق أطول لفترة من الفحم العادي' },
  { icon: Flame, title: 'حرارة ثابتة', desc: 'حرارة عالية وثابتة طوال فترة الاستخدام' },
  { icon: Sparkles, title: 'رماد أقل', desc: 'نسبة رماد منخفضة وسهل التنظيف' },
  { icon: Wind, title: 'بدون روائح', desc: 'احتراق نظيف بدون روائح مزعجة' },
  { icon: ShieldCheck, title: 'جودة مضمونة', desc: 'منتج مطابق لأعلى معايير الجودة العالمية' },
  { icon: Leaf, title: 'صديق للبيئة', desc: 'مصنوع من مصادر طبيعية مستدامة' },
];

const products = [
  { img: productBbq, name: 'فحم الشواء', desc: 'مثالي للشواء والرحلات\nاحتراق طويل وحرارة عالية' },
  { img: productCoconut, name: 'فحم جوز الهند', desc: 'صديق للبيئة - احتراق أطول\nرماد أقل - حرارة ثابتة' },
  { img: productHookah, name: 'فحم المعسل', desc: 'لا يغير طعم المعسل\nاحتراق نظيف بدون رائحة' },
  { img: productLump, name: 'الفحم المضغوط', desc: 'كثافة عالية - حرارة قوية\nمناسب للمطاعم والفنادق' },
];

const qualityBars = [
  { label: 'نسبة الكربون', value: 85, suffix: '85%' },
  { label: 'مدة الاحتراق', value: 90, suffix: '4 ساعات' },
  { label: 'نسبة الرماد', value: 12, suffix: '2.5%' },
  { label: 'مستوى الرطوبة', value: 18, suffix: '5%' },
  { label: 'الحرارة', value: 95, suffix: '700°C+' },
];

const quickActions = [
  { icon: Calculator, title: 'حاسبة الفحم', desc: 'احسب الكمية المناسبة لمناسبتك' },
  { icon: Package, title: 'طلب جملة', desc: 'تواصل معنا لطلب كميات كبيرة وأسعار خاصة' },
  { icon: Truck, title: 'تتبع الشحنة', desc: 'تتبع طلبك خطوة بخطوة' },
  { icon: Users, title: 'الوكلاء والموزعون', desc: 'ابحث عن أقرب وكيل أو موزع لنا' },
];

const testimonials = [
  { name: 'أحمد الدوسري', role: 'محب للشواء', text: 'أفضل فحم استخدمته. احتراق طويل ونظيف جداً. أنصح به للجميع.' },
  { name: 'مطعم مذاق الخير', role: 'عميل تجاري', text: 'جودة ممتازة ورماد قليل جداً، مناسب للمطاعم والمناسبات الكبيرة.' },
  { name: 'محمد العتيبي', role: 'محب للمعسل', text: 'فحم المعسل من فحم النخلة لا يغير طعم المعسل إطلاقاً.' },
];

export default function Home() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <>
      <SEO
        title="فحم النخلة | الفحم السعودي الفاخر"
        description="فحم نخيل سعودي طبيعي للشواء والشيشة والضيافة الفاخرة. زمن احتراق أطول وحرارة أعلى ورماد أقل."
        path="/"
      />

      {/* ============= HERO ============= */}
      <section className="relative pt-24 md:pt-28 pb-16">
        <div className="container">
          <div className="relative rounded-3xl section-dark overflow-hidden p-6 md:p-12 lg:p-16">
            <div className="absolute inset-0 ember-glow opacity-40 animate-ember pointer-events-none" />
            <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Image */}
            <ScrollReveal>
              <div className="relative aspect-square rounded-2xl overflow-hidden border-luxe-strong shimmer-card">
                <img src={heroCharcoal} alt="فحم النخلة" className="w-full h-full object-cover" width={1280} height={1280} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                {/* Pagination dots */}
                <div className="absolute bottom-5 start-5 flex gap-2">
                  <span className="w-8 h-0.5 bg-gold" />
                  <span className="w-8 h-0.5 bg-gold/30" />
                  <span className="w-8 h-0.5 bg-gold/30" />
                </div>
              </div>
            </ScrollReveal>

            {/* Copy */}
            <div className={`${isAr ? 'lg:text-right' : 'lg:text-left'}`}>
              <ScrollReveal delay={120}>
                <h1 className={`text-6xl md:text-7xl lg:text-8xl mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                  <span className="text-gold-metal">فحم النخلة</span>
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <p className="text-xl md:text-2xl text-gold-hi mb-6 font-arabic">
                  طاقة طبيعية… جودة تستحق الثقة
                </p>
              </ScrollReveal>
              <ScrollReveal delay={280}>
                <p className="text-base md:text-lg text-foreground/70 leading-loose mb-10 max-w-lg lg:ms-auto">
                  فحم طبيعي فاخر مصنوع من أفضل أنواع الخشب يمنحك احتراق أطول، حرارة ثابتة، ورماد أقل.
                </p>
              </ScrollReveal>

              {/* Mini features */}
              <ScrollReveal delay={360}>
                <div className="flex flex-wrap gap-8 mb-10 lg:justify-end justify-center">
                  {[
                    { icon: Clock, label: 'أطول مدة احتراق' },
                    { icon: Flame, label: 'حرارة عالية وثابتة' },
                    { icon: Leaf, label: 'رماد أقل ونظافة أكثر' },
                  ].map((f, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 text-center">
                      <span className="w-14 h-14 rounded-full border-luxe-strong bg-gold/5 flex items-center justify-center">
                        <f.icon className="w-6 h-6 text-gold-hi" />
                      </span>
                      <span className="text-xs text-foreground/70 max-w-[7rem]">{f.label}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* CTAs */}
              <ScrollReveal delay={440}>
                <div className="flex flex-wrap gap-3 lg:justify-end justify-center">
                  <Link to="/products" className="btn-gold">
                    <ShoppingCart className="w-4 h-4" /> اطلب الآن
                  </Link>
                  <Link to="/wholesale" className="btn-ghost-gold">
                    <Package className="w-4 h-4" /> اطلب بالجملة
                  </Link>
                </div>
              </ScrollReveal>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= WHY US (dark band) ============= */}


      {/* ============= WHY US ============= */}
      <section className="py-24 border-t border-gold/10">
        <div className="container">
          <ScrollReveal>
            <h2 className={`text-3xl md:text-5xl text-center mb-16 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
              لماذا فحم النخلة هو الخيار <span className="text-gold-metal">الأفضل؟</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="shimmer-card h-full p-6 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 text-center group">
                  <div className="w-14 h-14 rounded-full bg-gold/10 border-luxe-strong flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors duration-500">
                    <f.icon className="w-6 h-6 text-gold-hi" />
                  </div>
                  <h3 className="text-base mb-2 font-arabic font-bold text-gold-hi">{f.title}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============= PRODUCTS ============= */}
      <section className="py-24">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-5xl font-arabic font-bold">منتجاتنا</h2>
              <div className="mt-3 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {products.map((p, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="group rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 overflow-hidden h-full flex flex-col">
                  <div className="aspect-square overflow-hidden">
                    <img src={p.img} alt={p.name} loading="lazy" width={800} height={800}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  <div className="p-5 text-center flex-1 flex flex-col">
                    <h3 className="text-xl mb-2 font-arabic font-bold text-gold-hi">{p.name}</h3>
                    <p className="text-xs text-foreground/60 leading-relaxed whitespace-pre-line flex-1">{p.desc}</p>
                    <Link to="/products" className="mt-4 inline-block w-full py-2.5 rounded-full border-luxe text-xs uppercase tracking-[0.2em] text-gold-hi hover:bg-gold/10 transition-colors duration-500">
                      عرض المنتج
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="flex justify-center mt-10">
              <Link to="/products" className="btn-gold">عرض جميع المنتجات</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============= QUALITY + SAUDI ============= */}
      <section className="py-24 border-t border-gold/10">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {/* Quality bars */}
            <ScrollReveal>
              <div className="p-7 rounded-2xl bg-surface border-luxe h-full">
                <h3 className="text-xl mb-6 font-arabic font-bold text-center">نتائج اختبارات الجودة</h3>
                <div className="space-y-5">
                  {qualityBars.map((q, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-2 text-foreground/70">
                        <span>{q.suffix}</span>
                        <span>{q.label}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${q.value}%`, background: 'var(--gradient-gold)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-7 w-full py-3 rounded-full border-luxe text-xs uppercase tracking-[0.2em] text-gold-hi hover:bg-gold/10 transition-colors duration-500">
                  عرض تقرير الجودة الكامل
                </button>
              </div>
            </ScrollReveal>

            {/* Saudi copy */}
            <ScrollReveal delay={120}>
              <div className="p-7 text-center h-full flex flex-col justify-center">
                <div className="mx-auto w-14 h-14 mb-4 rounded-full bg-gold/10 border-luxe-strong flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-gold-hi" />
                </div>
                <h3 className="text-3xl md:text-4xl font-arabic font-bold mb-4 leading-snug">
                  منتج سعودي<br/>
                  <span className="text-gold-metal">بجودة عالمية</span>
                </h3>
                <p className="text-sm text-foreground/60 leading-loose mb-8">
                  نفخر بأن فحم النخلة مصنوع في المملكة العربية السعودية بأيدي خبراء وباستخدام أحدث التقنيات لإنتاج فحم طبيعي فاخر بجودة عالية.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { num: '+10', label: 'دول مستوردة' },
                    { num: '+500', label: 'عميل تجاري' },
                    { num: '+5', label: 'سنوات خبرة' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="text-2xl md:text-3xl text-gold-hi font-arabic font-bold">{s.num}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Box image */}
            <ScrollReveal delay={240}>
              <div className="relative rounded-2xl overflow-hidden border-luxe h-full min-h-[320px]">
                <img src={productBox} alt="علبة فحم النخلة" loading="lazy" width={1024} height={1024}
                  className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============= QUICK ACTIONS ============= */}
      <section className="py-16">
        <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="p-5 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 flex items-center gap-4 group cursor-pointer">
                <span className="w-12 h-12 shrink-0 rounded-full bg-gold/10 border-luxe-strong flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-500">
                  <a.icon className="w-5 h-5 text-gold-hi" />
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-arabic font-bold text-gold-hi mb-1">{a.title}</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ============= TESTIMONIALS ============= */}
      <section className="py-24 border-t border-gold/10">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-arabic font-bold">ماذا يقول عملاؤنا؟</h2>
              <div className="mt-3 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="p-7 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 h-full flex flex-col">
                  <p className="text-sm text-foreground/80 leading-loose mb-5 flex-1">{t.text}</p>
                  <div className="flex gap-0.5 mb-4 justify-center">
                    {[...Array(5)].map((_, k) => (
                      <Star key={k} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 justify-center pt-4 border-t border-gold/10">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/40 to-gold-lo/40 border-luxe-strong" />
                    <div className="text-center">
                      <div className="text-sm font-arabic font-bold text-gold-hi">{t.name}</div>
                      <div className="text-[10px] text-foreground/50">{t.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppFab />
    </>
  );
}
