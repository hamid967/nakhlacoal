import { useTranslation } from 'react-i18next';
import craftProcess from '@/assets/design/craft-process.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { Eyebrow, ProcessStepCard } from './primitives';

/**
 * القسم 4 — Craft Process (Cinematic)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.4
 */
export function CraftProcessSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const steps = [
    { n: '01', ar: 'الحصاد', en: 'Harvest', ar_d: 'اختيار جذوع النخيل الطبيعية', en_d: 'Selecting fallen palm trunks' },
    { n: '02', ar: 'الكربنة', en: 'Carbonize', ar_d: '٧٢ ساعة على حرارة مضبوطة', en_d: '72 hours at controlled heat' },
    { n: '03', ar: 'التنقية', en: 'Purify', ar_d: 'فحص الكربون في المختبر', en_d: 'Lab-tested carbon content' },
    { n: '04', ar: 'التعبئة', en: 'Package', ar_d: 'تعبئة فاخرة يدوية', en_d: 'Hand-finished premium packaging' },
  ];

  return (
    <section className="relative py-24 lg:py-40 overflow-hidden bg-dark-2 text-dark-foreground">
      <ResponsiveImage
        base="craft-process"
        fallback={craftProcess}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-2/70 via-dark-2/85 to-dark-2" />

      <div className="relative container" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mb-20 space-y-6">
          <Eyebrow>{isAr ? 'الحرفة' : 'The Craft'}</Eyebrow>
          <h2
            className="font-editorial-bold leading-[0.95]"
            style={{ fontSize: 'clamp(40px, 5.6vw, 88px)' }}
          >
            {isAr ? (
              <>أربع خطوات<br /><span className="italic text-gold">من الجذع إلى الجمرة</span></>
            ) : (
              <>Four steps<br /><span className="italic text-gold">from trunk to ember</span></>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 relative">
          {steps.map((s) => (
            <ProcessStepCard
              key={s.n}
              n={s.n}
              title={isAr ? s.ar : s.en}
              description={isAr ? s.ar_d : s.en_d}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CraftProcessSection;
