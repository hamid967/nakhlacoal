import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { articles } from '@/data/articles';

export default function Articles() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <>
      <SEO
        title="مقالات ودلائل الفحم | فحم النخلة"
        description="دلائل تفصيلية: كيف تختار أفضل فحم معسل، فحم البخور سريع الإشعال، الفحم الطبيعي مقابل المضغوط، والمزيد."
        path="/articles"
      />
      <PageHero number={9}
        eyebrow="معرفة وخبرة"
        title="مقالات فحم النخلة"
        subtitle="نصائح، دلائل، ومعرفة فنية عن صناعة الفحم واستخداماته."
      />
      <section className="container mx-auto px-6 section-tight">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => {
            const hasContent = !!(a.contentAr && a.contentAr.length);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to={`/articles/${a.id}`}
                  className="clay-card block h-full rounded-2xl p-6 hover:border-gold/60 hover:shadow-gold transition"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]">{a.category}</span>
                    <span className="flex items-center gap-1 tabular-nums"><Calendar className="w-3 h-3" /> {a.date}</span>
                  </div>
                  <h3 className="font-serif text-xl text-emerald leading-snug">{isAr ? a.titleAr : a.titleEn}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{isAr ? a.excerptAr : a.excerptEn}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{a.readMin} {isAr ? 'د قراءة' : 'min read'}</span>
                    <span className="inline-flex items-center gap-1 text-[hsl(var(--gold))]">
                      {hasContent ? (isAr ? 'اقرأ المقال' : 'Read article') : (isAr ? 'قريباً' : 'Coming soon')}
                      <Arrow className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
