import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Search, X, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';

type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string | null;
  tagline_en: string | null;
  hero_image: string | null;
  base_price: number | null;
  currency: string;
  is_featured: boolean;
  sort_order: number;
  category_id: string | null;
  categories: { slug: string; name_ar: string; name_en: string } | null;
  product_variants: { stock: number | null; is_active: boolean }[] | null;
};


type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'name';

const FMT_SAR = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

const sel = (s: string): string => s;

export default function Products() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = params.get('q') ?? '';
  const cat = params.get('cat') ?? 'all';
  const sort = (params.get('sort') ?? 'featured') as SortKey;
  const minParam = params.get('min');
  const maxParam = params.get('max');
  const stockOnly = params.get('stock') === '1';
  const minPrice = minParam && !Number.isNaN(Number(minParam)) ? Math.max(0, Number(minParam)) : null;
  const maxPrice = maxParam && !Number.isNaN(Number(maxParam)) ? Math.max(0, Number(maxParam)) : null;

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (!v || v === 'all' || v === 'featured' || v === '0') next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };


  // Categories
  useEffect(() => {
    supabase
      .from('categories')
      .select(sel('id, slug, name_ar, name_en'))
      .eq('is_active', true)
      .order('sort_order')
      .returns<Category[]>()
      .then(({ data, error: e }) => {
        if (e) return;
        setCats(data ?? []);
      });
  }, []);

  // Products
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let query = supabase
      .from('products')
      .select(
        sel(
          'id, slug, name_ar, name_en, tagline_ar, tagline_en, hero_image, base_price, currency, is_featured, sort_order, category_id, categories(slug, name_ar, name_en), product_variants(stock, is_active)',
        ),
      )
      .eq('is_active', true);


    if (cat !== 'all') query = query.eq('categories.slug', cat);

    if (sort === 'price_asc') query = query.order('base_price', { ascending: true, nullsFirst: false });
    else if (sort === 'price_desc') query = query.order('base_price', { ascending: false, nullsFirst: false });
    else if (sort === 'name') query = query.order(isAr ? 'name_ar' : 'name_en', { ascending: true });
    else query = query.order('is_featured', { ascending: false }).order('sort_order');

    query
      .returns<ProductRow[]>()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          setError(e.message);
          setItems([]);
        } else {
          let rows = data ?? [];
          if (cat !== 'all') rows = rows.filter((r) => r.categories?.slug === cat);
          if (q.trim()) {
            const needle = q.trim().toLowerCase();
            rows = rows.filter(
              (r) =>
                r.name_ar.toLowerCase().includes(needle) ||
                r.name_en.toLowerCase().includes(needle) ||
                (r.tagline_ar ?? '').toLowerCase().includes(needle) ||
                (r.tagline_en ?? '').toLowerCase().includes(needle),
            );
          }
          if (minPrice != null) rows = rows.filter((r) => r.base_price != null && Number(r.base_price) >= minPrice);
          if (maxPrice != null) rows = rows.filter((r) => r.base_price != null && Number(r.base_price) <= maxPrice);
          if (stockOnly) {
            rows = rows.filter((r) =>
              (r.product_variants ?? []).some((v) => v.is_active && (v.stock ?? 0) > 0),
            );
          }
          setItems(rows);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cat, sort, q, isAr, minPrice, maxPrice, stockOnly]);


  const activeCat = useMemo(
    () => (cat === 'all' ? null : cats.find((c) => c.slug === cat) ?? null),
    [cat, cats],
  );

  return (
    <>
      <SEO
        title={isAr ? 'المنتجات — فحم النخلة' : 'Products — Palm Charcoal'}
        description={
          isAr
            ? 'كتالوج فحم النخلة الفاخر — شيشة، شواء، ومجالس. كربنة نقية واحتراق طويل.'
            : 'The Palm Charcoal catalogue — shisha, grill, and majlis grades. Pure carbon, long burn.'
        }
        path="/products"
      />

      <div dir={isAr ? 'rtl' : 'ltr'} className="bg-background">
        {/* Hero band */}
        <section className="relative bg-dark text-dark-foreground py-24 lg:py-32 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-x-0 -bottom-32 h-64 pointer-events-none"
            style={{ background: 'var(--gradient-ember)', opacity: 0.35 }}
          />
          <div className="container relative">
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold mb-4">
              {isAr ? 'الكتالوج' : 'The Catalogue'}
            </p>
            <h1
              className="font-editorial-bold text-dark-foreground leading-[0.95] tracking-tight max-w-4xl"
              style={{ fontSize: 'clamp(40px, 6vw, 88px)' }}
            >
              {isAr ? (
                <>
                  فحم <span className="text-gold italic">فاخر</span> لكل موقد.
                </>
              ) : (
                <>
                  Premium charcoal <span className="text-gold italic">for every hearth.</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-dark-foreground/70 text-base leading-relaxed">
              {isAr
                ? 'من مكعبات الشيشة إلى قطع الشواء الكبيرة وفحم مجالس الضيافة — كل درجة مصمّمة لغايتها.'
                : 'From shisha cubes to restaurant-grade grill cuts and hospitality lounge charcoal — each grade engineered for its ritual.'}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-[calc(var(--nav-h,64px))] z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none ${isAr ? 'right-3' : 'left-3'}`}
                aria-hidden
              />
              <label htmlFor="product-search" className="sr-only">
                {isAr ? 'ابحث في المنتجات' : 'Search products'}
              </label>
              <input
                id="product-search"
                type="search"
                value={q}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder={isAr ? 'ابحث…' : 'Search…'}
                className={`w-full h-11 rounded-none bg-transparent border border-border focus:border-gold focus:ring-2 focus:ring-gold/30 focus:outline-none text-sm text-foreground ${isAr ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'}`}
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => setParam('q', null)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isAr ? 'left-3' : 'right-3'}`}
                  aria-label={isAr ? 'مسح البحث' : 'Clear search'}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 flex-1 lg:justify-center">
              <Chip active={cat === 'all'} onClick={() => setParam('cat', null)}>
                {isAr ? 'الكل' : 'All'}
              </Chip>
              {cats.map((c) => (
                <Chip key={c.id} active={cat === c.slug} onClick={() => setParam('cat', c.slug)}>
                  {isAr ? c.name_ar : c.name_en}
                </Chip>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {isAr ? 'ترتيب' : 'Sort'}
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="h-11 bg-transparent border border-border focus:border-gold focus:ring-2 focus:ring-gold/30 focus:outline-none text-sm px-3 text-foreground"
              >
                <option value="featured">{isAr ? 'المميزة' : 'Featured'}</option>
                <option value="price_asc">{isAr ? 'السعر: من الأقل' : 'Price: low → high'}</option>
                <option value="price_desc">{isAr ? 'السعر: من الأعلى' : 'Price: high → low'}</option>
                <option value="name">{isAr ? 'الاسم' : 'Name'}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="container py-16 lg:py-24" aria-busy={loading}>
          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              <span className="ms-3 text-sm">{isAr ? 'جارِ التحميل…' : 'Loading…'}</span>
            </div>
          ) : error ? (
            <div role="alert" className="text-center py-24 text-ember-hi">
              {isAr ? 'تعذّر تحميل المنتجات.' : 'Failed to load products.'}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg text-foreground/70">
                {isAr ? 'لا نتائج مطابقة.' : 'No matching products.'}
              </p>
              {(q || cat !== 'all') && (
                <button
                  type="button"
                  onClick={() => setParams({}, { replace: true })}
                  className="mt-6 text-sm uppercase tracking-[0.22em] text-gold-hi hover:text-gold underline underline-offset-4"
                >
                  {isAr ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-8">
                {isAr
                  ? `${items.length} منتج${activeCat ? ` · ${activeCat.name_ar}` : ''}`
                  : `${items.length} product${items.length === 1 ? '' : 's'}${activeCat ? ` · ${activeCat.name_en}` : ''}`}
              </p>

              <ul
                role="list"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {items.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} index={i} total={items.length} isAr={isAr} Arrow={Arrow} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
      {/* consume t to avoid unused import (kept for future translations) */}
      <span className="sr-only">{t('nav.products', { defaultValue: '' })}</span>
    </>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap px-4 h-9 text-xs uppercase tracking-[0.22em] border transition-all ${
        active
          ? 'border-gold bg-gold/10 text-gold-hi'
          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  index,
  total,
  isAr,
  Arrow,
}: {
  product: ProductRow;
  index: number;
  total: number;
  isAr: boolean;
  Arrow: typeof ArrowRight;
}) {
  const name = isAr ? product.name_ar : product.name_en;
  const tagline = isAr ? product.tagline_ar : product.tagline_en;
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative block h-full bg-background border border-border/60 hover:border-gold/60 transition-all duration-500 hover:shadow-luxe hover:-translate-y-1"
    >
      <div className="relative aspect-[5/4] bg-dark overflow-hidden">
        {product.hero_image ? (
          <img
            src={product.hero_image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-dark via-dark-2 to-dark-3 flex items-center justify-center text-gold/25 font-editorial-bold text-6xl"
          >
            {String(index + 1).padStart(2, '0')}
          </div>
        )}
        {product.is_featured ? (
          <span className="absolute top-3 start-3 px-2 py-1 text-[10px] uppercase tracking-[0.22em] bg-gold text-dark font-semibold">
            {isAr ? 'مميز' : 'Featured'}
          </span>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        <div className="text-[10px] uppercase tracking-[0.28em] text-gold-ink mb-2">
          0{index + 1} / {String(total).padStart(2, '0')}
        </div>
        <h3 className="font-editorial-bold text-xl text-foreground leading-tight mb-2 group-hover:text-gold-ink transition-colors">
          {name}
        </h3>
        {tagline ? (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tagline}</p>
        ) : null}

        <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
          <span className="text-gold-ink font-semibold" dir="ltr">
            {product.base_price != null ? FMT_SAR.format(Number(product.base_price)) : (isAr ? 'اطلب عرض سعر' : 'Quote')}
          </span>
          <span className="inline-flex items-center gap-1 uppercase tracking-[0.22em] text-gold-hi group-hover:text-gold transition-colors">
            {isAr ? 'التفاصيل' : 'Details'}
            <Arrow aria-hidden className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
