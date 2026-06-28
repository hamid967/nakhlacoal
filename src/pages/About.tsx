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

      <PageIntro
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
    </>
  );
}
