import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShoppingCart, MessageCircle, Check, Package, Flame, Clock, Wind, Droplets, Thermometer, Download, Globe2, Ship, FileText, Box as BoxIcon, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CompareToggle } from '@/components/CompareToggle';
import { products, getProduct } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { exportProductCatalog } from '@/lib/exportProductCatalog';
import factoryA from '@/assets/slide-coconut-factory.jpg';
import factoryB from '@/assets/step-carbonize.jpg';
import factoryC from '@/assets/step-press.jpg';
import factoryD from '@/assets/step-pack.jpg';
const ProductViewer3D = lazy(() => import('@/components/ProductViewer3D'));

export default function ProductDetail() {
  const [view3D, setView3D] = useState(false);
  const { slug = '' } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const product = getProduct(slug);
  if (!product) return <Navigate to="/products" replace />;

  const name = isAr ? product.nameAr : product.nameEn;
  const tagline = isAr ? product.taglineAr : product.taglineEn;
  const desc = isAr ? product.descAr : product.descEn;
  const features = isAr ? product.featuresAr : product.featuresEn;
  const useCases = isAr ? product.useCasesAr : product.useCasesEn;

  const specIcons = [
    { icon: Clock, label: isAr ? 'مدة الاحتراق' : 'Burn time', value: product.specs.burn },
    { icon: Flame, label: isAr ? 'الحرارة' : 'Heat', value: product.specs.heat },
    { icon: Wind, label: isAr ? 'الرماد' : 'Ash', value: product.specs.ash },
    { icon: Thermometer, label: isAr ? 'الكربون' : 'Carbon', value: product.specs.carbon },
    { icon: Droplets, label: isAr ? 'الرطوبة' : 'Moisture', value: product.specs.moisture },
    { icon: Package, label: isAr ? 'التغليف' : 'Packaging', value: product.specs.packaging },
  ];

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  // Parse packaging string into chips e.g. "1 / 5 / 10 kg"
  const packagingChips = product.specs.packaging
    .split(/[,،]|\s\/\s|\s\u2013\s/)
    .map((s) => s.trim())
    .filter(Boolean);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: desc,
    brand: { '@type': 'Brand', name: isAr ? 'فحم النخلة' : 'Palm Charcoal' },
    category: product.category,
    image: `https://alnakhlacoal.com${product.image}`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Burn time', value: product.specs.burn },
      { '@type': 'PropertyValue', name: 'Heat', value: product.specs.heat },
      { '@type': 'PropertyValue', name: 'Ash', value: product.specs.ash },
      { '@type': 'PropertyValue', name: 'Carbon', value: product.specs.carbon },
      { '@type': 'PropertyValue', name: 'Moisture', value: product.specs.moisture },
      { '@type': 'PropertyValue', name: 'Packaging', value: product.specs.packaging },
    ],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'SAR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Palm Charcoal' },
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isAr ? 'الرئيسية' : 'Home', item: 'https://alnakhlacoal.com/' },
      { '@type': 'ListItem', position: 2, name: isAr ? 'المنتجات' : 'Products', item: 'https://alnakhlacoal.com/products' },
      { '@type': 'ListItem', position: 3, name, item: `https://alnakhlacoal.com/products/${product.slug}` },
    ],
  };

  const waMsg = encodeURIComponent(
    `${isAr ? 'مرحباً، أرغب بالاستفسار عن' : "Hello, I'd like to inquire about"} ${name} — ${tagline}`,
  );

  return (
    <>
      <SEO
        title={`${name} | ${isAr ? 'فحم النخلة' : 'Palm Charcoal'}`}
        description={desc}
        path={`/products/${product.slug}`}
        jsonLd={{ '@context': 'https://schema.org', '@graph': [productJsonLd, breadcrumbJsonLd] }}
      />

      {/* ============= HERO ============= */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="container">
          {/* Breadcrumb */}
          <ScrollReveal>
            <nav className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-8 flex items-center gap-2">
              <Link to="/" className="hover:text-gold-hi transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-gold-hi transition-colors">{isAr ? 'المنتجات' : 'Products'}</Link>
              <span>/</span>
              <span className="text-gold-hi">{name}</span>
            </nav>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
            {/* Image / 3D viewer */}
            <ScrollReveal>
              <div className="relative rounded-3xl overflow-hidden border-luxe-strong shimmer-card aspect-square section-dark">
                <div className="absolute inset-0 ember-glow opacity-40 pointer-events-none" />
                {view3D ? (
                  <Suspense
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center text-gold-hi/70 text-xs uppercase tracking-[0.22em]">
                        {isAr ? 'جارٍ تحميل العارض ثلاثي الأبعاد…' : 'Loading 3D viewer…'}
                      </div>
                    }
                  >
                    <ProductViewer3D ariaLabel={name} />
                  </Suspense>
                ) : (
                  <img decoding="async" loading="lazy" src={product.image} alt={name} className="relative w-full h-full object-cover" width={1280} height={1280} />
                )}
                {/* Toggle */}
                <div className="absolute top-3 start-3 flex gap-1.5 bg-black/55 border border-gold/30 rounded-full p-1 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setView3D(false)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] transition-colors ${!view3D ? 'bg-gold text-black' : 'text-gold-hi hover:text-gold'}`}
                    aria-pressed={!view3D}
                  >
                    <ImageIcon className="w-3 h-3" /> {isAr ? 'صورة' : 'Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView3D(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] transition-colors ${view3D ? 'bg-gold text-black' : 'text-gold-hi hover:text-gold'}`}
                    aria-pressed={view3D}
                  >
                    <RotateCcw className="w-3 h-3" /> 3D
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Copy */}
            <ScrollReveal delay={120}>
              <div>
                <span className="eyebrow mb-4">{isAr ? 'منتج فاخر' : 'Premium product'}</span>
                <h1 className={`text-4xl sm:text-5xl md:text-6xl mt-4 mb-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                  <span className="text-gold-metal">{name}</span>
                </h1>
                <p className="text-lg md:text-xl text-gold-hi mb-5 font-arabic">{tagline}</p>
                <p className="text-sm md:text-base text-foreground/70 leading-loose mb-8">{desc}</p>

                {/* Features list */}
                <ul className="space-y-3 mb-10">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-gold/15 border-luxe-strong flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-gold-hi" />
                      </span>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Packaging variants */}
                {packagingChips.length > 0 && (
                  <div className="mb-8">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/50 mb-2">
                      {isAr ? 'الأحجام والتغليف' : 'Sizes & packaging'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {packagingChips.map((chip) => (
                        <span key={chip} className="px-3 py-1.5 rounded-full border-luxe text-xs text-foreground/80 bg-surface">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <AddToCartButton product={product} isAr={isAr} />
                  <Link to="/quote" className="btn-ghost-gold">
                    <FileText className="w-4 h-4" /> {isAr ? 'اطلب عرض سعر' : 'Request a quote'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      exportProductCatalog(product, isAr);
                      toast.success(isAr ? 'تم تنزيل الكتالوج' : 'Catalog downloaded');
                    }}
                    className="btn-ghost-gold"
                  >
                    <Download className="w-4 h-4" /> {isAr ? 'تنزيل الكتالوج' : 'Download catalog'}
                  </button>
                  <a
                    href={`https://wa.me/966540060095?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost-gold"
                  >
                    <MessageCircle className="w-4 h-4" /> {isAr ? 'تواصل واتساب' : 'WhatsApp us'}
                  </a>
                  <CompareToggle slug={product.slug} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============= SPECS ============= */}
      <section className="section section-dark relative overflow-hidden">
        <div className="absolute inset-0 ember-glow opacity-20 pointer-events-none" />
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12 md:mb-16">
              <span className="eyebrow mb-5">{isAr ? 'المواصفات' : 'Specifications'}</span>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl mt-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                {isAr ? 'مواصفات تقنية ' : 'Technical '}<span className="text-gold-metal">{isAr ? 'دقيقة' : 'specs'}</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {specIcons.map((s, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="p-5 rounded-2xl bg-surface border-luxe text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border-luxe-strong flex items-center justify-center mx-auto mb-3">
                    <s.icon className="w-5 h-5 text-gold-hi" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1">{s.label}</div>
                  <div className="text-base font-bold text-gold-hi">{s.value}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============= USE CASES ============= */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-14">
              <span className="eyebrow mb-5">{isAr ? 'الاستخدامات' : 'Use cases'}</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl mt-4 font-arabic font-bold">
                {isAr ? 'مثالي ' : 'Built '}<span className="text-gold-metal">{isAr ? 'لـ' : 'for'}</span>
              </h2>
              <div className="mt-3 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {useCases.map((u, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="p-7 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 text-center h-full">
                  <div className="text-3xl text-gold-metal font-bold mb-3">0{i + 1}</div>
                  <h3 className="text-lg font-arabic font-bold text-gold-hi">{u}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============= RELATED ============= */}
      <section className="section border-t border-gold/10">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-14">
              <span className="eyebrow mb-5">{isAr ? 'منتجات ذات صلة' : 'Related products'}</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl mt-4 font-arabic font-bold">
                {isAr ? 'اكتشف ' : 'Discover '}<span className="text-gold-metal">{isAr ? 'المزيد' : 'more'}</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {related.map((p, i) => {
              const rName = isAr ? p.nameAr : p.nameEn;
              const rTag = isAr ? p.taglineAr : p.taglineEn;
              return (
                <ScrollReveal key={p.slug} delay={i * 80}>
                  <Link to={`/products/${p.slug}`} className="group block rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-500 overflow-hidden h-full">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img decoding="async" src={p.image} alt={rName} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-xl mb-2 font-arabic font-bold text-gold-hi">{rName}</h3>
                      <p className="text-xs text-foreground/60 mb-4">{rTag}</p>
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold-hi">
                        {isAr ? 'عرض المنتج' : 'View product'} <Arrow className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}

function AddToCartButton({ product, isAr }: { product: ReturnType<typeof getProduct> & object; isAr: boolean }) {
  const { add, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => {
        add({
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          unit: 'carton',
          qty: 1,
          image: product.image,
        });
        setOpen(true);
        toast.success(isAr ? 'تمت الإضافة إلى السلة' : 'Added to cart');
      }}
      className="btn-gold"
    >
      <ShoppingCart className="w-4 h-4" /> {isAr ? 'أضف إلى السلة' : 'Add to cart'}
    </button>
  );
}

