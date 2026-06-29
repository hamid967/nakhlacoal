import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PageIntro, LuxSection, SectionHeader, FeatureCard } from '@/components/ui-lux';
import { Target, Eye, Gem, Award } from 'lucide-react';
import { trademarks } from '@/data/trademarks';

const ICONS = [Target, Eye, Gem] as const;

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

      <PageIntro number={6}
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        lead={t('about.story')}
      />

      {/* Mission / Vision / Values */}
      <LuxSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['mission', 'vision', 'values'] as const).map((key, i) => {
            const item: any = t(`about.${key}`, { returnObjects: true });
            return (
              <FeatureCard
                key={key}
                index={i}
                icon={ICONS[i]}
                title={item.title}
                body={item.body}
              />
            );
          })}
        </div>
      </LuxSection>

      {/* Timeline */}
      <LuxSection tone="surface">
        <SectionHeader title={t('about.timelineTitle')} />
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute top-0 bottom-0 start-4 md:start-1/2 md:-translate-x-px w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
          <div className="space-y-12">
            {timeline.map((entry, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className={`relative flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute start-4 md:start-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-gold shadow-gold" />
                  <div className="ps-14 md:ps-0 md:w-1/2 md:px-12">
                    <div className={`text-3xl text-gold-hi mb-1 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                      {entry.year}
                    </div>
                    <p className="text-sm text-foreground/70">{entry.label}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </LuxSection>

      {/* Founder story */}
      <LuxSection>
        <div className="max-w-4xl mx-auto text-center">
          <span className="eyebrow mb-5">{isAr ? 'المؤسس' : 'The Founder'}</span>
          <h2 className={`text-3xl md:text-5xl mt-4 mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
            <span className="text-gold-metal">{isAr ? 'محمد عبدالله باعشن' : 'Mohammed A. Baashen'}</span>
          </h2>
          <p className="text-base md:text-lg text-foreground/75 leading-loose">
            {isAr
              ? 'من قلب سوق الفحم في جدة البلد، أسّس محمد عبدالله باعشن مؤسسته عام ١٤٣٤هـ متخصصاً في توريد أجود أنواع فحم المعسل وفحم البخور. على مدى أكثر من عشر سنوات، توسّعت المؤسسة لتمتلك خمس علامات تجارية مسجّلة رسمياً لدى وزارة التجارة السعودية، وتُورّد للمطاعم والكافيهات والموزعين داخل المملكة وخارجها.'
              : 'From the historic Charcoal Souq in Jeddah Al-Balad, Mohammed A. Baashen founded the firm in 1434 AH, specializing in premium hookah and incense charcoal. Over a decade later, the company holds five officially registered trademarks with the Saudi Ministry of Commerce, supplying restaurants, lounges, and distributors inside the Kingdom and abroad.'}
          </p>
        </div>
      </LuxSection>

      {/* Registered Trademarks */}
      <LuxSection tone="surface">
        <SectionHeader
          eyebrow={isAr ? 'علاماتنا التجارية' : 'Our Trademarks'}
          title={isAr ? 'خمس علامات مسجّلة رسمياً' : 'Five Officially Registered Brands'}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {trademarks.map((tm, i) => (
            <ScrollReveal key={tm.id} delay={i * 80}>
              <Link
                to="/trademarks"
                className="glass-card group block p-5 rounded-2xl hover:border-gold/60 transition-all duration-500 h-full text-center"
              >
                <div className="aspect-square mb-4 rounded-xl bg-surface/50 overflow-hidden flex items-center justify-center p-3">
                  <img src={tm.image} alt={tm.nameAr} loading="lazy" className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="text-sm font-arabic font-bold text-gold-hi mb-1">{tm.nameAr}</h3>
                <p className="text-[10px] text-foreground/50 mb-2">{tm.nameEn}</p>
                <div className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-foreground/60">
                  <Award className="w-3 h-3 text-gold" />
                  {isAr ? `تسجيل ${tm.registrationNo}` : `Reg. ${tm.registrationNo}`}
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </LuxSection>
    </>
  );
}
