import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { useCompare } from '@/contexts/CompareContext';
import { getProduct } from '@/data/products';

export default function Compare() {
  const { items, remove, clear } = useCompare();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const selected = items.map((s) => getProduct(s)).filter((p): p is NonNullable<ReturnType<typeof getProduct>> => !!p);

  const rows: { key: string; label: string; get: (p: NonNullable<ReturnType<typeof getProduct>>) => string }[] = [
    { key: 'tagline', label: isAr ? 'الوصف' : 'Tagline', get: (p) => (isAr ? p.taglineAr : p.taglineEn) },
    { key: 'burn', label: isAr ? 'مدة الاحتراق' : 'Burn time', get: (p) => p.specs.burn },
    { key: 'heat', label: isAr ? 'الحرارة' : 'Heat', get: (p) => p.specs.heat },
    { key: 'carbon', label: isAr ? 'الكربون' : 'Carbon', get: (p) => p.specs.carbon },
    { key: 'ash', label: isAr ? 'الرماد' : 'Ash', get: (p) => p.specs.ash },
    { key: 'moisture', label: isAr ? 'الرطوبة' : 'Moisture', get: (p) => p.specs.moisture },
    { key: 'packaging', label: isAr ? 'التغليف' : 'Packaging', get: (p) => p.specs.packaging },
    { key: 'uses', label: isAr ? 'الاستخدامات' : 'Use cases', get: (p) => (isAr ? p.useCasesAr : p.useCasesEn).join(' • ') },
  ];

  return (
    <>
      <SEO
        title={isAr ? 'مقارنة المنتجات — فحم النخلة' : 'Compare Products — Palm Charcoal'}
        description={isAr ? 'قارن المواصفات التقنية بين منتجات فحم النخلة جنبًا إلى جنب.' : 'Compare Palm Charcoal product specs side by side.'}
        path="/compare"
        noindex
      />
      <PageHero
        eyebrow={isAr ? 'مقارنة' : 'Compare'}
        title={isAr ? 'قارن منتجاتنا' : 'Compare Products'}
      />

      <section className="section-tight">
        <div className="container">
          {selected.length < 2 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <p className="text-foreground/70 mb-6">
                {isAr
                  ? 'اختر منتجين أو أكثر من صفحة المنتجات لمقارنتهما هنا.'
                  : 'Pick 2 or more products from the catalog to compare them here.'}
              </p>
              <Link to="/products" className="btn-gold">
                {isAr ? 'تصفح المنتجات' : 'Browse products'} <Arrow className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={clear}
                  className="text-xs text-foreground/60 hover:text-gold-hi transition-colors uppercase tracking-[0.2em]"
                >
                  {isAr ? 'مسح الكل' : 'Clear all'}
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border-luxe bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/15">
                      <th className="p-4 text-start text-[10px] uppercase tracking-[0.25em] text-gold w-40">
                        {isAr ? 'المواصفة' : 'Spec'}
                      </th>
                      {selected.map((p) => (
                        <th key={p.slug} className="p-4 align-top min-w-[200px]">
                          <div className="relative">
                            <button
                              onClick={() => remove(p.slug)}
                              className="absolute top-0 end-0 text-foreground/50 hover:text-gold-hi"
                              aria-label="remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="aspect-[5/4] rounded-xl overflow-hidden mb-3 border-luxe">
                              <img src={p.image} alt={isAr ? p.nameAr : p.nameEn} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                            </div>
                            <Link
                              to={`/products/${p.slug}`}
                              className={`block text-base text-gold-hi hover:text-gold ${isAr ? 'font-arabic font-bold' : 'font-display'}`}
                            >
                              {isAr ? p.nameAr : p.nameEn}
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} className="border-b border-gold/10 last:border-0">
                        <td className="p-4 text-[10px] uppercase tracking-[0.25em] text-foreground/60 align-top">
                          {row.label}
                        </td>
                        {selected.map((p) => (
                          <td key={p.slug} className="p-4 text-gold-hi/90 align-top">
                            {row.get(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4" />
                      {selected.map((p) => (
                        <td key={p.slug} className="p-4">
                          <Link to={`/products/${p.slug}`} className="btn-ghost-gold !py-2 !px-4 text-xs">
                            {isAr ? 'التفاصيل' : 'Details'} <Arrow className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
