import { useTranslation } from 'react-i18next';
import craftProcess from '@/assets/design/craft-process.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { SectionHeader, ProcessStepCard } from './primitives';
import { BrandIcon } from '@/components/brand/BrandIcon';
import type { BrandIconName } from '@/lib/brandTokens';

/**
 * القسم 4 — Craft Process (Cinematic)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.4
 */
export function CraftProcessSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const steps: Array<{ n: string; ar: string; en: string; ar_d: string; en_d: string; icon: BrandIconName }> = [
    { n: '01', ar: 'الحصاد',   en: 'Harvest',    ar_d: 'اختيار جذوع النخيل الطبيعية', en_d: 'Selecting fallen palm trunks', icon: 'leafSustain' },
    { n: '02', ar: 'الكربنة',  en: 'Carbonize',  ar_d: '٧٢ ساعة على حرارة مضبوطة',   en_d: '72 hours at controlled heat',  icon: 'flame' },
    { n: '03', ar: 'التنقية',  en: 'Purify',     ar_d: 'فحص الكربون في المختبر',      en_d: 'Lab-tested carbon content',    icon: 'labFlask' },
    { n: '04', ar: 'التعبئة',  en: 'Package',    ar_d: 'تعبئة فاخرة يدوية',           en_d: 'Hand-finished premium packaging', icon: 'shippingCrate' },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-dark-2 text-dark-foreground">
      <ResponsiveImage
        base="craft-process"
        fallback={craftProcess}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-2/70 via-dark-2/85 to-dark-2" />

      <div className="relative container" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mb-20">
          <SectionHeader eyebrow={isAr ? 'الحرفة' : 'The Craft'} size="lg">
            {isAr ? (
              <>أربع خطوات<br /><span className="italic text-gold">من الجذع إلى الجمرة</span></>
            ) : (
              <>Four steps<br /><span className="italic text-gold">from trunk to ember</span></>
            )}
          </SectionHeader>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 relative">
          {steps.map((s) => (
            <ProcessStepCard
              key={s.n}
              n={s.n}
              title={isAr ? s.ar : s.en}
              description={isAr ? s.ar_d : s.en_d}
              icon={<BrandIcon name={s.icon} size="xl" />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CraftProcessSection;
