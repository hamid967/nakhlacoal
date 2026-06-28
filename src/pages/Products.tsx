import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PageHero } from '@/components/PageHero';
import { products } from '@/data/products';

export default function Products() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

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

      <section className="py-20 md:py-28">
        <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((p, i) => {
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
                      0{i + 1} / 0{products.length}
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
      </section>
    </>
  );
}
