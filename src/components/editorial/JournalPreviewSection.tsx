import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader, GhostCTA } from './primitives';

type Article = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  hero_image: string | null;
  reading_minutes: number | null;
  published_at: string | null;
  tags: string[] | null;
};

const FALLBACK: Article[] = [
  {
    id: 'j1',
    slug: 'the-carbon-of-arabia',
    title_ar: 'كربون الجزيرة العربية',
    title_en: 'The Carbon of Arabia',
    excerpt_ar: 'كيف تحوّل نخيل الوطن إلى وقود فاخر يشتعل ببطء ويهدأ برماد شبه معدوم.',
    excerpt_en: 'How native palm wood becomes a premium fuel — slow-burning, near ash-free.',
    hero_image: null,
    reading_minutes: 5,
    published_at: '2026-06-12T00:00:00Z',
    tags: ['craft', 'origin'],
  },
  {
    id: 'j2',
    slug: 'shisha-grade-explained',
    title_ar: 'ما يميّز فحم الشيشة الفاخر',
    title_en: 'What Makes Shisha-Grade Charcoal',
    excerpt_ar: 'كثافة، احتراق طويل، طعم محايد — المعايير التي نتّبعها في كل دفعة.',
    excerpt_en: 'Density, long burn, neutral taste — the standards behind every batch.',
    hero_image: null,
    reading_minutes: 4,
    published_at: '2026-05-30T00:00:00Z',
    tags: ['shisha', 'quality'],
  },
  {
    id: 'j3',
    slug: 'sustainability-report',
    title_ar: 'تقرير الاستدامة ٢٠٢٦',
    title_en: 'Sustainability Report 2026',
    excerpt_ar: 'مصادرنا، بصمتنا الكربونية، ومسار إعادة التشجير في المزارع السعودية.',
    excerpt_en: 'Our sourcing, carbon footprint, and reforestation across Saudi farms.',
    hero_image: null,
    reading_minutes: 8,
    published_at: '2026-05-01T00:00:00Z',
    tags: ['sustainability'],
  },
];

function formatDate(iso: string | null, isAr: boolean) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function JournalPreviewSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [items, setItems] = useState<Article[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('articles')
      .select(
        'id, slug, title_ar, title_en, excerpt_ar, excerpt_en, hero_image, reading_minutes, published_at, tags',
      )
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!cancelled && data && data.length > 0) setItems(data as Article[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="relative bg-surface-2 py-24 lg:py-32"
      aria-labelledby="journal-heading"
    >
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl" dir={isAr ? 'rtl' : 'ltr'}>
            <SectionHeader
              eyebrow={isAr ? 'المدوّنة' : 'The Journal'}
              size="md"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <span id="journal-heading">
                {isAr ? 'قصص من ' : 'Stories of '}
                <span className="text-gold italic">
                  {isAr ? 'الحرفة والنار.' : 'craft & fire.'}
                </span>
              </span>
            </SectionHeader>
          </div>
          <GhostCTA to="/journal">{isAr ? 'كل المقالات' : 'All Articles'}</GhostCTA>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {items.map((a, i) => {
            const title = isAr ? a.title_ar : a.title_en;
            const excerpt = isAr ? a.excerpt_ar : a.excerpt_en;
            return (
              <li key={a.id}>
                <Link
                  to={`/journal/${a.slug}`}
                  className="group relative block h-full bg-background border border-border/40 rounded-md overflow-hidden transition-all duration-500 hover:border-gold/50 hover:shadow-luxe hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] bg-dark overflow-hidden">
                    {a.hero_image ? (
                      <img
                        src={a.hero_image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-br from-dark via-dark-2 to-dark-3 flex items-center justify-center text-gold/30 font-editorial-bold text-6xl"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="p-6" dir={isAr ? 'rtl' : 'ltr'}>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-gold-ink mb-4">
                      <time dateTime={a.published_at ?? ''}>
                        {formatDate(a.published_at, isAr)}
                      </time>
                      {a.reading_minutes ? (
                        <>
                          <span className="h-px w-4 bg-gold/40" />
                          <span>
                            {a.reading_minutes} {isAr ? 'دقائق قراءة' : 'min read'}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="font-editorial-bold text-xl md:text-2xl text-foreground leading-tight mb-3 group-hover:text-gold-ink transition-colors">
                      {title}
                    </h3>
                    {excerpt ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {excerpt}
                      </p>
                    ) : null}
                    <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold-ink group-hover:text-gold transition-colors">
                      {isAr ? 'اقرأ المقال' : 'Read article'}
                      <ArrowUpRight
                        aria-hidden
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default JournalPreviewSection;
