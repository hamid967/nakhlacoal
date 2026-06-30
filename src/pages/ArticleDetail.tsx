import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { getArticle, articles } from '@/data/articles';
import heroFallback from '@/assets/hero-charcoal.jpg';


export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const article = slug ? getArticle(slug) : undefined;

  if (!article) return <Navigate to="/articles" replace />;

  const title = isAr ? article.titleAr : article.titleEn;
  const excerpt = isAr ? article.excerptAr : article.excerptEn;
  const content = (isAr ? article.contentAr : article.contentEn) ?? [];
  const featuredImage = article.image ?? heroFallback;



  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    datePublished: article.date,
    inLanguage: isAr ? 'ar' : 'en',
    keywords: article.keywords.join(', '),
    author: { '@type': 'Organization', name: 'فحم النخلة | Palm Charcoal' },
    publisher: {
      '@type': 'Organization',
      name: 'Palm Charcoal',
      logo: { '@type': 'ImageObject', url: 'https://alnakhlacoal.com/palm-charcoal-logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://alnakhlacoal.com/articles/${article.id}` },
  };

  const others = articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <SEO title={`${title} | فحم النخلة`} description={excerpt} path={`/articles/${article.id}`} jsonLd={jsonLd} />
      <PageHero eyebrow={article.category} title={title} subtitle={excerpt} />

      <article className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-6 border-b border-gold/20">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readMin} {isAr ? 'دقائق قراءة' : 'min read'}</span>
          <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]">{article.category}</span>
        </div>

        {content.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">{isAr ? 'هذه المقالة قيد التحضير. ترقّب نشرها قريباً.' : 'This article is being prepared. Check back soon.'}</p>
          </div>
        ) : (
          <div className="space-y-8 prose-luxe">
            {content.map((s, i) => (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <h2 className="font-serif text-2xl text-emerald mb-3">{s.h}</h2>
                <p className="text-[15px] leading-[1.9] text-foreground/85">{s.p}</p>
              </motion.section>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gold/20 flex flex-wrap gap-3">
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition">
            {isAr ? <><ArrowRight className="w-4 h-4" /> العودة للمقالات</> : <><ArrowLeft className="w-4 h-4" /> Back to articles</>}
          </Link>
          <Link to="/products" className="ms-auto inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--gold))] hover:underline">
            {isAr ? 'تصفّح منتجاتنا' : 'Browse products'} <ArrowLeft className="w-4 h-4 rtl:hidden" />
          </Link>
        </div>
      </article>

      <section className="container mx-auto px-6 pb-20">
        <h3 className="font-serif text-xl text-emerald mb-6">{isAr ? 'مقالات ذات صلة' : 'Related articles'}</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {others.map((a) => (
            <Link
              key={a.id}
              to={`/articles/${a.id}`}
              className="glass-card rounded-2xl p-5 hover:border-gold/60 hover:shadow-gold transition block"
            >
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]">{a.category}</span>
              <h4 className="font-serif text-base text-emerald mt-3 leading-snug">{isAr ? a.titleAr : a.titleEn}</h4>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{isAr ? a.excerptAr : a.excerptEn}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
