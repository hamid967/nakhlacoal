import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Knowledge() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const articles = t('knowledge.articles', { returnObjects: true }) as { title: string; tag: string; read: string }[];

  return (
    <>
      <SEO
        title={isAr ? 'مركز المعرفة — فحم النخلة' : 'Knowledge Center — Palm Charcoal'}
        description={t('knowledge.subtitle')}
        path="/knowledge"
      />
      <PageHero number={9} eyebrow={t("knowledge.eyebrow")} title={t("knowledge.title")} subtitle={t("knowledge.subtitle")} />

      <section className="section">
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 60}>
              <article className="shimmer-card group h-full p-8 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-700 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{a.tag}</span>
                  <BookOpen className="w-4 h-4 text-foreground/40" />
                </div>
                <h3 className={`text-2xl mb-6 flex-1 leading-tight ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                  {a.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-foreground/40 pt-6 border-t border-gold/10">
                  <span>{a.read}</span>
                  <span className="inline-flex items-center gap-1 text-gold-hi">
                    {isAr ? 'اقرأ' : 'Read'} <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
