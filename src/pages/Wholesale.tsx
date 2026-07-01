import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, ArrowLeft, MessageCircle, Check } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

type TierKey = 'restaurant' | 'lounge' | 'distributor' | 'container';

const WHATSAPP = '966540060095';

const TIERS: {
  key: TierKey;
  name: { ar: string; en: string };
  minKg: number;
  pricePerKg: number; // SAR
  perks: { ar: string; en: string }[];
  featured?: boolean;
}[] = [
  {
    key: 'restaurant',
    name: { ar: 'باقة المطاعم', en: 'Restaurant Pack' },
    minKg: 250,
    pricePerKg: 9.5,
    perks: [
      { ar: 'توصيل أسبوعي منتظم', en: 'Weekly scheduled delivery' },
      { ar: 'فحم شواء ثابت الحرارة', en: 'Consistent-heat BBQ charcoal' },
      { ar: 'فوترة ضريبية معتمدة', en: 'ZATCA-compliant invoicing' },
    ],
  },
  {
    key: 'lounge',
    name: { ar: 'باقة المقاهي', en: 'Lounge Pack' },
    minKg: 500,
    pricePerKg: 8.75,
    featured: true,
    perks: [
      { ar: 'فحم جوز الهند بدون روائح', en: 'Odorless coconut charcoal' },
      { ar: 'تعبئة مخصصة بالعلامة', en: 'Custom branded packaging' },
      { ar: 'مدير حساب مخصص', en: 'Dedicated account manager' },
    ],
  },
  {
    key: 'distributor',
    name: { ar: 'الموزّعون', en: 'Distributor' },
    minKg: 2000,
    pricePerKg: 7.5,
    perks: [
      { ar: 'أسعار مرنة حسب الحجم', en: 'Volume-based flex pricing' },
      { ar: 'دعم تسويقي وشعارات مشتركة', en: 'Co-marketing & assets' },
      { ar: 'أولوية في التوريد', en: 'Priority supply allocation' },
    ],
  },
  {
    key: 'container',
    name: { ar: 'حاوية تصدير', en: 'Export Container' },
    minKg: 20000,
    pricePerKg: 6.25,
    perks: [
      { ar: 'شحن FOB / CIF', en: 'FOB / CIF shipping' },
      { ar: 'شهادات ISO ومنشأ', en: 'ISO & origin certificates' },
      { ar: 'جدولة إنتاج مسبقة', en: 'Pre-scheduled production' },
    ],
  },
];

