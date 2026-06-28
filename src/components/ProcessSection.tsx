import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { LuxSection, SectionHeader } from './ui-lux';
import s1 from '@/assets/step-harvest.jpg';
import s2 from '@/assets/step-carbonize.jpg';
import s3 from '@/assets/step-grind.jpg';
import s4 from '@/assets/step-press.jpg';
import s5 from '@/assets/step-pack.jpg';

export function ProcessSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const steps = [
    {
      img: s1,
      ar: { t: 'الحصاد والاختيار', d: 'نختار قشور جوز الهند الناضجة من مزارع إندونيسيا المعتمدة، ونفرز يدويًا أعلى جودة فقط.' },
      en: { t: 'Harvest & Selection', d: 'Mature coconut shells are harvested from certified Indonesian plantations and hand-sorted for top grade only.' },
    },
    {
      img: s2,
      ar: { t: 'الكربنة في الأفران', d: 'تحرق القشور في أفران مغلقة بدرجات حرارة مدروسة لإنتاج كربون نقي بدون شوائب.' },
      en: { t: 'Carbonization', d: 'Shells are slow-burned in sealed kilns at controlled temperatures to yield pure, smoke-free carbon.' },
    },
    {
      img: s3,
      ar: { t: 'الطحن والخلط', d: 'يُطحن الفحم إلى مسحوق ناعم ويُخلط مع رابط طبيعي ١٠٠٪ بدون كيماويات.' },
      en: { t: 'Grinding & Mixing', d: 'Carbon is milled into fine powder and bound with 100% natural binder — zero chemicals.' },
    },
    {
      img: s4,
      ar: { t: 'الكبس والتجفيف', d: 'يُكبس الخليط في مكعبات بحجم ٢٥مم وتُجفّف ٤٨ ساعة للحصول على كثافة وحرارة مثالية.' },
      en: { t: 'Pressing & Drying', d: 'Pressed into 25mm cubes and slow-dried for 48 hours to lock in density and heat.' },
    },
    {
      img: s5,
      ar: { t: 'التغليف والشحن', d: 'يُغلف في عبوات معتمدة محكمة الإغلاق ويُشحن جاهزًا للجلسات الفاخرة.' },
      en: { t: 'Packaging & Shipping', d: 'Sealed in premium pouches, ready for the finest sessions worldwide.' },
    },
  ];

  return (
    <LuxSection tone="surface" className="py-20 md:py-28">
      <SectionHeader
        eyebrow={isAr ? 'طريقة الصنع' : 'How it’s made'}
        title={isAr ? 'رحلة فحم معسل جوز الهند — خطوة بخطوة' : 'The coconut hookah charcoal journey — step by step'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
        {steps.map((step, i) => {
          const txt = isAr ? step.ar : step.en;
          return (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="group relative h-full overflow-hidden rounded-2xl border-luxe bg-background shadow-luxe">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={step.img}
                    alt={txt.t}
                    width={1280}
                    height={1280}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/30 to-transparent" />
                  <div className="absolute top-3 start-3 w-10 h-10 rounded-full flex items-center justify-center bg-gold-hi/95 text-dark font-display font-bold text-lg shadow-luxe">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: 'linear-gradient(115deg, transparent 40%, rgba(212,175,55,0.18) 50%, transparent 60%)' }}
                  />
                </div>
                <div className="p-5">
                  <h3 className={`text-lg mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
                    {txt.t}
                  </h3>
                  <p className={`text-sm leading-relaxed text-foreground/70 ${isAr ? 'font-arabic' : ''}`}>
                    {txt.d}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </LuxSection>
  );
}
