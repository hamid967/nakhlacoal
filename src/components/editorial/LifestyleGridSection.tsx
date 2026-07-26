import { useTranslation } from 'react-i18next';
import lifestyleMajlis from '@/assets/design/lifestyle-majlis.jpg';
import packagingImg from '@/assets/design/packaging.jpg';
import productHero from '@/assets/design/product-hero.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { Eyebrow } from './primitives';

/**
 * القسم 6 — Lifestyle Masonry
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.6
 */
export function LifestyleGridSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative bg-surface-2 py-24 lg:py-32 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-12 gap-6 mb-16 items-end" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <Eyebrow>{isAr ? 'التجربة' : 'The Ritual'}</Eyebrow>
            <h2
              className="font-editorial-bold leading-[0.95] text-foreground"
              style={{ fontSize: 'clamp(36px, 4.8vw, 76px)' }}
            >
              {isAr ? (
                <>لحظات <span className="italic text-jade">تُشعلها الجمرة</span></>
              ) : (
                <>Moments <span className="italic text-jade">the ember creates</span></>
              )}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 md:col-span-7 relative overflow-hidden group">
            <ResponsiveImage
              base="lifestyle-majlis"
              fallback={lifestyleMajlis}
              alt=""
              className="w-full aspect-[16/10] object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
          </div>
          <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-4 lg:gap-6">
            <div className="relative overflow-hidden group">
              <ResponsiveImage
                base="packaging"
                fallback={packagingImg}
                alt=""
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="relative overflow-hidden group">
              <ResponsiveImage
                base="product-hero"
                fallback={productHero}
                alt=""
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LifestyleGridSection;
