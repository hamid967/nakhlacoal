import { Flame, Leaf, Shield, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FeatureCard, GoldCTA, GhostCTA } from './primitives';

/**
 * القسم 8 — Features + Final CTA
 * مرجع الخطة: docs/DESIGN_PLAN.md §3.8
 */
export function FeatureCtaSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const features = [
    { Icon: Flame, ar: 'حرارة عالية', en: 'High Heat' },
    { Icon: Clock, ar: 'احتراق طويل', en: 'Long Burn' },
    { Icon: Leaf, ar: 'طبيعي ١٠٠٪', en: '100% Natural' },
    { Icon: Shield, ar: 'جودة موثقة', en: 'Certified Quality' },
  ];

  return (
    <section className="relative bg-dark-2 text-dark-foreground py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, hsl(var(--gold) / 0.25), transparent 60%)',
        }}
      />
      <div className="relative container" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          {features.map(({ Icon, ar, en }) => (
            <FeatureCard
              key={en}
              icon={<Icon className="h-8 w-8 text-gold" strokeWidth={1.25} />}
              title={isAr ? ar : en}
            />
          ))}
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h2
            className="font-editorial-bold leading-[0.95] text-dark-foreground"
            style={{ fontSize: 'clamp(48px, 7vw, 120px)' }}
          >
            {isAr ? (
              <>ابدأ تجربة <span className="italic text-gold">الفخامة</span></>
            ) : (
              <>Begin your <span className="italic text-gold">luxury ritual</span></>
            )}
          </h2>
          <p className="text-dark-foreground/70 max-w-xl mx-auto">
            {isAr
              ? 'تواصل معنا لطلب عينة، عرض سعر للجملة، أو استشارة منتج مخصصة لعملك.'
              : 'Reach out for a sample, wholesale quote, or a tailored product consultation.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <GoldCTA to="/products">{isAr ? 'اطلب الآن' : 'Shop Now'}</GoldCTA>
            <GhostCTA to="/quote">{isAr ? 'احسب عرض السعر' : 'Get a Quote'}</GhostCTA>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureCtaSection;
