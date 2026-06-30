import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Flame, Leaf, Award, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trademarks } from '@/data/trademarks';
const Trademarks3D = lazy(() => import('./Trademarks3D'));
import { Trademarks3DSkeleton } from './Trademarks3DSkeleton';
import { hasWebGL } from '@/lib/hasWebGL';
import { WebGLBoundary } from './WebGLBoundary';

const AUTOPLAY_MS = 5500;

/**
 * Cinematic Hero — matches the Palm Charcoal premium home mockup:
 * left editorial title + CTA, right floating glass product cards on a stone
 * podium with a gold "Certified" seal on the centered card, and a feature
 * strip pinned at the bottom. Background = warm ivory + soft palm shadow.
 */
export function BrandHero() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Bump this to restart the autoplay timer (used after any manual interaction
  // so the next auto-advance gives the user a full window to read the slide).
  const [autoplayTick, setAutoplayTick] = useState(0);

  const go = useCallback((dir: 1 | -1) => {
    setActive((a) => (a + dir + trademarks.length) % trademarks.length);
    setAutoplayTick((t) => t + 1);
  }, []);

  const jumpTo = useCallback((i: number) => {
    setActive(i);
    setAutoplayTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % trademarks.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, autoplayTick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(isAr ? -1 : 1);
      if (e.key === 'ArrowLeft') go(isAr ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, isAr]);

  const current = trademarks[active];

  const features = isAr
    ? [
        { i: Leaf, t: '١٠٠٪ طبيعي', s: 'بدون إضافات' },
        { i: Flame, t: 'حرارة عالية', s: 'احتراق طويل' },
        { i: ShieldCheck, t: 'صديق للبيئة', s: 'مستدام' },
        { i: Award, t: 'جودة فاخرة', s: 'ثابتة' },
      ]
    : [
        { i: Leaf, t: '100% Natural', s: 'No Additives' },
        { i: Flame, t: 'High Heat', s: 'Long Burning' },
        { i: ShieldCheck, t: 'Eco-Friendly', s: 'Sustainable' },
        { i: Award, t: 'Premium Quality', s: 'Consistent' },
      ];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.7, 0]);
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

  // Card layout — 4 cards, the active is centered/large, others fan out.
  

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ivory + warm gold bg */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: bgOpacity,
          background:
            'radial-gradient(900px 600px at 85% 15%, hsl(var(--gold-hi) / 0.35), transparent 60%), radial-gradient(700px 500px at 10% 90%, hsl(var(--primary) / 0.08), transparent 65%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--surface-2)) 100%)',
        }}
      />
      {/* Palm leaf shadow top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -start-20 w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] opacity-[0.18]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><g fill='none' stroke='%231A4A00' stroke-width='1.2' stroke-linecap='round'><path d='M40 380 Q160 160 380 40'/><path d='M40 380 Q120 240 200 100'/><path d='M40 380 Q220 280 380 220'/><path d='M40 380 Q100 280 150 200'/><path d='M40 380 Q260 200 380 100'/></g></svg>\")",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dust particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[hsl(var(--gold))]/35"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative container pt-24 md:pt-28 pb-32 md:pb-40 flex flex-col items-center gap-10 md:gap-14"
      >
        {/* Centered editorial title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
              {isAr ? 'علامات سعودية فاخرة' : 'Premium Saudi Brand'}
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[hsl(var(--gold))]" />
          </div>
          <h1
            className={`text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-foreground ${
              isAr ? 'font-arabic font-bold' : 'font-display font-bold'
            }`}
          >
            {isAr ? (
              <>شركة فحم النخلة<br /><span className="text-primary">الفاخر.</span></>
            ) : (
              <>Palm Charcoal<br /><span className="text-primary">Premium.</span></>
            )}
          </h1>
          <p
            className={`mt-6 mx-auto max-w-2xl text-base md:text-lg leading-relaxed text-foreground/70 ${isAr ? 'font-arabic' : ''}`}
          >
            {isAr
              ? 'مجموعة علامات تجارية سعودية مسجّلة بجودة عالية، نقدمها لكم بفخر من المملكة إلى العالم.'
              : 'A collection of registered Saudi premium brands — proudly delivered from the Kingdom to the world.'}
          </p>

          {/* Live availability badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-300 font-arabic">
            <span className="relative inline-flex w-2 h-2" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <span>{isAr ? 'متواجدون مباشرة الآن' : 'Live & available now'}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 justify-center">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[hsl(var(--gold-hi))] text-[hsl(var(--dark))] text-sm uppercase tracking-[0.2em] font-medium shadow-[var(--shadow-gold)] hover:shadow-[0_20px_44px_-12px_hsl(var(--gold)/0.85)] hover:-translate-y-0.5 transition-all"
            >
              {isAr ? 'استكشف المنتجات' : 'Explore Products'}
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </Link>
            <Link
              to="/trademarks"
              className="btn-glass inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-arabic"
            >
              {isAr ? 'علاماتنا' : 'Our Brands'}
            </Link>
          </div>
        </motion.div>


        {/* Eyebrow above the trademark slider */}
        <div className="text-center -mb-4 md:-mb-6">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
            {isAr ? '— علاماتنا —' : '— Our trademarks —'}
          </span>
        </div>

        {/* Full-width prominent trademarks slider (replaces the previous small side cluster) */}
        <div
          className="w-full max-w-5xl relative h-[420px] sm:h-[500px] md:h-[580px] rounded-3xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--background))]/40 backdrop-blur-sm shadow-[0_30px_80px_-30px_hsl(var(--gold)/0.35)]"
          style={{ perspective: '1800px', contain: 'layout paint size', aspectRatio: '16 / 10' }}
          role="region"
          aria-roledescription={isAr ? 'دائرة عرض' : 'carousel'}
          aria-label={isAr ? 'علاماتنا التجارية' : 'Our trademarks'}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); go(isAr ? -1 : 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); go(isAr ? 1 : -1); }
            else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
            else if (e.key === 'End') { e.preventDefault(); setActive(trademarks.length - 1); }
          }}
        >
          {/* Stone podium */}
          <div
            aria-hidden
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[78%] h-12 rounded-[50%]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(120,98,72,0.35) 0%, rgba(120,98,72,0.12) 55%, transparent 75%)',
              filter: 'blur(6px)',
            }}
          />

          {/* WebGL 3D trademarks carousel — falls back to a static skeleton when WebGL is unavailable */}
          {hasWebGL() ? (
            <WebGLBoundary fallback={<Trademarks3DSkeleton className="absolute inset-0" />}>
              <Suspense fallback={<Trademarks3DSkeleton className="absolute inset-0" />}>
                <Trademarks3D
                  items={trademarks}
                  active={active}
                  onChange={setActive}
                  className="absolute inset-0"
                />
              </Suspense>
            </WebGLBoundary>
          ) : (
            <Trademarks3DSkeleton className="absolute inset-0" />
          )}

          {/* Accessible focusable layer for each card (WebGL has no DOM nodes) */}
          <ul
            className="absolute inset-0 z-[55] flex items-center justify-center gap-2 pointer-events-none"
            aria-label={isAr ? 'بطاقات العلامات' : 'Trademark cards'}
          >
            {trademarks.map((t, i) => (
              <li key={t.id} className="pointer-events-auto">
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-current={i === active ? 'true' : undefined}
                  aria-label={isAr ? `${t.nameAr} — علامة ${i + 1} من ${trademarks.length}` : `${t.nameEn} — brand ${i + 1} of ${trademarks.length}`}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => jumpTo(i)}
                  onFocus={() => jumpTo(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                      e.preventDefault();
                      jumpTo(i);
                    }
                  }}
                  className={`block rounded-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-hi))] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    i === active ? 'w-[140px] h-[200px]' : 'w-[110px] h-[160px] opacity-0'
                  }`}
                  style={{ background: 'transparent' }}
                />
              </li>
            ))}
          </ul>

          {/* Prev / Next arrows */}
          <button
            type="button"
            aria-label={isAr ? 'السابق' : 'Previous'}
            onClick={() => go(isAr ? 1 : -1)}
            className="absolute start-3 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 rounded-full flex items-center justify-center bg-[hsl(var(--background))]/70 backdrop-blur border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold-hi))] hover:bg-[hsl(var(--background))]/90 hover:scale-105 transition-all shadow-[0_8px_24px_-12px_hsl(var(--gold)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-hi))]"
          >
            <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            aria-label={isAr ? 'التالي' : 'Next'}
            onClick={() => go(isAr ? -1 : 1)}
            className="absolute end-3 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 rounded-full flex items-center justify-center bg-[hsl(var(--background))]/70 backdrop-blur border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold-hi))] hover:bg-[hsl(var(--background))]/90 hover:scale-105 transition-all shadow-[0_8px_24px_-12px_hsl(var(--gold)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-hi))]"
          >
            <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          {/* Play / Pause toggle */}
          <button
            type="button"
            aria-label={paused ? (isAr ? 'تشغيل' : 'Play') : (isAr ? 'إيقاف مؤقت' : 'Pause')}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="absolute top-3 end-3 z-[60] w-9 h-9 rounded-full flex items-center justify-center bg-[hsl(var(--background))]/70 backdrop-blur border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold-hi))] hover:bg-[hsl(var(--background))]/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-hi))]"
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>


          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {isAr
              ? `العلامة النشطة: ${current.nameAr} — ${active + 1} من ${trademarks.length}`
              : `Active brand: ${current.nameEn} — ${active + 1} of ${trademarks.length}`}
          </div>

          {/* Dots — tablist */}
          <div
            role="tablist"
            aria-label={isAr ? 'تنقّل بين العلامات' : 'Trademark navigation'}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[60]"
          >
            {trademarks.map((t, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={isAr ? `${t.nameAr}` : `${t.nameEn}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => jumpTo(i)}
                className={`h-1.5 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold-hi))] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  i === active ? 'w-8 bg-[hsl(var(--gold-hi))]' : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                }`}
              />
            ))}
          </div>


          {/* Floating brand name — fixed-height reservation prevents CLS on slide change */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center h-7 md:h-8 w-[min(90%,640px)] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
              >
                <div className={`text-base md:text-lg leading-7 md:leading-8 text-primary ${isAr ? 'font-arabic font-bold' : 'font-display font-semibold'}`}>
                  {current.nameAr} <span className="text-foreground/40 mx-2">·</span> <span className="text-foreground/60 font-normal text-sm">{current.nameEn}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>


      {/* Feature strip pinned to hero bottom */}
      <div className="absolute bottom-0 inset-x-0 pb-6 md:pb-8 z-[5]">
        <div className="container">
          <div className="rounded-2xl glass-strip grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2 px-4 md:px-8 py-4">
            {features.map((f, i) => (
              <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'md:border-s md:border-[hsl(var(--gold))]/15 md:ps-6' : ''}`}>
                <f.i className="w-5 h-5 text-[hsl(var(--gold-hi))] shrink-0" />
                <div className="leading-tight">
                  <div className={`text-xs md:text-sm font-medium text-foreground ${isAr ? 'font-arabic' : ''}`}>{f.t}</div>
                  <div className={`text-[10px] md:text-xs text-foreground/55 ${isAr ? 'font-arabic' : ''}`}>{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
