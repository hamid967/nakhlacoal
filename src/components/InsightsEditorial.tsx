import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import factory from '@/assets/slide-coconut-factory.jpg';
import lump from '@/assets/product-lump.jpg';
import hookah from '@/assets/product-hookah.jpg';

/**
 * Editorial "Insights" section — magazine-style grid over Noir + Gold.
 * One lead article + two secondary cards. Static content (no CMS dependency).
 */
export function InsightsEditorial() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const lead = {
    tag: isAr ? 'مقال رئيسي' : 'Feature',
    date: isAr ? 'يونيو ٢٠٢٦' : 'June 2026',
    read: isAr ? '٨ دقائق قراءة' : '8 min read',
    title: isAr
      ? 'كيف يُصنع فحم النخلة: من قلب الواحة إلى أرقى الموائد'
      : 'How Palm Charcoal is made: from the oasis to the world’s tables',
    excerpt: isAr
      ? 'رحلة أربعة أشهر من انتقاء أفضل جذوع النخيل إلى الكربنة البطيئة في أفران بلا دخان.'
      : 'A four-month journey from selecting the finest palm trunks to slow carbonisation in smokeless kilns.',
    img: factory,
    href: '/articles',
  };

  const others = [
    {
      tag: isAr ? 'دليل' : 'Guide',
      date: isAr ? 'مايو ٢٠٢٦' : 'May 2026',
      title: isAr ? 'اختيار الفحم المناسب لكل نوع شواء' : 'Choosing the right charcoal for every grill',
      img: lump,
      href: '/knowledge',
    },
    {
      tag: isAr ? 'ثقافة' : 'Culture',
      date: isAr ? 'أبريل ٢٠٢٦' : 'Apr 2026',
      title: isAr ? 'فنّ جلسة الشيشة: الحرارة، النكهة، والصبر' : 'The art of shisha: heat, flavour, patience',
      img: hookah,
      href: '/articles',
    },
  ];

  return (
    <section className="relative z-0 isolate py-24 md:py-32 bg-[#0B0B0B] overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4 font-arabic">
              <BookOpen className="w-3.5 h-3.5" />
              {isAr ? 'رؤى وقصص' : 'Insights & Stories'}
            </span>
            <h2 className="text-3xl md:text-5xl font-display text-white leading-tight max-w-2xl">
              {isAr ? 'قراءات من عالم الفحم الفاخر' : 'Reads from the world of premium charcoal'}
            </h2>
          </div>
          <Link
            to="/articles"
            className="hidden md:inline-flex items-center gap-2 text-sm text-[hsl(var(--gold))] hover:text-[hsl(var(--gold-hi,46_95%_78%))] transition-colors border-b border-[hsl(var(--gold))]/40 pb-1 font-arabic"
          >
            {isAr ? 'كل المقالات' : 'All articles'} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Lead */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 group"
          >
            <Link to={lead.href} className="block rounded-3xl overflow-hidden border border-[hsl(var(--gold))]/15 bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]/70">
              <div className="relative overflow-hidden">
                <img
                  src={lead.img}
                  alt={lead.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[300px] md:h-[440px] object-cover transition-transform [transition-duration:1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute top-4 start-4 text-[10px] tracking-[0.35em] uppercase px-3 py-1 rounded-full border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold-hi,46_95%_78%))] bg-black/50 backdrop-blur-sm">
                  {lead.tag}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/50 mb-3 font-arabic">
                  <span>{lead.date}</span>
                  <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]/50" />
                  <span>{lead.read}</span>
                </div>
                <h3 className={`text-xl md:text-3xl leading-snug text-white mb-3 ${isAr ? 'font-arabic' : 'font-display'}`}>
                  {lead.title}
                </h3>
                <p className={`text-white/70 text-sm md:text-base leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                  {lead.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-[hsl(var(--gold))] group-hover:text-[hsl(var(--gold-hi,46_95%_78%))] text-sm">
                  {isAr ? 'اقرأ المقال' : 'Read the story'} <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.article>

          {/* Secondaries */}
          <div className="lg:col-span-5 grid gap-6 md:gap-8">
            {others.map((a, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                className="group"
              >
                <Link
                  to={a.href}
                  className="grid grid-cols-5 gap-4 rounded-2xl overflow-hidden border border-[hsl(var(--gold))]/15 bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]/70"
                >
                  <div className="col-span-2 relative overflow-hidden">
                    <img
                      src={a.img}
                      alt={a.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full min-h-[140px] object-cover transition-transform [transition-duration:1000ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="col-span-3 p-4 md:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--gold-hi,46_95%_78%))]/80 mb-2">
                      <span>{a.tag}</span>
                      <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]/40" />
                      <span className="text-white/40">{a.date}</span>
                    </div>
                    <h3 className={`text-base md:text-lg leading-snug text-white ${isAr ? 'font-arabic' : 'font-display'}`}>
                      {a.title}
                    </h3>
                  </div>
                </Link>
              </motion.article>
            ))}

            <Link
              to="/articles"
              className="md:hidden inline-flex items-center gap-2 text-sm text-[hsl(var(--gold))] border-b border-[hsl(var(--gold))]/40 pb-1 self-start font-arabic"
            >
              {isAr ? 'كل المقالات' : 'All articles'} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
