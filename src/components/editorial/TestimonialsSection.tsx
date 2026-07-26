import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader, Eyebrow } from './primitives';

type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  quote_ar: string | null;
  quote_en: string | null;
  avatar_url: string | null;
  rating: number | null;
};

const FALLBACK: Testimonial[] = [
  {
    id: 'f1',
    author_name: 'الشيف عبدالله الحربي',
    author_role: 'رئيس طهاة — فندق فاخر بجدة',
    quote_ar: 'فحم النخلة يعطي نكهة عميقة وحرارة ثابتة لا تجدها في أي فحم آخر. أصبح جزءاً أساسياً من مطبخنا.',
    quote_en:
      'Palm Charcoal delivers a deep flavor and steady heat unmatched by any other. It is now essential in our kitchen.',
    avatar_url: null,
    rating: 5,
  },
  {
    id: 'f2',
    author_name: 'Salma Al-Otaibi',
    author_role: 'Restaurant Group Owner — Riyadh',
    quote_ar: 'استدامة حقيقية وجودة موثوقة. عملاؤنا يلاحظون الفرق منذ أول شواية.',
    quote_en:
      'Real sustainability and consistent quality. Our guests notice the difference from the first grill.',
    avatar_url: null,
    rating: 5,
  },
  {
    id: 'f3',
    author_name: 'Ahmed R.',
    author_role: 'Wholesale Distributor — GCC',
    quote_ar: 'شحن دقيق، توثيق كامل، وفحم يحترق طويلاً برماد شبه معدوم. شراكة طويلة الأمد.',
    quote_en:
      'Precise shipping, full documentation, long burn, near-zero ash. A long-term partnership.',
    avatar_url: null,
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [items, setItems] = useState<Testimonial[]>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('testimonials')
      .select('id, author_name, author_role, quote_ar, quote_en, avatar_url, rating')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (!cancelled && data && data.length > 0) setItems(data as Testimonial[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="relative bg-background py-24 lg:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <div className="max-w-3xl mb-16" dir={isAr ? 'rtl' : 'ltr'}>
          <SectionHeader
            eyebrow={isAr ? 'شهادات موثوقة' : 'Trusted Voices'}
            size="md"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <span id="testimonials-heading">
              {isAr ? 'يحكيها عملاؤنا،' : 'Told by those'}
              <br />
              <span className="text-gold italic">
                {isAr ? 'حول العالم.' : 'who cook with fire.'}
              </span>
            </span>
          </SectionHeader>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {items.slice(0, 3).map((t) => {
            const quote = (isAr ? t.quote_ar : t.quote_en) || t.quote_ar || t.quote_en || '';
            return (
              <li
                key={t.id}
                className="group relative bg-surface border border-border/40 rounded-md p-8 transition-all duration-500 hover:border-gold/50 hover:shadow-luxe"
                dir={isAr ? 'rtl' : 'ltr'}
              >
                <Quote
                  aria-hidden
                  className="absolute top-6 end-6 w-8 h-8 text-gold/25 group-hover:text-gold/60 transition-colors"
                />
                {t.rating ? (
                  <div className="flex gap-0.5 mb-5" aria-label={`${t.rating}/5`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        aria-hidden
                        className="w-3.5 h-3.5 fill-gold text-gold"
                      />
                    ))}
                  </div>
                ) : null}
                <blockquote className="text-foreground/90 leading-relaxed text-[15px] mb-8">
                  “{quote}”
                </blockquote>
                <footer className="pt-5 border-t border-border/50">
                  <div className="font-semibold text-foreground text-sm">
                    {t.author_name}
                  </div>
                  {t.author_role ? (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t.author_role}
                    </div>
                  ) : null}
                </footer>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 pt-8 border-t border-border/50 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[10px] uppercase tracking-[0.32em] text-muted-foreground/80">
          <Eyebrow>{isAr ? 'شراكات موثوقة' : 'Trusted Partners'}</Eyebrow>
          <span>ISO 9001</span>
          <span className="h-px w-6 bg-border" />
          <span>ZATCA</span>
          <span className="h-px w-6 bg-border" />
          <span>SASO</span>
          <span className="h-px w-6 bg-border" />
          <span>{isAr ? 'وزارة التجارة' : 'MoC Registered'}</span>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
