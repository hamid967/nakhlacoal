import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShoppingCart, MessageCircle, Check, Package, Flame, Clock, Wind, Droplets, Thermometer } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { WhatsAppFab } from '@/components/WhatsAppFab';
import { products, getProduct } from '@/data/products';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const product = getProduct(slug);
  if (!product) return <Navigate to="/products" replace />;

  const name = isAr ? product.nameAr : product.nameEn;
  const tagline = isAr ? product.taglineAr : product.taglineEn;
  const desc = isAr ? product.descAr : product.descEn;
  const features = isAr ? product.featuresAr : product.featuresEn;
  const useCases = isAr ? product.useCasesAr : product.useCasesEn;

  const specIcons = [
    { icon: Clock, label: isAr ? 'مدة الاحتراق' : 'Burn time', value: product.specs.burn },
    { icon: Flame, label: isAr ? 'الحرارة' : 'Heat', value: product.specs.heat },
    { icon: Wind, label: isAr ? 'الرماد' : 'Ash', value: product.specs.ash },
    { icon: Thermometer, label: isAr ? 'الكربون' : 'Carbon', value: product.specs.carbon },
    { icon: Droplets, label: isAr ? 'الرطوبة' : 'Moisture', value: product.specs.moisture },
    { icon: Package, label: isAr ? 'التغليف' : 'Packaging', value: product.specs.packaging },
  ];

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <SEO
        title={`${name} | ${isAr ? 'فحم النخلة' : 'Palm Charcoal'}`}
        description={desc}
        path={`/products/${product.slug}`}
      />

      {/* ============= HERO ============= */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="container">
          {/* Breadcrumb */}
          <ScrollReveal>
            <nav className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-8 flex items-center gap-2">
              <Link to="/" className="hover:text-gold-hi transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-gold-hi transition-colors">{isAr ? 'المنتجات' : 'Products'}</Link>
              <span>/</span>
              <span className="text-gold-hi">{name}</span>
            </nav>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
            {/* Image */}
            <ScrollReveal>
              <div className="relative rounded-3xl overflow-hidden border-luxe-strong shimmer-card aspect-square section-dark">
                <div className="absolute inset-0 ember-glow opacity-40 pointer-events-none" />
                <img src={product.image} alt={name} className="relative w-full h-full object-cover" width={1280} height={1280} />
              </div>
            </ScrollReveal>

            {/* Copy */}
            <ScrollReveal delay={120}>
              <div>
                <span className="eyebrow mb-4">{isAr ? 'منتج فاخر' : 'Premium product'}</span>
                <h1 className={`text-4xl sm:text-5xl md:text-6xl mt-4 mb-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                  <span className="text-gold-metal">{name}</span>
                </h1>
                <p className="text-lg md:text-xl text-gold-hi mb-5 font-arabic">{tagline}</p>
                <p className="text-sm md:text-base text-foreground/70 leading-loose mb-8">{desc}</p>

                {/* Features list */}
                <ul className="space-y-3 mb-10">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-gold/15 border-luxe-strong flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-gold-hi" />
                      </span>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="btn-gold">
                    <ShoppingCart className="w-4 h-4" /> {isAr ? 'اطلب عرض سعر' : 'Request a quote'}
                  </Link>
                  <a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer" className="btn-ghost-gold">
                    <MessageCircle className="w-4 h-4" /> {isAr ? 'تواصل واتساب' : 'WhatsApp us'}
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============= SPECS ============= */}
      <section className="py-20 md:py-28 section-dark relative overflow-hidden">
        <div className="absolute inset-0 ember-glow opacity-20 pointer-events-none" />
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12 md:mb-16">
              <span className="eyebrow mb-5">{isAr ? 'المواصفات' : 'Specifications'}</span>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl mt-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                {isAr ? 'مواصفات تقنية ' : 'Technical '}<span className="text-gold-metal">{isAr ? 'دقيقة' : 'specs'}</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {specIcons.map((s, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="p-5 rounded-2xl bg-surface border-luxe text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border-luxe-strong flex items-center justify-center mx-auto mb-3">
                    <s.icon className="w-5 h-5 text-gold-hi" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1">{s.label}</div>
                  <div className="text-base font-bold text-gold-hi">{s.value}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============= USE CASES ============= */}
      <section className="py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-14">
              <span className="eyebrow mb-5">{isAr ? 'الاستخدامات' : 'Use cases'}</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl mt-4 font-arabic font-bold">
                {isAr ? 'مثالي ' : 'Built '}<span className="text-gold-metal">{isAr ? 'لـ' : 'for'}</span>
              </h2>
              <div className="mt-3 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {useCases.map((u, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="p-7 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 text-center h-full">
                  <div className="text-3xl text-gold-metal font-bold mb-3">0{i + 1}</div>
                  <h3 className="text-lg font-arabic font-bold text-gold-hi">{u}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============= RELATED ============= */}
      <section className="py-20 md:py-28 border-t border-gold/10">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-14">
              <span className="eyebrow mb-5">{isAr ? 'منتجات ذات صلة' : 'Related products'}</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl mt-4 font-arabic font-bold">
                {isAr ? 'اكتشف ' : 'Discover '}<span className="text-gold-metal">{isAr ? 'المزيد' : 'more'}</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {related.map((p, i) => {
              const rName = isAr ? p.nameAr : p.nameEn;
              const rTag = isAr ? p.taglineAr : p.taglineEn;
              return (
                <ScrollReveal key={p.slug} delay={i * 80}>
                  <Link to={`/products/${p.slug}`} className="group block rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 overflow-hidden h-full">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={p.image} alt={rName} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-xl mb-2 font-arabic font-bold text-gold-hi">{rName}</h3>
                      <p className="text-xs text-foreground/60 mb-4">{rTag}</p>
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold-hi">
                        {isAr ? 'عرض المنتج' : 'View product'} <Arrow className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <WhatsAppFab />
    </>
  );
}
