import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Leaf, Droplets, Recycle, TreeDeciduous } from 'lucide-react';

/** Count-up hook — respects prefers-reduced-motion. */
function useCountUp(target: number, active: boolean, duration = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(target); return; }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return v;
}

interface MetricProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  delay?: number;
}

function Metric({ icon: Icon, value, suffix = '', label, detail, delay = 0 }: MetricProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const n = useCountUp(value, inView);
  const display = value >= 100 ? Math.round(n).toLocaleString() : n.toFixed(1);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative p-6 md:p-8 rounded-2xl border border-[hsl(var(--gold))]/20 bg-gradient-to-b from-white/[0.03] to-transparent"
    >
      <div className="absolute -top-4 start-6 w-10 h-10 rounded-full grid place-items-center bg-[#0B0B0B] border border-[hsl(var(--gold))]/40">
        <Icon className="w-4 h-4 text-[hsl(var(--gold-hi,46_95%_78%))]" />
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1 text-[hsl(var(--gold-hi,46_95%_78%))]">
          <span className="text-4xl md:text-5xl font-display leading-none">{display}</span>
          <span className="text-xl md:text-2xl">{suffix}</span>
        </div>
        <div className="mt-3 text-white text-sm md:text-base font-arabic">{label}</div>
        <div className="mt-1 text-white/55 text-xs md:text-sm font-arabic">{detail}</div>
      </div>
    </motion.div>
  );
}

/**
 * Sustainability pillar with 4 measurable commitments.
 * Emphasises data over marketing copy — matches Stripe / Linear reporting aesthetic.
 */
export function SustainabilityReport() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const metrics: MetricProps[] = [
    {
      icon: TreeDeciduous,
      value: 100,
      suffix: '%',
      label: isAr ? 'مصادر متجدّدة' : 'Renewable sources',
      detail: isAr ? 'جذوع نخيل من مزارع مُدارة' : 'Palm trunks from managed farms',
    },
    {
      icon: Recycle,
      value: 82,
      suffix: '%',
      label: isAr ? 'مخلّفات مُعاد تدويرها' : 'Waste recycled',
      detail: isAr ? 'الرماد يُستخدم كسماد عضوي' : 'Ash returned as organic fertiliser',
      delay: 0.08,
    },
    {
      icon: Droplets,
      value: 3.4,
      suffix: '×',
      label: isAr ? 'كفاءة استهلاك المياه' : 'Water efficiency',
      detail: isAr ? 'مقارنة بالمعايير التقليدية' : 'vs. legacy carbonisation',
      delay: 0.16,
    },
    {
      icon: Leaf,
      value: 47,
      suffix: '%',
      label: isAr ? 'خفض في انبعاثات الكربون' : 'Carbon emissions cut',
      detail: isAr ? 'منذ عام ٢٠٢٢' : 'since 2022 baseline',
      delay: 0.24,
    },
  ];

  return (
    <section className="relative z-0 isolate py-24 md:py-32 bg-[#0B0B0B] overflow-hidden">
      {/* Soft gold aurora */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, hsl(var(--gold) / 0.10), transparent 70%)',
        }}
      />

      <div className="container">
        <div className="max-w-3xl mb-14 md:mb-20">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4 font-arabic">
            {isAr ? 'الاستدامة' : 'Sustainability'}
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
            {isAr ? 'الرقي مع الأرض، لا على حسابها' : 'Luxury with the land, never against it'}
          </h2>
          <p className={`mt-5 text-white/70 text-base md:text-lg leading-relaxed max-w-2xl ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? 'نلتزم بمعايير قابلة للقياس عبر سلسلة القيمة كاملة — من المزرعة إلى الفرن إلى العميل.'
              : 'Measurable commitments across the full value chain — from the farm to the kiln to the customer.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
          {metrics.map((m, i) => (
            <Metric key={i} {...m} />
          ))}
        </div>

        <div className="mt-10 md:mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs md:text-sm text-white/50 font-arabic">
          <span>{isAr ? 'تُراجَع البيانات سنويًا' : 'Audited annually'}</span>
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]/40" />
          <span>{isAr ? 'مطابقة إرشادات SASB' : 'Aligned with SASB guidance'}</span>
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]/40" />
          <span>{isAr ? 'رؤية المملكة ٢٠٣٠' : 'Vision 2030 aligned'}</span>
        </div>
      </div>
    </section>
  );
}
