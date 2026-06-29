import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, Flame, Leaf, Wind, Globe2, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trademarks } from '@/data/trademarks';

const AUTOPLAY_MS = 6000;

export function BrandHero() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: 1 | -1) => {
    setActive((a) => (a + dir + trademarks.length) % trademarks.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % trademarks.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(isAr ? -1 : 1);
      if (e.key === 'ArrowLeft') go(isAr ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, isAr]);

  const current = trademarks[active];

  const badges = isAr
    ? [
        { i: ShieldCheck, t: 'علامة سعودية' },
        { i: Award, t: 'جودة فاخرة' },
        { i: Flame, t: 'احتراق طويل' },
        { i: Wind, t: 'رماد منخفض' },
        { i: Leaf, t: 'مواد طبيعية' },
        { i: Globe2, t: 'جاهز للتصدير' },
      ]
    : [
        { i: ShieldCheck, t: 'Saudi Brand' },
        { i: Award, t: 'Premium Quality' },
        { i: Flame, t: 'Long Burning' },
        { i: Wind, t: 'Low Ash' },
        { i: Leaf, t: 'Natural Materials' },
        { i: Globe2, t: 'Export Ready' },
      ];

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 600px at 85% 0%, rgba(255,232,170,0.55), transparent 60%), radial-gradient(900px 500px at 10% 100%, rgba(26,74,0,0.10), transparent 60%), linear-gradient(180deg, #FBF8F1 0%, #F5EFE0 100%)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Palm leaf shadows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27400%27><g fill=%27none%27 stroke=%27%231A4A00%27 stroke-width=%270.6%27><path d=%27M50 350 Q200 100 380 30%27/><path d=%27M60 350 Q170 200 220 80%27/><path d=%27M50 350 Q260 220 380 200%27/></g></svg>")', backgroundSize: '600px 600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right' }}
      />

      {/* Dust particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[hsl(var(--gold))]/40"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="relative container pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col items-center text-center">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <span className="text-[11px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
              {isAr ? 'مجموعة علامات سعودية' : 'Saudi Brand Collection'}
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[hsl(var(--gold))]" />
          </div>
          <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}
              style={{ color: '#1A4A00', letterSpacing: isAr ? '0' : '-0.02em' }}>
            {isAr ? 'شركة فحم النخلة' : 'Palm Charcoal Company'}
          </h1>
          <p className={`mt-5 max-w-3xl mx-auto text-sm md:text-base leading-relaxed text-foreground/75 px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? 'مجموعة علامات تجارية سعودية رائدة في إنتاج الفحم الطبيعي عالي الجودة، تقدم حلولاً احترافية للمعسل والبخور والشواء والتوريد التجاري والتصدير.'
              : 'A leading family of registered Saudi trademarks producing premium natural charcoal — for hookah, incense, grilling, wholesale and export.'}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative w-full max-w-6xl mt-10 md:mt-14" style={{ perspective: '1600px' }}>
          <div className="relative h-[230px] sm:h-[280px] md:h-[320px]">
            {trademarks.map((c, i) => {
              const total = trademarks.length;
              let offset = i - active;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;
              const isCenter = offset === 0;
              const abs = Math.abs(offset);
              return (
                <motion.button
                  key={c.id}
                  onClick={() => setActive(i)}
                  aria-label={c.nameAr}
                  className="absolute top-1/2 left-1/2 rounded-[28px] bg-white border border-white/80 flex items-center justify-center p-4 md:p-6 focus:outline-none"
                  animate={{
                    x: `calc(-50% + ${offset * 22}%)`,
                    y: '-50%',
                    scale: isCenter ? 1 : 0.72 - abs * 0.04,
                    rotateY: offset * -18,
                    zIndex: 50 - abs,
                    boxShadow: isCenter
                      ? '0 30px 80px -20px rgba(201,168,76,0.55), 0 0 0 1px rgba(201,168,76,0.5)'
                      : '0 14px 36px -16px rgba(0,0,0,0.25)',
                    filter: isCenter ? 'none' : 'saturate(0.85) brightness(0.98)',
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  style={{ width: 'clamp(150px, 22vw, 240px)', height: 'clamp(150px, 22vw, 240px)' }}
                >
                  {isCenter && (
                    <span aria-hidden className="absolute inset-0 rounded-[28px] pointer-events-none"
                      style={{ boxShadow: '0 0 60px 8px rgba(232,185,35,0.25) inset' }} />
                  )}
                  <img src={c.image} alt={c.nameAr} className="max-w-full max-h-full object-contain" />
                </motion.button>
              );
            })}
          </div>

          {/* Arrows */}
          <button onClick={() => go(-1)} aria-label="Previous"
            className="absolute top-1/2 -translate-y-1/2 start-0 md:-start-6 z-[60] w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-[hsl(var(--gold))]/30 shadow-lg flex items-center justify-center text-[hsl(var(--gold-hi))] hover:bg-white hover:scale-105 transition">
            {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button onClick={() => go(1)} aria-label="Next"
            className="absolute top-1/2 -translate-y-1/2 end-0 md:-end-6 z-[60] w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-[hsl(var(--gold))]/30 shadow-lg flex items-center justify-center text-[hsl(var(--gold-hi))] hover:bg-white hover:scale-105 transition">
            {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-6">
          {trademarks.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Brand ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-8 bg-[hsl(var(--gold-hi))]' : 'w-2 bg-foreground/20 hover:bg-foreground/40'}`} />
          ))}
        </div>

        {/* Brand details panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.55 }}
            className="mt-10 w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl px-6 md:px-8 py-5 md:py-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]"
          >
            <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold-hi))] font-arabic mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAr ? 'علامة تجارية سعودية مسجّلة' : 'Registered Saudi Trademark'}
            </div>
            <h3 className={`text-xl md:text-2xl font-arabic font-bold`} style={{ color: '#1A4A00' }}>{current.nameAr}</h3>
            <div className="text-xs text-foreground/55 mt-0.5">{current.nameEn}</div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] md:text-xs font-arabic">
              <Meta label={isAr ? 'رقم العلامة' : 'Reg No.'} value={current.registrationNo} />
              <Meta label={isAr ? 'الفئة' : 'Class'} value={current.niceClass.replace('الفئة ', '')} />
              <Meta label={isAr ? 'تاريخ التسجيل' : 'Filed'} value={current.filedHijri} />
              <Meta label={isAr ? 'النشاط' : 'Activity'} value={current.goodsAr.split('،')[0]} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-3xl">
          {badges.map((b, i) => (
            <motion.div key={i} whileHover={{ y: -2, scale: 1.04 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-[hsl(var(--gold))]/25 rounded-full px-3.5 py-1.5 text-[11px] md:text-xs font-arabic text-foreground/80 shadow-sm">
              <b.i className="w-3.5 h-3.5 text-[hsl(var(--gold-hi))]" />
              {b.t}
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <CTA to="/products" primary>{isAr ? 'استكشف المنتجات' : 'Explore Products'}</CTA>
          <CTA to="/trademarks">{isAr ? 'علاماتنا' : 'Our Brands'}</CTA>
          <CTA to="/products">{isAr ? 'تحميل الكتالوج' : 'Download Catalogue'}</CTA>
          <CTA to="/contact">{isAr ? 'تواصل المبيعات' : 'Contact Sales'}</CTA>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--gold-hi))]">{label}</span>
      <span className="text-foreground/85 font-medium mt-0.5 text-center">{value}</span>
    </div>
  );
}

function CTA({ to, children, primary }: { to: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 px-5 md:px-6 py-3 rounded-full text-sm font-arabic font-medium transition-all hover:-translate-y-0.5 ${
        primary
          ? 'bg-[#1A4A00] text-white shadow-[0_12px_30px_-12px_rgba(26,74,0,0.6)] hover:shadow-[0_18px_40px_-12px_rgba(26,74,0,0.7)]'
          : 'bg-white/80 backdrop-blur border border-[hsl(var(--gold))]/30 text-foreground/85 hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold-hi))]'
      }`}
    >
      {children}
    </Link>
  );
}
