import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PageIntro } from '@/components/ui-lux';
import { products, type ProductCategory, type ProductUseCase } from '@/data/products';
import { CompareToggle } from '@/components/CompareToggle';
import { ProductRecommender } from '@/components/ProductRecommender';
import { useTilt } from '@/hooks/useTilt';

type ProductCardProps = {
  p: typeof products[number];
  i: number;
  total: number;
  isAr: boolean;
  Arrow: typeof ArrowRight;
};

function ProductCard({ p, i, total, isAr, Arrow }: ProductCardProps) {
  const tilt = useTilt<HTMLAnchorElement>(5);
  const name = isAr ? p.nameAr : p.nameEn;
  const tagline = isAr ? p.taglineAr : p.taglineEn;
  return (
    <>
      <Link
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        to={`/products/${p.slug}`}
        className="group block clay-card overflow-hidden h-full"
      >
        <div className="aspect-[5/4] overflow-hidden rounded-t-[20px]">
          <img
            src={p.image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </div>
        <div className="p-5 sm:p-6 text-start">
          <div
            className={`text-[10px] uppercase text-gold mb-2 ${
              isAr ? 'tracking-[0.12em]' : 'tracking-[0.3em]'
            }`}
          >
            0{i + 1} / 0{total}
          </div>
          <h3
            className={`mb-2 text-start break-words [overflow-wrap:anywhere] ${
              isAr ? 'font-arabic font-bold leading-[1.4]' : 'font-display'
            } text-gold-hi`}
          >
            {name}
          </h3>
          <p className="text-sm text-foreground/65 mb-5 leading-relaxed text-start [overflow-wrap:anywhere]">
            {tagline}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4 border-t border-gold/10 text-xs">
            <span className="text-foreground/55 min-w-0 truncate">
              {isAr ? 'كربون' : 'Carbon'}{' '}
              <span className="text-gold-hi font-bold">{p.specs.carbon}</span>
            </span>
            <span
              className={`inline-flex items-center gap-2 uppercase text-gold-hi shrink-0 ${
                isAr ? 'tracking-[0.08em]' : 'tracking-[0.2em]'
              }`}
            >
              {isAr ? 'التفاصيل' : 'Details'} <Arrow className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </Link>
      <div className="px-6 pb-5 -mt-2">
        <CompareToggle slug={p.slug} className="w-full justify-center" />
      </div>
    </>
  );
}

const CATEGORIES: { value: ProductCategory | 'all'; ar: string; en: string }[] = [
  { value: 'all', ar: 'الكل', en: 'All' },
  { value: 'bbq', ar: 'شواء', en: 'BBQ' },
  { value: 'shisha', ar: 'شيشة', en: 'Shisha' },
  { value: 'commercial', ar: 'تجاري', en: 'Commercial' },
  { value: 'export', ar: 'تصدير', en: 'Export' },
];

const USE_CASES: { value: ProductUseCase | 'all'; ar: string; en: string }[] = [
  { value: 'all', ar: 'كل الاستخدامات', en: 'All uses' },
  { value: 'home', ar: 'منزلي', en: 'Home' },
  { value: 'outdoor', ar: 'رحلات', en: 'Outdoor' },
  { value: 'restaurant', ar: 'مطاعم', en: 'Restaurants' },
  { value: 'lounge', ar: 'مقاهي شيشة', en: 'Lounges' },
  { value: 'export', ar: 'تصدير', en: 'Export' },
];

export default function Products() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [useCase, setUseCase] = useState<ProductUseCase | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (useCase !== 'all' && !p.useCases.includes(useCase)) return false;
      if (!q) return true;
      const hay = [p.nameAr, p.nameEn, p.taglineAr, p.taglineEn, p.descAr, p.descEn]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, useCase]);

  const clearAll = () => {
    setQuery('');
    setCategory('all');
    setUseCase('all');
  };
  const hasFilters = query || category !== 'all' || useCase !== 'all';

  return (
    <>
      <SEO
        title={isAr ? 'المنتجات — فحم النخلة' : 'Products — Palm Charcoal'}
        description={isAr ? 'تشكيلة فاخرة من الفحم السعودي: فحم شواء، فحم شيشة، فحم بخور، وفحم صناعي. سبع عائلات منتجات معتمدة للتصدير بأعلى معايير الجودة السعودية.' : 'Curated Saudi charcoal collection: BBQ, hookah, incense, and industrial grades. Seven certified export-ready product families crafted to international quality standards.'}
        path="/products"
      />
      <PageIntro number={2}
        eyebrow={isAr ? 'تشكيلتنا' : 'Our range'}
        title={isAr ? 'منتجاتنا' : 'Our Products'}
        lead={isAr ? 'سبع عائلات منتجات بمعايير عالمية للفحم السعودي الفاخر.' : 'Seven product families crafted to international luxury standards.'}
      />

      <div className="container mt-6 flex justify-center">
        <a
          href="/catalog"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-900 text-white text-sm hover:bg-emerald-800 transition shadow-lg"
        >
          📄 {isAr ? 'تحميل الكتالوج PDF' : 'Download Catalog (PDF)'}
        </a>
      </div>

      <ProductRecommender />






      <section className="pt-10 md:pt-14">
        <div className="container">
          <div className="rounded-2xl glass-card p-4 md:p-6 space-y-5">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 ${isAr ? 'right-4' : 'left-4'}`} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
                aria-label={isAr ? 'ابحث عن منتج' : 'Search products'}
                className={`glass-strip w-full rounded-xl py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors ${isAr ? 'pr-11 pl-4 text-right font-arabic' : 'pl-11 pr-4'}`}
              />
            </div>

            {/* Category */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
                {isAr ? 'الفئة' : 'Category'}
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] transition-all ${
                      category === c.value
                        ? 'bg-gold text-background border border-gold'
                        : 'border-luxe text-foreground/70 hover:border-luxe-strong hover:text-gold-hi'
                    }`}
                  >
                    {isAr ? c.ar : c.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Use case */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
                {isAr ? 'حالة الاستخدام' : 'Use case'}
              </div>
              <div className="flex flex-wrap gap-2">
                {USE_CASES.map((u) => (
                  <button
                    key={u.value}
                    onClick={() => setUseCase(u.value)}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] transition-all ${
                      useCase === u.value
                        ? 'bg-gold text-background border border-gold'
                        : 'border-luxe text-foreground/70 hover:border-luxe-strong hover:text-gold-hi'
                    }`}
                  >
                    {isAr ? u.ar : u.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gold/10 text-xs text-foreground/60">
              <span>
                {filtered.length} {isAr ? 'منتج' : filtered.length === 1 ? 'result' : 'results'}
              </span>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 text-gold-hi hover:text-gold transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {isAr ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-foreground/60">
              {isAr ? 'لا توجد نتائج مطابقة. جرّب تعديل البحث أو الفلاتر.' : 'No matching results. Try adjusting your search or filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((p, i) => (
                <ScrollReveal key={p.slug} delay={i * 60}>
                  <ProductCard p={p} i={i} total={filtered.length} isAr={isAr} Arrow={Arrow} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
