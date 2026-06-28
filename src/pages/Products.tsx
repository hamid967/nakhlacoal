import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PageHero } from '@/components/PageHero';
import { products, type ProductCategory, type ProductUseCase } from '@/data/products';
import { CompareToggle } from '@/components/CompareToggle';

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
        description={isAr ? 'تشكيلة فاخرة من الفحم السعودي للشواء والشيشة والتصدير.' : 'Premium Saudi charcoal for grilling, shisha, and export.'}
        path="/products"
      />
      <PageHero
        eyebrow={isAr ? 'تشكيلتنا' : 'Our range'}
        title={isAr ? 'منتجاتنا' : 'Our Products'}
      />

      <section className="pt-10 md:pt-14">
        <div className="container">
          <div className="rounded-2xl bg-surface border-luxe p-4 md:p-6 space-y-5">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 ${isAr ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
                className={`w-full bg-background border-luxe rounded-xl py-3 text-sm focus:outline-none focus:border-luxe-strong transition-colors ${isAr ? 'pr-11 pl-4 text-right font-arabic' : 'pl-11 pr-4'}`}
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

      <section className="py-14 md:py-20">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-foreground/60">
              {isAr ? 'لا توجد نتائج مطابقة. جرّب تعديل البحث أو الفلاتر.' : 'No matching results. Try adjusting your search or filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((p, i) => {
                const name = isAr ? p.nameAr : p.nameEn;
                const tagline = isAr ? p.taglineAr : p.taglineEn;
                return (
                  <ScrollReveal key={p.slug} delay={i * 60}>
                    <Link
                      to={`/products/${p.slug}`}
                      className="group block rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 overflow-hidden h-full"
                    >
                      <div className="aspect-[5/4] overflow-hidden">
                        <img
                          src={p.image}
                          alt={name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
                          0{i + 1} / 0{filtered.length}
                        </div>
                        <h3 className={`text-2xl mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display'} text-gold-hi`}>
                          {name}
                        </h3>
                        <p className="text-sm text-foreground/60 mb-5 leading-relaxed">{tagline}</p>

                        <div className="flex justify-between items-center pt-4 border-t border-gold/10 text-xs">
                          <span className="text-foreground/50">
                            {isAr ? 'كربون' : 'Carbon'} <span className="text-gold-hi font-bold">{p.specs.carbon}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 uppercase tracking-[0.2em] text-gold-hi">
                            {isAr ? 'التفاصيل' : 'Details'} <Arrow className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
