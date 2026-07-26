import { useTranslation } from 'react-i18next';
import palmOrigin from '@/assets/design/palm-origin.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { BigNumber, SectionHeader, SectionLead } from './primitives';

/**
 * القسم 2 — Origin Story (Broken Grid)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.2
 */
export function OriginStorySection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative bg-background py-24 lg:py-32 overflow-hidden">
      <div className="container grid grid-cols-12 gap-6 lg:gap-10 items-center">
        <div className="col-span-12 lg:col-span-7 relative">
          <div className="absolute -top-16 -left-4 lg:-left-8 z-0">
            <BigNumber n="01" />
          </div>
          <ResponsiveImage
            base="palm-origin"
            fallback={palmOrigin}
            alt={isAr ? 'مزارع النخيل السعودية' : 'Saudi palm groves'}
            className="relative z-10 w-full aspect-[16/10] object-cover shadow-luxe"
            width={1920}
            height={1088}
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>
        <div
          className="col-span-12 lg:col-span-5 lg:-ml-16 xl:-ml-24 z-20 bg-surface p-8 lg:p-12 space-y-6 shadow-luxe"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <SectionHeader eyebrow={isAr ? 'الأصل' : 'Origin'} size="md">
            {isAr ? (
              <>من نخيل المدينة<br /><span className="italic text-jade">إلى موائد العالم</span></>
            ) : (
              <>From Madinah palms<br /><span className="italic text-jade">to the world&apos;s tables</span></>
            )}
          </SectionHeader>
          <SectionLead>
            {isAr
              ? 'نختار جذوع النخيل المتساقطة من مزارع المدينة والقصيم — مادة عضوية فائقة الكثافة تُكربَن ببطء على درجات محكومة لتنتج جمرة نقية بلا مواد كيميائية.'
              : 'We hand-select fallen palm trunks from Madinah and Qassim — dense organic material slow-carbonized at controlled temperatures for a pure, chemical-free ember.'}
          </SectionLead>
          <div className="pt-4 flex items-center gap-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <span>{isAr ? '١٠٠٪ طبيعي' : '100% Natural'}</span>
            <span className="h-px w-8 bg-gold/50" />
            <span>{isAr ? 'خالٍ من المواد الكيميائية' : 'Chemical-free'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OriginStorySection;