export default function Wholesale() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const [tierIdx, setTierIdx] = useState(1);
  const tier = TIERS[tierIdx];
  const [qty, setQty] = useState(tier.minKg);

  // Keep qty ≥ minKg when switching tier
  const effectiveQty = Math.max(qty, tier.minKg);
  const total = useMemo(() => effectiveQty * tier.pricePerKg, [effectiveQty, tier]);
  const fmt = (n: number) =>
    new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', { maximumFractionDigits: 0 }).format(n);

  const waMsg = encodeURIComponent(
    isAr
      ? `مرحبًا فحم النخلة، أرغب بعرض سعر:\n• الباقة: ${tier.name.ar}\n• الكمية: ${fmt(effectiveQty)} كجم\n• السعر التقديري: ${fmt(total)} ر.س`
      : `Hello Palm Charcoal, I'd like a quote:\n• Package: ${tier.name.en}\n• Quantity: ${fmt(effectiveQty)} kg\n• Estimated: SAR ${fmt(total)}`
  );

  return (
    <>
      <SEO
        title={isAr ? 'الجملة والتسعير — فحم النخلة' : 'Wholesale & Pricing — Palm Charcoal'}
        description={
          isAr
            ? 'باقات جملة ديناميكية للمطاعم والمقاهي والموزّعين والتصدير مع تسعير فوري وطلب عرض سعر.'
            : 'Dynamic wholesale packages for restaurants, lounges, distributors and export — instant pricing and quote request.'
        }
        path="/wholesale"
      />
      <PageHero
        number={8}
        eyebrow={t('wholesale.eyebrow')}
        title={t('wholesale.title')}
        subtitle={t('wholesale.subtitle')}
      />

      {/* Dynamic pricing configurator */}
      <section className="section" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tier cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TIERS.map((tr, i) => {
              const active = i === tierIdx;
              return (
                <ScrollReveal key={tr.key} delay={i * 60}>
                  <button
                    type="button"
                    onClick={() => {
                      setTierIdx(i);
                      setQty(tr.minKg);
                    }}
                    aria-pressed={active}
                    className={`group relative h-full w-full text-start p-6 rounded-2xl border transition-all duration-500 focus-visible:ring-2 focus-visible:ring-gold ${
                      active
                        ? 'border-gold bg-gold/5 shadow-[0_0_0_1px_hsl(46_90%_50%/0.4)]'
                        : 'border-luxe hover:border-luxe-strong bg-surface'
                    }`}
                  >
                    {tr.featured && (
                      <span className={`absolute top-4 ${isAr ? 'start-4' : 'end-4'} text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-gold/15 text-gold-hi border border-gold/30`}>
                        {isAr ? 'الأكثر طلبًا' : 'Most popular'}
                      </span>
                    )}
                    <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
                      0{i + 1}
                    </div>
                    <h3 className={`text-xl md:text-2xl mb-1 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                      {isAr ? tr.name.ar : tr.name.en}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4">
                      {isAr ? `من ${fmt(tr.minKg)} كجم` : `From ${fmt(tr.minKg)} kg`}
                    </p>
                    <p className={`text-2xl text-gold-hi mb-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                      {fmt(tr.pricePerKg)} <span className="text-sm text-foreground/60">{isAr ? 'ر.س / كجم' : 'SAR / kg'}</span>
                    </p>
                    <ul className="space-y-2">
                      {tr.perks.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground/75">
                          <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span className={isAr ? 'font-arabic' : ''}>{isAr ? p.ar : p.en}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Configurator */}
          <ScrollReveal delay={120} className="lg:col-span-5">
            <div className="sticky top-28 p-8 rounded-3xl border-luxe-strong bg-surface">
              <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">
                {isAr ? 'التسعير الفوري' : 'Live pricing'}
              </div>
              <h3 className={`text-2xl mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                {isAr ? tier.name.ar : tier.name.en}
              </h3>

              <label htmlFor="qty" className="block text-sm text-foreground/70 mb-2">
                {isAr ? `الكمية (كجم) — الحد الأدنى ${fmt(tier.minKg)}` : `Quantity (kg) — min ${fmt(tier.minKg)}`}
              </label>
              <input
                id="qty"
                type="range"
                min={tier.minKg}
                max={Math.max(tier.minKg * 10, 25000)}
                step={Math.max(50, Math.round(tier.minKg / 10))}
                value={effectiveQty}
                onChange={(e) => setQty(Number(e.target.value))}
                aria-label={isAr ? 'اختر الكمية بالكيلوجرام' : 'Choose quantity in kilograms'}
                className="w-full accent-[hsl(46_90%_55%)]"
                dir="ltr"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-foreground/60">
                <span>{fmt(tier.minKg)}</span>
                <span className="text-gold-hi font-bold">{fmt(effectiveQty)} {isAr ? 'كجم' : 'kg'}</span>
                <span>{fmt(Math.max(tier.minKg * 10, 25000))}</span>
              </div>

              <div className="my-6 h-px bg-gold/15" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-foreground/70">{isAr ? 'السعر التقديري' : 'Estimated total'}</span>
                <span className={`text-4xl text-gold-hi ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
                  {fmt(total)} <span className="text-base text-foreground/60">{isAr ? 'ر.س' : 'SAR'}</span>
                </span>
              </div>
              <p className="text-xs text-foreground/50 mt-2">
                {isAr ? '* الأسعار استرشادية وتشمل الفوترة الضريبية. تُحسم الأسعار النهائية في عرض السعر.' : '* Indicative prices, VAT included. Final pricing confirmed in the quote.'}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full justify-center"
                  aria-label={isAr ? 'تواصل عبر واتساب لعرض السعر' : 'Contact on WhatsApp for a quote'}
                >
                  <MessageCircle className="w-4 h-4" />
                  {isAr ? 'تواصل واتساب' : 'WhatsApp us'}
                </a>
                <Link
                  to={`/quote?tier=${tier.key}&qty=${effectiveQty}`}
                  className="btn-ghost-gold w-full justify-center"
                >
                  {isAr ? 'إنشاء عرض سعر رسمي' : 'Build a formal quote'}
                  <Arrow className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="text-sm text-foreground/60 hover:text-gold-hi text-center underline-offset-4 hover:underline">
                  {isAr ? 'أو راسلنا عبر النموذج' : 'Or contact us via form'}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section bg-surface border-y border-gold/10" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <h2 className={`text-4xl md:text-5xl mb-6 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                {t('wholesale.register')}
              </h2>
              <p className="text-foreground/60 mb-8 leading-relaxed">{t('wholesale.subtitle')}</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="btn-gold">{t('wholesale.register')}</Link>
                <button className="btn-ghost-gold">
                  <Upload className="w-4 h-4" /> {t('wholesale.uploadDocs')}
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="relative aspect-[4/3] rounded-2xl border-luxe-strong overflow-hidden glass-luxe">
                <div className="absolute inset-0 ember-glow opacity-60 animate-ember" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-6xl text-gold-hi ${isAr ? 'font-arabic font-bold' : 'font-display italic'}`}>
                    {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
