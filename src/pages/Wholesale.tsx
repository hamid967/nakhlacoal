import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

const tiers = ['tierRestaurant', 'tierLounge', 'tierDistributor', 'tierContainer'] as const;

export default function Wholesale() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <>
      <SEO
        title={isAr ? 'الجملة — فحم النخلة' : 'Wholesale — Palm Charcoal'}
        description={t('wholesale.subtitle')}
        path="/wholesale"
      />
      <PageHero eyebrow={t('wholesale.eyebrow')} title={t('wholesale.title')} subtitle={t('wholesale.subtitle')} />

      <section className="py-32">
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => {
            const item: any = t(`wholesale.${tier}`, { returnObjects: true });
            const featured = i === 1;
            return (
              <ScrollReveal key={tier} delay={i * 80}>
                <div className={`fm-card relative h-full p-8 flex flex-col ${featured ? 'ring-1 ring-gold/60 shadow-[0_24px_60px_-24px_hsl(var(--gold)/0.45)]' : ''}`}>
                  {featured && (
                    <span className="absolute -top-3 ltr:left-6 rtl:right-6 fm-pill !bg-gold !text-dark !border-gold/60">
                      {isAr ? 'الأكثر طلباً' : 'Most Popular'}
                    </span>
                  )}
                  <span className="fm-pill mb-6 self-start">0{i + 1}</span>
                  <h3 className={`text-2xl mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{item.name}</h3>
                  <p className={`text-3xl text-gold-hi mb-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{item.qty}</p>
                  <p className="text-sm text-foreground/60 leading-relaxed mb-8">{item.desc}</p>
                  <Link to="/contact" className="btn-ghost-gold !px-4 !py-2.5 text-xs mt-auto justify-center">
                    {t('products.requestQuote')} <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}

        </div>
      </section>

      <section className="py-32 bg-surface border-y border-gold/10">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <h2 className={`text-4xl md:text-5xl mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                {t('wholesale.register')}
              </h2>
              <p className="text-foreground/60 mb-8 leading-relaxed">{t('wholesale.subtitle')}</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="btn-gold">{t('wholesale.register')}</Link>
                <button className="btn-ghost-gold">
                  <Upload className="w-4 h-4" /> {t('wholesale.uploadDocs')}
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="relative aspect-[4/3] rounded-2xl border-luxe-strong overflow-hidden glass-luxe">
                <div className="absolute inset-0 ember-glow opacity-60 animate-ember" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-6xl text-gold-hi ${isAr ? 'font-arabic font-bold' : 'font-display italic'}`}>
                    {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
