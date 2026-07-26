import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import productHero from '@/assets/design/product-hero.jpg';
import packagingImg from '@/assets/design/packaging.jpg';
import textureMacro from '@/assets/design/texture-macro.jpg';
import { SectionHeader, SectionLead } from './primitives';
import { ProductCard } from './ProductCard';

/**
 * القسم 3 — Product Showcase (Bento مكسور)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.3
 */
export function ProductShowcaseSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative bg-dark text-dark-foreground py-24 lg:py-32 overflow-hidden">
      <div className="container">
        <div
          className="grid grid-cols-12 gap-6 lg:gap-8 mb-16 items-end"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="col-span-12 lg:col-span-6">
            <SectionHeader eyebrow={isAr ? 'مجموعتنا' : 'The Collection'} size="lg">
              {isAr ? (
                <>منتجات <span className="italic text-gold">مصنوعة بإتقان</span></>
              ) : (
                <>Crafted <span className="italic text-gold">to perfection</span></>
              )}
            </SectionHeader>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 space-y-4">
            <SectionLead tone="dark">
              {isAr
                ? 'أربع تشكيلات فاخرة صُممت للطهي المهني، الشيشة، والمناسبات — كل قطعة تحمل هوية النخلة.'
                : 'Four premium collections engineered for professional cooking, shisha, and hospitality — each carrying the palm signature.'}
            </SectionLead>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-hi text-sm uppercase tracking-[0.22em]"
            >
              {isAr ? 'كل المنتجات' : 'View all'} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          className="grid grid-cols-12 grid-rows-2 gap-4 lg:gap-6"
          style={{ minHeight: '640px' }}
        >
          <ProductCard
            to="/products"
            size="hero"
            eyebrow="Signature"
            title={isAr ? 'الفاخر' : 'The Signature'}
            description={
              isAr
                ? 'مكعبات النخيل الفاخرة — احتراق ٤ ساعات، رماد <٣٪.'
                : 'Premium palm cubes — 4-hour burn, <3% ash.'
            }
            imgBase="product-hero"
            imgFallback={productHero}
            imgSizes="(max-width: 1024px) 100vw, 55vw"
            className="col-span-12 lg:col-span-7 row-span-2"
          />
          <ProductCard
            to="/products"
            eyebrow="Gift Edition"
            title={isAr ? 'الهدية' : 'The Gift'}
            imgBase="packaging"
            imgFallback={packagingImg}
            imgSizes="(max-width: 1024px) 50vw, 25vw"
            className="col-span-6 lg:col-span-3 row-span-1"
          />
          <ProductCard
            variant="solid"
            to="/wholesale"
            eyebrow="Bulk"
            title={isAr ? 'الجملة' : 'Wholesale'}
            className="col-span-6 lg:col-span-2 row-span-1"
          />
          <ProductCard
            to="/products"
            eyebrow="Shisha"
            title={isAr ? 'شيشة' : 'Shisha'}
            description={isAr ? 'كتل ثلاثية عالية الكثافة' : 'High-density triple cubes'}
            imgBase="texture-macro"
            imgFallback={textureMacro}
            imgSizes="(max-width: 1024px) 100vw, 40vw"
            imgOpacity={0.7}
            overlay="right"
            className="col-span-12 lg:col-span-5 row-span-1"
          />
        </div>
      </div>
    </section>
  );
}

export default ProductShowcaseSection;
