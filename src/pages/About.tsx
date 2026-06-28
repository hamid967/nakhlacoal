import { useTranslation } from 'react-i18next';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function About() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const timeline = t('about.timeline', { returnObjects: true }) as { year: string; label: string }[];

  return (
    <>
      <SEO
        title={isAr ? 'من نحن — فحم النخلة' : 'About — Palm Charcoal'}
        description={t('about.story')}
        path="/about"
      />
      <PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} subtitle={t('about.story')} />

      <section className="py-32">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6">
          {['mission', 'vision', 'values'].map((key, i) => {
            const item: any = t(`about.${key}`, { returnObjects: true });
            return (
              <ScrollReveal key={key} delay={i * 100}>
                <div className="h-full p-10 rounded-2xl bg-surface border-luxe">
                  <div className="text-xs uppercase tracking-[0.3em] text-gold mb-6">0{i + 1}</div>
                  <h3 className={`text-3xl mb-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{item.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{item.body}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="py-32 bg-surface border-y border-gold/10">
        <div className="container">
          <ScrollReveal>
            <h2 className={`text-4xl md:text-5xl text-center mb-20 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
              {t('about.timelineTitle')}
            </h2>
          </ScrollReveal>
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute top-0 bottom-0 start-4 md:start-1/2 md:-translate-x-px w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            <div className="space-y-12">
              {timeline.map((t, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className={`relative flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="absolute start-4 md:start-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-gold shadow-gold" />
                    <div className="ps-14 md:ps-0 md:w-1/2 md:px-12">
                      <div className={`text-3xl text-gold-hi mb-1 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{t.year}</div>
                      <p className="text-sm text-foreground/70">{t.label}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
