import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, Sparkles, Trophy, Medal, Crown, Star } from 'lucide-react';

const AWARDS = [
  { Icon: Trophy, ar: 'أفضل مصدّر فحم 2025', en: 'Best Charcoal Exporter 2025' },
  { Icon: Crown, ar: 'جائزة الجودة السعودية', en: 'Saudi Quality Award' },
  { Icon: Medal, ar: 'المركز الأول للتصدير الخليجي', en: 'GCC Export Leader' },
  { Icon: Star, ar: 'شريك موثوق - غرفة جدة', en: 'Trusted Partner — Jeddah Chamber' },
  { Icon: Award, ar: 'شهادة تميّز التوريد', en: 'Supply Excellence Award' },
  { Icon: Sparkles, ar: 'ابتكار الاستدامة 2024', en: 'Sustainability Innovation 2024' },
];

export function AwardsRibbon() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const row = [...AWARDS, ...AWARDS];

  return (
    <section className="relative z-0 isolate py-16 md:py-20 bg-[#0B0B0B] overflow-hidden">
      {/* Ribbon glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-[linear-gradient(90deg,transparent,hsl(46_72%_62%/0.10),transparent)] pointer-events-none" />

      <div className="container mb-8 text-center">
        <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 font-arabic">
          {isAr ? 'شريط الجوائز' : 'Awards & Recognition'}
        </span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 start-0 w-16 md:w-32 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-16 md:w-32 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10" />
        <motion.ul
          className="flex gap-4 md:gap-6 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
          aria-label={isAr ? 'الجوائز والاعتمادات' : 'Awards ribbon'}
        >
          {row.map(({ Icon, ar, en }, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-full border border-[hsl(var(--gold))]/25 bg-black/40 px-5 py-3 text-white/80 hover:border-[hsl(var(--gold))]/60 hover:text-white transition-colors"
            >
              <Icon
                className="w-4 h-4 text-[hsl(var(--gold-hi,46_95%_78%))] shrink-0"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className={`text-xs md:text-sm whitespace-nowrap ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? ar : en}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
