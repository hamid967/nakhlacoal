import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Leaf,
  Flame,
  Wind,
  ShieldCheck,
  Award,
  Sparkles,
  Globe2,
  Download,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { trademarks } from '@/data/trademarks';

const AUTO_MS = 5000;

export function BrandShowcaseHero() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = trademarks.length;
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-driven parallax + hero scale down
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const cardSpread = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const go = useCallback((n: number) => setActive(((n % count) + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % count), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  const current = trademarks[active];

  const features = [
    { icon: Leaf, t: isAr ? '١٠٠٪ طبيعي' : '100% Natural' },
    { icon: Flame, t: isAr ? 'حرارة ثابتة' : 'Stable Heat' },
    { icon: Wind, t: isAr ? 'رماد منخفض' : 'Low Ash' },
    { icon: ShieldCheck, t: isAr ? 'كربون عالي' : 'High Carbon' },
    { icon: Sparkles, t: isAr ? 'احتراق أطول' : 'Long Burning' },
    { icon: Award, t: isAr ? 'جودة سعودية' : 'Saudi Quality' },
    { icon: Globe2, t: isAr ? 'جاهز للتصدير' : 'Export Ready' },
  ];

  return (
    <section
      ref={sectionRef}
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative overflow-hidden pt-32 md:pt-36 pb-20 md:pb-28"
      style={{ background: '#F8F5EE' }}
    >
      {/* Floating palm leaves + glow (parallax + lazy mount) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ y: prefersReducedMotion ? 0 : bgY, willChange: 'transform' }}
      >
        <FloatingBackdrop reduced={!!prefersReducedMotion} />
      </motion.div>

      <motion.div
        className="container relative z-10"
        style={{
          scale: prefersReducedMotion ? 1 : heroScale,
          opacity: prefersReducedMotion ? 1 : heroOpacity,
          y: prefersReducedMotion ? 0 : heroY,
          willChange: 'transform, opacity',
        }}
      >
        {/* Title block */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#D4AF37]/30 shadow-[0_4px_24px_-12px_rgba(26,74,0,0.25)] mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#1A4A00] font-medium">
              {isAr ? 'علامات سعودية مسجلة' : 'Registered Saudi Brands'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-arabic font-bold text-[#0D2818] leading-[1.1] text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {isAr ? 'شركة فحم النخلة' : 'Palm Charcoal Company'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="font-arabic text-base md:text-lg text-[#3A4A3F] leading-relaxed mt-6 max-w-2xl mx-auto"
          >
            {isAr
              ? 'مجموعة علامات تجارية سعودية متخصصة في إنتاج الفحم الطبيعي عالي الجودة، تقدم حلولاً احترافية للمعسل والبخور والشواء والأسواق التجارية والتصدير.'
              : 'A family of Saudi registered trademarks producing premium natural charcoal for hookah, incense, BBQ, retail and export.'}
          </motion.p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative h-[320px] sm:h-[360px] md:h-[420px] flex items-center justify-center">
            {trademarks.map((t, i) => {
              // signed offset (handle wrap)
              let off = i - active;
              if (off > count / 2) off -= count;
              if (off < -count / 2) off += count;

              const abs = Math.abs(off);
              const visible = abs <= 2;
              const isActive = off === 0;
              const dirSign = isAr ? -1 : 1;
              const x = off * 180 * dirSign;
              const scale = isActive ? 1 : abs === 1 ? 0.78 : 0.6;
              const opacity = isActive ? 1 : abs === 1 ? 0.55 : 0.22;
              const blur = isActive ? 0 : abs === 1 ? 1 : 3;
              const z = 50 - abs;

              return (
                <motion.button
                  key={t.id}
                  onClick={() => go(i)}
                  aria-label={t.nameAr}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  animate={{
                    x,
                    scale,
                    opacity: visible ? opacity : 0,
                    filter: `blur(${blur}px)`,
                    zIndex: z,
                  }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  style={{ pointerEvents: visible ? 'auto' : 'none' }}
                >
                  <div
                    className={`relative w-[220px] sm:w-[260px] md:w-[300px] aspect-square rounded-[2rem] bg-white border transition-shadow duration-500 ${
                      isActive
                        ? 'border-[#D4AF37]/70 shadow-[0_30px_80px_-30px_rgba(26,74,0,0.35),0_0_0_1px_rgba(212,175,55,0.4)]'
                        : 'border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.18)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute -inset-6 rounded-[2.5rem] -z-10"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0) 70%)',
                        }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <img
                        src={t.image}
                        alt={t.nameAr}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                      />
                    </div>
                    {isActive && (
                      <div className="absolute bottom-3 inset-x-0 text-center">
                        <span className="font-arabic text-[13px] font-semibold text-[#1A4A00]">
                          {t.nameAr}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Nav controls */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => go(active - 1)}
              className="w-11 h-11 rounded-full bg-white border border-black/5 shadow-md text-[#1A4A00] hover:border-[#D4AF37] transition-all hover:scale-105 flex items-center justify-center"
              aria-label="Previous"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
            <div className="flex gap-2">
              {trademarks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Brand ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === active ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-[#1A4A00]/20 hover:bg-[#1A4A00]/40'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(active + 1)}
              className="w-11 h-11 rounded-full bg-white border border-black/5 shadow-md text-[#1A4A00] hover:border-[#D4AF37] transition-all hover:scale-105 flex items-center justify-center"
              aria-label="Next"
            >
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Details panel */}
        <div className="mt-12 md:mt-16 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)', scale: 0.98 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)', scale: 0.99 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-[2rem] bg-white/80 backdrop-blur-xl border border-[#D4AF37]/20 shadow-[0_30px_80px_-40px_rgba(26,74,0,0.35)] p-6 md:p-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <div className="md:col-span-1">
                  <div className="text-[11px] tracking-[0.25em] uppercase text-[#D4AF37] font-medium mb-3">
                    {isAr ? 'العلامة النشطة' : 'Active Brand'}
                  </div>
                  <h3 className="font-arabic text-3xl md:text-4xl font-bold text-[#0D2818] leading-tight">
                    {current.nameAr}
                  </h3>
                  <div className="text-sm text-[#3A4A3F]/70 mt-1 tracking-wide">{current.nameEn}</div>
                  <p className="font-arabic text-sm text-[#3A4A3F] leading-relaxed mt-5">
                    {current.descriptionAr}
                  </p>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <DetailItem label={isAr ? 'رقم التسجيل' : 'Reg. No.'} value={current.registrationNo} />
                  <DetailItem label={isAr ? 'الفئة' : 'Class'} value={current.niceClass} />
                  <DetailItem label={isAr ? 'البلد' : 'Country'} value={current.countryAr} />
                  <DetailItem label={isAr ? 'تاريخ التسجيل' : 'Registered'} value={current.registeredHijri} />
                  <DetailItem label={isAr ? 'تاريخ الانتهاء' : 'Expires'} value={current.expiresHijri} />
                  <DetailItem label={isAr ? 'المنتجات' : 'Goods'} value={current.goodsAr} />
                  <div className="col-span-2 sm:col-span-3">
                    <DetailItem label={isAr ? 'المالك' : 'Owner'} value={current.ownerAr} />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feature strip */}
        <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white border border-black/5 px-3 py-4 text-center shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_40px_-20px_rgba(26,74,0,0.35)] hover:border-[#D4AF37]/40 transition-all"
            >
              <div className="mx-auto w-9 h-9 rounded-full bg-[#1A4A00]/8 text-[#1A4A00] flex items-center justify-center mb-2">
                <f.icon className="w-4 h-4" />
              </div>
              <div className="font-arabic text-xs md:text-[13px] font-semibold text-[#0D2818]">
                {f.t}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-4"
        >
          <Link
            to="/trademarks"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1A4A00] text-white font-arabic text-sm font-semibold shadow-[0_12px_30px_-12px_rgba(26,74,0,0.6)] hover:shadow-[0_18px_40px_-12px_rgba(26,74,0,0.7)] hover:-translate-y-0.5 transition-all"
          >
            {isAr ? 'استكشف العلامات التجارية' : 'Explore Brands'}
            <Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#1A4A00] border border-[#D4AF37]/40 font-arabic text-sm font-semibold shadow-md hover:border-[#D4AF37] hover:-translate-y-0.5 transition-all"
          >
            {isAr ? 'عرض المنتجات' : 'View Products'}
          </Link>
          <a
            href={`https://wa.me/966540060095?text=${encodeURIComponent(
              isAr ? 'مرحباً، أرغب باستلام كتالوج فحم النخلة الرسمي PDF.' : 'Hello, please share the official Palm Charcoal PDF catalog.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent text-[#0D2818] border border-[#0D2818]/15 font-arabic text-sm font-semibold hover:bg-[#0D2818]/5 hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4" />
            {isAr ? 'تحميل الكتالوج' : 'Download Catalog'}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-[#3A4A3F]/55 font-medium mb-1.5">
        {label}
      </div>
      <div className="font-arabic text-sm font-semibold text-[#0D2818] leading-snug">{value}</div>
    </div>
  );
}

function FloatingBackdrop() {
  // soft gradients + floating palm leaf SVGs
  const leaves = [
    { top: '8%', left: '4%', size: 180, rot: -20, dur: 18, delay: 0 },
    { top: '14%', right: '6%', size: 220, rot: 30, dur: 22, delay: 1 },
    { bottom: '10%', left: '8%', size: 160, rot: 45, dur: 20, delay: 2 },
    { bottom: '16%', right: '10%', size: 200, rot: -35, dur: 24, delay: 0.5 },
  ];
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(26,74,0,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 0%, rgba(212,175,55,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.06) 0%, transparent 55%)',
        }}
      />
      {leaves.map((l, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: (l as any).top,
            bottom: (l as any).bottom,
            left: (l as any).left,
            right: (l as any).right,
            width: l.size,
            height: l.size,
            opacity: 0.12,
          }}
          initial={{ rotate: l.rot, y: 0 }}
          animate={{ rotate: [l.rot, l.rot + 6, l.rot], y: [0, -14, 0] }}
          transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PalmLeafSvg />
        </motion.div>
      ))}
      {/* Light particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={`p-${i}`}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            background:
              'radial-gradient(circle, rgba(212,175,55,0.55) 0%, rgba(212,175,55,0) 70%)',
          }}
          animate={{ y: [0, -20, 0], opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 6 + (i % 5), delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}

function PalmLeafSvg() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <g stroke="#1A4A00" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M100 190 C 100 140, 100 80, 100 20" />
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 30 + i * 18;
          const len = 70 - i * 4;
          return (
            <g key={i}>
              <path d={`M100 ${y} C ${100 - len * 0.4} ${y - 10}, ${100 - len} ${y - 24}, ${100 - len} ${y - 30}`} />
              <path d={`M100 ${y} C ${100 + len * 0.4} ${y - 10}, ${100 + len} ${y - 24}, ${100 + len} ${y - 30}`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
