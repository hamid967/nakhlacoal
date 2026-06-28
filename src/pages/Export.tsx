import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Ship, MapPin, Package, Box } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

const countries = [
  'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
  'Germany', 'France', 'UK', 'Spain', 'Italy', 'Netherlands',
  'Japan', 'South Korea', 'Singapore', 'Hong Kong',
  'USA', 'Canada', 'Brazil', 'Mexico',
];

export default function ExportPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const stats = [
    { icon: MapPin, label: t('exportPage.countries'), value: '32' },
    { icon: Ship, label: t('exportPage.ports'), value: '8' },
    { icon: Box, label: t('exportPage.containers'), value: "20' / 40'" },
    { icon: Package, label: t('exportPage.packaging'), value: '12+' },
  ];

  return (
    <>
      <SEO
        title={isAr ? 'التصدير — فحم النخلة' : 'Export — Palm Charcoal'}
        description={t('exportPage.subtitle')}
        path="/export"
      />
      <PageHero eyebrow={t('exportPage.eyebrow')} title={t('exportPage.title')} subtitle={t('exportPage.subtitle')} />

      <section className="py-24">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 80}>
              <div className="p-8 rounded-2xl bg-surface border-luxe text-center hover:border-luxe-strong transition-all duration-700">
                <s.icon className="w-8 h-8 text-gold-hi mx-auto mb-4" />
                <div className={`text-4xl text-gold-hi mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{s.value}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="py-32 bg-surface border-y border-gold/10">
        <div className="container">
          <ScrollReveal>
            <h2 className={`text-4xl md:text-5xl text-center mb-16 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
              {t('exportPage.countries')}
            </h2>
          </ScrollReveal>
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {countries.map((c, i) => (
              <ScrollReveal key={c} delay={i * 25}>
                <span className="px-5 py-2.5 rounded-full border-luxe text-sm text-foreground/70 hover:border-luxe-strong hover:text-gold-hi transition-all duration-500">
                  {c}
                </span>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link to="/contact" className="btn-gold">{t('exportPage.requestQuote')}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
