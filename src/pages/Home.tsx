import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Thermometer, Droplet, Leaf, Wind, Award, Sparkles } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';

const featureIcons = [Flame, Thermometer, Droplet, Leaf, Wind, Award];

export default function Home() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const features = [
    { ...(t('features.longBurn', { returnObjects: true }) as any) },
    { ...(t('features.highHeat', { returnObjects: true }) as any) },
    { ...(t('features.lowAsh', { returnObjects: true }) as any) },
    { ...(t('features.eco', { returnObjects: true }) as any) },
    { ...(t('features.odor', { returnObjects: true }) as any) },
    { ...(t('features.certified', { returnObjects: true }) as any) },
  ];

  return (
    <>
      <SEO
        title={isAr ? 'فحم النخلة | الفحم السعودي الفاخر' : 'Palm Charcoal — Premium Saudi Date-Palm Charcoal'}
        description={isAr
          ? 'فحم نخيل سعودي طبيعي للشواء والشيشة والضيافة الفاخرة. زمن احتراق أطول وحرارة أعلى ورماد أقل.'
          : 'Premium Saudi date-palm charcoal for grilling, hookah, and luxury hospitality. Longer burn, higher heat, lower ash.'}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Palm Charcoal',
          alternateName: 'فحم النخلة',
          url: '/',
          address: { '@type': 'PostalAddress', addressCountry: 'SA', addressLocality: 'Riyadh' },
        }}
      />

      {/* ============= HERO ============= */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Cinematic video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://cdn.coverr.co/videos/coverr-burning-charcoal-7833/1080p.mp4" type="video/mp4" />
        </video>
        {/* Layered darkness */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="absolute inset-0 ember-glow opacity-60 animate-ember pointer-events-none" />

        <div className="container relative z-10 pb-24 pt-40">
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="eyebrow mb-8">{t('hero.eyebrow')}</p>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <h1 className={`text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                <span className="block animate-shine">{isAr ? 'فحم النخلة' : 'Palm Charcoal'}</span>
                <span className="block text-foreground/90 mt-2 text-3xl md:text-5xl lg:text-6xl italic">
                  {t('hero.title')}
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <p className="text-base md:text-lg text-foreground/70 max-w-xl leading-relaxed mb-10">
                {t('hero.subtitle')}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={360}>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-gold">
                  {t('hero.ctaOrder')} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
                <Link to="/wholesale" className="btn-ghost-gold">{t('hero.ctaWholesale')}</Link>
                <Link to="/wholesale" className="btn-ghost-gold">{t('hero.ctaDistributor')}</Link>
                <button className="btn-ghost-gold opacity-60 cursor-not-allowed" title={t('common.soon')}>
                  <Sparkles className="w-4 h-4" /> {t('hero.ctaAssistant')}
                </button>
              </div>
            </ScrollReveal>

            {/* Stat strip */}
            <ScrollReveal delay={500}>
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/15 border-luxe rounded-2xl overflow-hidden glass-luxe">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-surface/60 p-6 text-center">
                    <div className={`text-3xl md:text-4xl text-gold-hi mb-1 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                      {t(`hero.stat${i}`)}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                      {t(`hero.stat${i}Label`)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============= FEATURES ============= */}
      <section className="py-32 relative">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <ScrollReveal><p className="eyebrow justify-center mb-6">{t('features.subtitle')}</p></ScrollReveal>
            <ScrollReveal delay={120}>
              <h2 className={`text-4xl md:text-6xl ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                {t('features.title')}
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="shimmer-card relative h-full p-8 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-700 group">
                    <div className="w-12 h-12 rounded-full bg-gold/10 border-luxe-strong flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-700">
                      <Icon className="w-5 h-5 text-gold-hi" />
                    </div>
                    <h3 className={`text-2xl mb-3 text-foreground ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                      {f.title}
                    </h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============= PRODUCTS TEASER ============= */}
      <section className="py-32 bg-surface border-y border-gold/10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
            <div>
              <ScrollReveal><p className="eyebrow mb-6">{t('products.subtitle')}</p></ScrollReveal>
              <ScrollReveal delay={100}>
                <h2 className={`text-4xl md:text-6xl ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                  {t('products.title')}
                </h2>
              </ScrollReveal>
            </div>
            <Link to="/products" className="btn-ghost-gold">
              {t('products.viewAll')} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['bbq', 'coconut', 'hookah'].map((slug, i) => {
              const item: any = t(`products.items.${slug}`, { returnObjects: true });
              return (
                <ScrollReveal key={slug} delay={i * 100}>
                  <Link to="/products" className="block group shimmer-card relative aspect-[4/5] rounded-2xl overflow-hidden border-luxe">
                    <div className="absolute inset-0 bg-gradient-to-b from-surface-2 via-surface-2 to-background" />
                    <div className="absolute inset-0 ember-glow opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
                    <div className="relative h-full flex flex-col justify-between p-8">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-gold">0{i + 1}</div>
                      <div>
                        <h3 className={`text-3xl mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{item.name}</h3>
                        <p className="text-sm text-foreground/60 mb-6 leading-relaxed">{item.desc}</p>
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold-hi">
                          {t('products.viewAll')} <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============= QUALITY CTA ============= */}
      <section className="py-32">
        <div className="container">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden border-luxe-strong glass-luxe p-12 md:p-20 text-center">
              <div className="absolute inset-0 ember-glow opacity-40 animate-ember pointer-events-none" />
              <div className="relative">
                <p className="eyebrow justify-center mb-6">{t('quality.eyebrow')}</p>
                <h2 className={`text-4xl md:text-6xl mb-6 max-w-3xl mx-auto ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                  {t('quality.title')}
                </h2>
                <p className="text-foreground/60 max-w-xl mx-auto mb-10">{t('quality.subtitle')}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/quality" className="btn-gold">{t('quality.eyebrow')}</Link>
                  <Link to="/contact" className="btn-ghost-gold">{t('contact.title')}</Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
