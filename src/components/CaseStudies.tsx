import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useDir } from '@/components/ui-lux';

type Study = {
  client: { ar: string; en: string };
  sector: { ar: string; en: string };
  challenge: { ar: string; en: string };
  outcome: { ar: string; en: string };
  metric: { value: string; label: { ar: string; en: string } };
};

const STUDIES: Study[] = [
  {
    client: { ar: 'سلسلة مطاعم اللحوم الملكية', en: 'Royal Steakhouse Group' },
    sector: { ar: 'ضيافة فاخرة · الرياض', en: 'Luxury Hospitality · Riyadh' },
    challenge: {
      ar: 'استهلاك مرتفع للفحم مع تذبذب في الحرارة أثناء ساعات الذروة.',
      en: 'High charcoal consumption and heat inconsistency during peak hours.',
    },
    outcome: {
      ar: 'خفض التكلفة التشغيلية مع حرارة ثابتة عبر ٩ فروع.',
      en: 'Reduced operating cost with stable heat across 9 branches.',
    },
    metric: { value: '−38%', label: { ar: 'استهلاك الفحم', en: 'Charcoal usage' } },
  },
  {
    client: { ar: 'مصدّر خليجي — الإمارات', en: 'Gulf Exporter — UAE' },
    sector: { ar: 'تصدير وجملة', en: 'Export & Wholesale' },
    challenge: {
      ar: 'الحاجة إلى توريد شهري بمواصفات ISO موحّدة لأسواق أوروبا.',
      en: 'Monthly ISO-grade supply for European markets.',
    },
    outcome: {
      ar: 'شحن ٤٠ حاوية سنويًا بمعدل تسليم ٩٩٪ في الموعد.',
      en: '40 containers shipped yearly with 99% on-time delivery.',
    },
    metric: { value: '99%', label: { ar: 'التسليم في الموعد', en: 'On-time delivery' } },
  },
  {
    client: { ar: 'مقاهي المعسل الفاخرة', en: 'Premium Shisha Lounges' },
    sector: { ar: 'قطاع الترفيه', en: 'Hospitality' },
    challenge: {
      ar: 'شكاوى من الروائح وسرعة انطفاء الفحم.',
      en: 'Odor complaints and short burn duration.',
    },
    outcome: {
      ar: 'فحم جوز الهند بمدة احتراق ١٢٠ دقيقة بدون روائح.',
      en: 'Coconut charcoal — 120min burn, zero odor.',
    },
    metric: { value: '2×', label: { ar: 'زمن الاحتراق', en: 'Burn time' } },
  },
  {
    client: { ar: 'برنامج طهاة عالميين', en: 'Global Chefs Program' },
    sector: { ar: 'شراكات إعلامية', en: 'Media Partnership' },
    challenge: {
      ar: 'الحاجة إلى فحم عرض بجودة تصويرية عالية للبرامج التلفزيونية.',
      en: 'Camera-grade charcoal for televised cooking shows.',
    },
    outcome: {
      ar: 'اعتماد فحم النخلة كمورّد رسمي في ٣ مواسم.',
      en: 'Palm Charcoal named official supplier — 3 seasons.',
    },
    metric: { value: '3', label: { ar: 'مواسم بثّ', en: 'Broadcast seasons' } },
  },
];

export function CaseStudies() {
  const { isAr } = useDir();
  const [i, setI] = useState(0);
  const s = STUDIES[i];
  const next = () => setI((v) => (v + 1) % STUDIES.length);
  const prev = () => setI((v) => (v - 1 + STUDIES.length) % STUDIES.length);

  return (
    <section
      aria-label={isAr ? 'دراسات الحالة' : 'Case studies'}
      className="relative z-0 isolate bg-[#0B0B0B] py-24 md:py-32 overflow-hidden"
    >
      <div className="container">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[hsl(46_90%_60%)] text-xs uppercase tracking-[0.28em] mb-4 font-arabic">
              {isAr ? 'دراسات الحالة' : 'Case studies'}
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white max-w-2xl leading-tight">
              {isAr ? 'قصص نجاح صنعناها مع شركائنا' : 'Success stories, engineered with our partners'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label={isAr ? 'السابق' : 'Previous'}
              className="h-11 w-11 grid place-items-center rounded-full border border-[hsl(46_90%_50%/0.3)] text-[hsl(46_90%_65%)] hover:bg-[hsl(46_90%_50%/0.1)] focus-visible:ring-2 focus-visible:ring-[hsl(46_90%_60%)] transition"
            >
              {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </button>
            <button
              onClick={next}
              aria-label={isAr ? 'التالي' : 'Next'}
              className="h-11 w-11 grid place-items-center rounded-full border border-[hsl(46_90%_50%/0.3)] text-[hsl(46_90%_65%)] hover:bg-[hsl(46_90%_50%/0.1)] focus-visible:ring-2 focus-visible:ring-[hsl(46_90%_60%)] transition"
            >
              {isAr ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-[hsl(46_90%_50%/0.2)] bg-gradient-to-br from-white/[0.03] to-black/40 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="text-[hsl(46_90%_60%)] text-xs uppercase tracking-[0.24em] font-arabic">
                {isAr ? s.sector.ar : s.sector.en}
              </div>
              <h3 className="text-2xl md:text-4xl font-display font-bold text-white">
                {isAr ? s.client.ar : s.client.en}
              </h3>
              <div>
                <div className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2 font-arabic">
                  {isAr ? 'التحدي' : 'Challenge'}
                </div>
                <p className="text-white/80 text-base md:text-lg font-arabic leading-relaxed">
                  {isAr ? s.challenge.ar : s.challenge.en}
                </p>
              </div>
              <div>
                <div className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2 font-arabic">
                  {isAr ? 'النتيجة' : 'Outcome'}
                </div>
                <p className="text-white/80 text-base md:text-lg font-arabic leading-relaxed">
                  {isAr ? s.outcome.ar : s.outcome.en}
                </p>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-[hsl(46_90%_50%/0.25)] bg-black/40 p-8 text-center">
              <div className="text-6xl md:text-7xl font-display font-bold text-[hsl(46_90%_65%)] leading-none">
                {s.metric.value}
              </div>
              <div className="mt-4 text-white/70 text-sm uppercase tracking-[0.2em] font-arabic">
                {isAr ? s.metric.label.ar : s.metric.label.en}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-2" role="tablist">
          {STUDIES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              role="tab"
              aria-selected={idx === i}
              aria-label={`${isAr ? 'دراسة' : 'Case'} ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[hsl(46_90%_60%)] ${
                idx === i ? 'w-10 bg-[hsl(46_90%_60%)]' : 'w-4 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
