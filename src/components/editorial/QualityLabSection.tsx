import { useTranslation } from 'react-i18next';
import qualityLab from '@/assets/design/quality-lab.jpg';
import { ResponsiveImage } from './ResponsiveImage';
import { Eyebrow, StatCard } from './primitives';
import { BrandIcon } from '@/components/brand/BrandIcon';
import type { BrandIconName } from '@/lib/brandTokens';

/**
 * القسم 5 — Quality Lab (Split screen)
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.5
 */
export function QualityLabSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const stats: Array<{ v: string; l: string; icon: BrandIconName }> = [
    { v: '85%',  l: isAr ? 'كربون ثابت'    : 'Fixed carbon', icon: 'charcoalPiece' },
    { v: '<8%',  l: isAr ? 'الرطوبة'       : 'Moisture',     icon: 'labFlask' },
    { v: '4-5h', l: isAr ? 'مدة الاحتراق'  : 'Burn time',    icon: 'flame' },
    { v: '<3%',  l: isAr ? 'الرماد'        : 'Ash content',  icon: 'qualityShield' },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      <div
        className="container grid grid-cols-12 gap-8 lg:gap-16 items-center"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="col-span-12 lg:col-span-6 relative">
          <ResponsiveImage
            base="quality-lab"
            fallback={qualityLab}
            alt={isAr ? 'مختبر جودة الفحم' : 'Charcoal quality lab'}
            className="w-full aspect-[4/3] object-cover shadow-luxe"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="hidden lg:flex items-start gap-4 absolute -bottom-8 -right-8 bg-dark text-dark-foreground p-6 shadow-luxe max-w-[260px]">
            <BrandIcon name="qualityShield" size="xl" color="hsl(var(--gold))" title="ISO" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold">ISO 9001</p>
              <p className="mt-2 text-sm text-dark-foreground/70">
                {isAr ? 'كل دفعة تُختبر مخبريًا' : 'Every batch lab-tested'}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-10">
          <div className="space-y-6">
            <Eyebrow>{isAr ? 'الجودة' : 'Quality'}</Eyebrow>
            <h2
              className="font-editorial-bold leading-[0.95] text-foreground"
              style={{ fontSize: 'clamp(36px, 4.6vw, 72px)' }}
            >
              {isAr ? (
                <>معايير <span className="italic text-jade">لا تقبل التنازل</span></>
              ) : (
                <>Standards <span className="italic text-jade">without compromise</span></>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10">
            {stats.map((s) => (
              <StatCard key={s.l} value={s.v} label={s.l} icon={<BrandIcon name={s.icon} size="lg" />} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default QualityLabSection;
