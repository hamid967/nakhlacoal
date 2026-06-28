import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function PageHero({ eyebrow, title, subtitle }: Props) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative pt-40 pb-24 overflow-hidden border-b border-gold/10">
      <div className="absolute inset-0 ember-glow opacity-50 animate-ember pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface/50" />
      <div className="container relative">
        <ScrollReveal>
          <p className="eyebrow mb-8">{eyebrow}</p>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <h1 className={`text-5xl md:text-7xl lg:text-8xl max-w-4xl leading-[1] ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
            {title}
          </h1>
        </ScrollReveal>
        {subtitle && (
          <ScrollReveal delay={240}>
            <p className="text-base md:text-lg text-foreground/60 max-w-2xl mt-8 leading-relaxed">{subtitle}</p>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
