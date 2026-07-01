import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Globe2, Package, Star, type LucideIcon } from 'lucide-react';

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix?: string;
  label: string;
  hint: string;
};

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const controls = animate(mv, to, { duration: 2, ease: [0.16, 1, 0.3, 1] });
          io.disconnect();
          return () => controls.stop();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mv, to]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function StatsGrid() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const stats: Stat[] = isAr
    ? [
        { icon: Package, value: 50000, suffix: '+', label: 'طلب مُنجز', hint: 'منذ الانطلاق' },
        { icon: Globe2, value: 12, suffix: '+', label: 'دولة تصدير', hint: 'الخليج وأوروبا وآسيا' },
        { icon: Flame, value: 750, suffix: '°C', label: 'ذروة الحرارة', hint: 'ثابتة طوال الشوي' },
        { icon: Star, value: 98, suffix: '%', label: 'رضا العملاء', hint: 'تقييمات حقيقية' },
      ]
    : [
        { icon: Package, value: 50000, suffix: '+', label: 'Orders Fulfilled', hint: 'Since launch' },
        { icon: Globe2, value: 12, suffix: '+', label: 'Export Countries', hint: 'Gulf · EU · Asia' },
        { icon: Flame, value: 750, suffix: '°C', label: 'Peak Heat', hint: 'Held throughout grill' },
        { icon: Star, value: 98, suffix: '%', label: 'Customer Rating', hint: 'Verified reviews' },
      ];

  return (
    <section className="relative py-20 md:py-28 bg-[hsl(var(--background))] overflow-hidden">
      {/* Faint gold seam */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(46 72% 62% / 0.5), transparent)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(600px 300px at 50% 0%, hsl(46 72% 62% / 0.08), transparent 70%)',
        }}
      />

      <div className="container relative">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
            {isAr ? '— أرقام تحكي —' : '— By the numbers —'}
          </span>
          <h2
            className={`mt-4 text-3xl md:text-5xl text-[hsl(var(--foreground))] ${
              isAr ? 'font-arabic font-bold' : 'font-display font-bold'
            }`}
          >
            {isAr ? 'ثقة تُقاس، لا تُقال' : 'Trust, measured — not claimed'}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl p-6 md:p-7 border border-[hsl(var(--gold))]/20 bg-[hsl(var(--surface))] hover:border-[hsl(var(--gold))]/50 transition-colors"
              style={{
                boxShadow:
                  'inset 0 1px 0 hsl(46 72% 62% / 0.10), 0 24px 60px -30px hsl(0 0% 0% / 0.7)',
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[hsl(var(--gold))]/35 bg-black/40 shadow-[0_0_18px_hsl(46_72%_62%/0.3)]">
                  <s.icon className="w-5 h-5 text-[hsl(var(--gold-hi))]" />
                </div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--foreground))]/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div
                className={`text-4xl md:text-5xl leading-none text-[hsl(var(--gold-hi))] ${
                  isAr ? 'font-arabic font-bold' : 'font-display font-bold'
                }`}
              >
                <CountUp to={s.value} suffix={s.suffix} />
              </div>

              <div
                className={`mt-3 text-sm md:text-base text-[hsl(var(--foreground))] ${
                  isAr ? 'font-arabic font-semibold' : 'font-semibold'
                }`}
              >
                {s.label}
              </div>
              <div className={`mt-1 text-xs text-[hsl(var(--foreground))]/55 ${isAr ? 'font-arabic' : ''}`}>
                {s.hint}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
