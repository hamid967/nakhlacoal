import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, PackageCheck } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { brand, whatsappUrl } from '@/lib/brand';

type Variant = {
  id: string;
  sku: string;
  label_ar: string;
  label_en: string;
  weight_kg: number | null;
  pack_size: number | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_active: boolean;
  sort_order: number;
};

type Image = {
  id: string;
  url: string;
  alt_ar: string | null;
  alt_en: string | null;
  position: number;
};

type Product = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string | null;
  tagline_en: string | null;
  story_ar: string | null;
  story_en: string | null;
  hero_image: string | null;
  base_price: number | null;
  currency: string;
  is_active: boolean;
  categories: { slug: string; name_ar: string; name_en: string } | null;
  product_variants: Variant[];
  product_images: Image[];
};

const sel = (s: string): string => s;

const fmtSAR = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0,
});

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    supabase
      .from('products')
      .select(
        sel(
          'id, slug, name_ar, name_en, tagline_ar, tagline_en, story_ar, story_en, hero_image, base_price, currency, is_active, categories(slug, name_ar, name_en), product_variants(id, sku, label_ar, label_en, weight_kg, pack_size, price, compare_at_price, stock, is_active, sort_order), product_images(id, url, alt_ar, alt_en, position)',
        ),
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
      .returns<Product | null>()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setNotFound(true);
          setProduct(null);
        } else {
          const p: Product = {
            ...data,
            product_variants: (data.product_variants ?? [])
              .filter((v) => v.is_active)
              .sort((a, b) => a.sort_order - b.sort_order),
            product_images: (data.product_images ?? []).sort((a, b) => a.position - b.position),
          };
          setProduct(p);
          setSelectedVariantId(p.product_variants[0]?.id ?? null);
          setActiveImage(p.product_images[0]?.url ?? p.hero_image);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const variant = useMemo(
    () => product?.product_variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="font-editorial-bold text-3xl">{isAr ? 'المنتج غير متاح' : 'Product not found'}</h1>
        <Link to="/products" className="text-gold-hi hover:text-gold underline underline-offset-4 text-sm">
          {isAr ? 'العودة إلى الكتالوج' : 'Back to catalogue'}
        </Link>
      </div>
    );
  }

  const name = isAr ? product.name_ar : product.name_en;
  const tagline = isAr ? product.tagline_ar : product.tagline_en;
  const story = isAr ? product.story_ar : product.story_en;
  const catName = product.categories ? (isAr ? product.categories.name_ar : product.categories.name_en) : null;
  const price = variant?.price ?? product.base_price ?? null;

  const waMsg = isAr
    ? `مرحباً، أرغب بطلب: ${name}${variant ? ` — ${variant.label_ar}` : ''}`
    : `Hello, I'd like to order: ${name}${variant ? ` — ${variant.label_en}` : ''}`;

  return (
    <>
      <SEO
        title={`${name} — ${isAr ? 'فحم النخلة' : 'Palm Charcoal'}`}
        description={tagline ?? undefined}
        path={`/products/${product.slug}`}
      />

      <div dir={isAr ? 'rtl' : 'ltr'} className="bg-background">
        <div className="container py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link to="/" className="hover:text-gold-hi">{isAr ? 'الرئيسية' : 'Home'}</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link to="/products" className="hover:text-gold-hi">{isAr ? 'المنتجات' : 'Products'}</Link>
              </li>
              {catName ? (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link to={`/products?cat=${product.categories?.slug}`} className="hover:text-gold-hi">
                      {catName}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden>/</li>
              <li className="text-foreground">{name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/5] bg-dark overflow-hidden">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-br from-dark via-dark-2 to-dark-3 flex items-center justify-center text-gold/25 font-editorial-bold text-8xl"
                  >
                    ★
                  </div>
                )}
              </div>
              {product.product_images.length > 1 ? (
                <ul role="list" className="mt-4 grid grid-cols-5 gap-2">
                  {product.product_images.map((img) => (
                    <li key={img.id}>
                      <button
                        type="button"
                        onClick={() => setActiveImage(img.url)}
                        aria-label={(isAr ? img.alt_ar : img.alt_en) ?? name}
                        className={`aspect-square w-full overflow-hidden border transition-all ${
                          activeImage === img.url ? 'border-gold' : 'border-border/60 hover:border-foreground/40'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Details */}
            <div>
              {catName ? (
                <p className="text-[10px] uppercase tracking-[0.32em] text-gold-ink mb-4">{catName}</p>
              ) : null}
              <h1 className="font-editorial-bold text-4xl lg:text-5xl text-foreground leading-tight">{name}</h1>
              {tagline ? (
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{tagline}</p>
              ) : null}

              {/* Price */}
              <div className="mt-8 flex items-baseline gap-3" dir="ltr">
                {price != null ? (
                  <span className="font-editorial-bold text-3xl text-gold-hi">
                    {fmtSAR.format(Number(price))}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">{isAr ? 'السعر عند الطلب' : 'Price on request'}</span>
                )}
                {variant?.compare_at_price ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {fmtSAR.format(Number(variant.compare_at_price))}
                  </span>
                ) : null}
              </div>

              {/* Variants */}
              {product.product_variants.length > 0 ? (
                <div className="mt-8">
                  <label className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">
                    {isAr ? 'الحجم / التعبئة' : 'Size / Pack'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.product_variants.map((v) => {
                      const active = v.id === selectedVariantId;
                      const disabled = v.stock <= 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedVariantId(v.id)}
                          aria-pressed={active}
                          className={`px-4 h-11 text-sm border transition-all ${
                            active
                              ? 'border-gold bg-gold/10 text-gold-hi'
                              : 'border-border text-foreground hover:border-foreground/40'
                          } ${disabled ? 'opacity-40 line-through cursor-not-allowed' : ''}`}
                        >
                          {isAr ? v.label_ar : v.label_en}
                        </button>
                      );
                    })}
                  </div>

                  {variant ? (
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5 text-gold-ink" aria-hidden />
                        {variant.stock > 0
                          ? isAr
                            ? `متوفر · ${variant.stock} وحدة`
                            : `In stock · ${variant.stock} units`
                          : isAr
                            ? 'غير متوفر حالياً'
                            : 'Out of stock'}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider">SKU: {variant.sku}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl(waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-br from-gold-hi to-gold-lo text-dark font-semibold text-sm uppercase tracking-[0.18em] hover:-translate-y-0.5 hover:shadow-glow-gold transition-all"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden />
                  {isAr ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
                </a>
                <Link
                  to={`/quote?product=${product.slug}${variant ? `&variant=${variant.sku}` : ''}`}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-gold/60 text-gold-hi hover:bg-gold/10 text-sm uppercase tracking-[0.18em] transition-all"
                >
                  {isAr ? 'طلب عرض سعر' : 'Request quote'}
                  <Arrow className="w-4 h-4" aria-hidden />
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground">
                {isAr ? 'أو تواصل هاتفياً:' : 'Or call directly:'}{' '}
                <a href={`tel:${brand.footer.phone.replace(/\s/g, '')}`} className="text-foreground hover:text-gold-hi" dir="ltr">
                  {brand.footer.phone}
                </a>
              </p>

              {/* Story */}
              {story ? (
                <div className="mt-12 pt-10 border-t border-border/60">
                  <h2 className="text-[10px] uppercase tracking-[0.32em] text-gold mb-4">
                    {isAr ? 'قصة المنتج' : 'The Story'}
                  </h2>
                  <p className="text-base leading-[1.75] text-foreground/80 whitespace-pre-line">{story}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
