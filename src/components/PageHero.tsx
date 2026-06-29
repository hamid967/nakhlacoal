import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { SectionChip, PalmCorner } from './ui-lux/PageHero';

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  number?: string | number;
};

export function PageHero({ eyebrow, title, subtitle, number }: Props) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden">
      <PalmCorner position="top-left" />
      <PalmCorner position="top-right" />
      <div className="container relative">
        {number !== undefined ? (
          <SectionChip number={number} label={eyebrow} />
        ) : (
          <ScrollReveal>
            <p className="eyebrow mb-8">{eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={120}>
          <h1 className={`text-5xl md:text-7xl lg:text-[5.5rem] max-w-4xl leading-[1.05] ${isAr ? 'font-arabic font-bold' : 'font-display'} text-foreground`}>
            {title}
          </h1>
        </ScrollReveal>
        {subtitle && (
          <ScrollReveal delay={240}>
            <p className="text-base md:text-lg text-foreground/65 max-w-2xl mt-8 leading-relaxed">{subtitle}</p>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
