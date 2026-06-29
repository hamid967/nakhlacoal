import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Flame, Leaf, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trademarks } from '@/data/trademarks';
const Trademarks3D = lazy(() => import('./Trademarks3D'));

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
  const slots = [-1.5, -0.5, 0.5, 1.5]; // visual order; offset from center

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
            'radial-gradient(900px 600px at 85% 15%, rgba(232,200,140,0.45), transparent 60%), radial-gradient(700px 500px at 10% 90%, rgba(26,74,0,0.08), transparent 65%), linear-gradient(180deg, #FAF5EB 0%, #F2E9D4 100%)',
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
        className="relative container pt-24 md:pt-28 pb-32 md:pb-40 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center"
      >
        {/* LEFT — editorial title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="lg:col-span-5 text-center lg:text-start"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
              {isAr ? 'علامات سعودية فاخرة' : 'Premium Saudi Brand'}
            </span>
          </div>
          <h1
            className={`text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight ${
              isAr ? 'font-arabic font-bold' : 'font-display font-bold'
            }`}
            style={{ color: '#1A1A1A' }}
          >
            {isAr ? (
              <>
                نقاء.<br />
                استدامة.<br />
                <span style={{ color: '#1A4A00' }}>تميّز.</span>
              </>
            ) : (
              <>
                Pure.<br />
                Sustainable.<br />
                <span style={{ color: '#1A4A00' }}>Excellence.</span>
              </>
            )}
          </h1>
          <p
            className={`mt-6 max-w-md mx-auto lg:mx-0 text-base leading-relaxed text-foreground/70 ${
              isAr ? 'font-arabic' : ''
            }`}
          >
            {isAr
              ? 'فحم النخلة الفاخر، مصنوع بعناية من أجود المصادر الطبيعية ليمنحك أداءً نقيًا ومستقبلًا أنظف.'
              : 'Premium coconut shell charcoal, meticulously crafted for purity, performance, and a better tomorrow.'}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[hsl(var(--gold-hi))] text-white text-sm uppercase tracking-[0.2em] font-medium shadow-[0_14px_36px_-12px_rgba(201,168,76,0.65)] hover:shadow-[0_20px_44px_-12px_rgba(201,168,76,0.85)] hover:-translate-y-0.5 transition-all"
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

        {/* RIGHT — floating glass cards on podium */}
        <div className="lg:col-span-7 relative h-[460px] sm:h-[520px] md:h-[560px]" style={{ perspective: '1800px' }}>
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
          <div
            aria-hidden
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] h-6 rounded-[50%] bg-gradient-to-t from-[#d9c9a8]/70 to-transparent"
          />

          {/* Cards */}
          {trademarks.slice(0, 4).map((c, i) => {
            const offset = slots[i] - (slots[active % 4] - 0); // shift so active sits at 0
            const isCenter = i === active % 4;
            const abs = Math.abs(offset);
            return (
              <motion.button
                key={c.id}
                onClick={() => setActive(i)}
                aria-label={c.nameAr}
                className="absolute top-1/2 left-1/2 rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]"
                animate={{
                  x: `calc(-50% + ${offset * 24}%)`,
                  y: `calc(-50% + ${isCenter ? -10 : abs * 14}px)`,
                  scale: isCenter ? 1 : 0.78 - (abs - 0.5) * 0.06,
                  rotateY: offset * -10,
                  zIndex: 50 - Math.round(abs * 10),
                }}
                transition={{ type: 'spring', stiffness: 110, damping: 20 }}
                style={{
                  width: isCenter ? 'clamp(190px,24vw,280px)' : 'clamp(140px,18vw,210px)',
                  height: isCenter ? 'clamp(260px,33vw,380px)' : 'clamp(200px,26vw,300px)',
                }}
              >
                {/* Glass panel */}
                <div
                  className="relative w-full h-full rounded-[28px] overflow-hidden glass-card flex flex-col items-center justify-between p-4 md:p-5"
                  style={{
                    boxShadow: isCenter
                      ? '0 40px 80px -28px rgba(60,40,10,0.35), 0 0 0 1px rgba(201,168,76,0.45)'
                      : '0 22px 50px -24px rgba(0,0,0,0.25)',
                  }}
                >
                  {/* Logo header */}
                  <div className="text-[9px] tracking-[0.3em] uppercase text-[hsl(var(--gold-hi))] font-arabic pt-1">
                    {c.nameEn}
                  </div>

                  {/* Image */}
                  <div className="flex-1 w-full flex items-center justify-center px-2">
                    <img src={c.image} alt={c.nameAr} className="max-w-full max-h-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.18)]" />
                  </div>

                  {/* Footer label */}
                  <div className="text-[10px] tracking-[0.2em] uppercase text-foreground/60 font-arabic pb-1">
                    {c.goodsAr.split('،')[0]}
                  </div>

                  {/* Inner glow on center */}
                  {isCenter && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[28px]"
                      style={{ boxShadow: '0 0 70px 10px rgba(232,185,35,0.22) inset' }}
                    />
                  )}

                  {/* Gold "certified" seal — only on center card */}
                  {isCenter && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 14 }}
                      className="absolute top-3 end-3 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-[8px] font-arabic text-white text-center leading-tight"
                      style={{
                        background:
                          'radial-gradient(circle at 30% 30%, #F4D67A, #C9A84C 60%, #8A6E2C 100%)',
                        boxShadow: '0 8px 18px -6px rgba(138,110,44,0.6), inset 0 0 0 2px rgba(255,255,255,0.5)',
                      }}
                    >
                      <BadgeCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}

          {/* Dots */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[60]">
            {trademarks.slice(0, 4).map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Brand ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active % 4 ? 'w-8 bg-[hsl(var(--gold-hi))]' : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                }`}
              />
            ))}
          </div>

          {/* Floating brand name */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center"
            >
              <div className={`text-base md:text-lg ${isAr ? 'font-arabic font-bold' : 'font-display font-semibold'}`} style={{ color: '#1A4A00' }}>
                {current.nameAr} <span className="text-foreground/40 mx-2">·</span> <span className="text-foreground/60 font-normal text-sm">{current.nameEn}</span>
              </div>
            </motion.div>
          </AnimatePresence>
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
