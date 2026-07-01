import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hash, Tag, Calendar, CalendarOff, User, Package, FileText, Pencil } from 'lucide-react';
import { useTrademarks } from '@/hooks/useTrademarks';
import { Flame, Clock, Sun, Leaf, Globe2 } from 'lucide-react';
import { useDir, SectionHeader } from '@/components/ui-lux';
import { useAuth } from '@/contexts/AuthContext';
import { QuickEditTrademarkDialog } from '@/components/QuickEditTrademarkDialog';

// Unified motion tokens — one easing, one duration, GPU-friendly transforms only.
const EASE = [0.22, 1, 0.36, 1] as const; // easeOutExpo-ish, smooth on low-end CPUs
const DURATION = 0.35;
const SLIDE_TRANSITION: Transition = { duration: DURATION, ease: EASE };

/**
 * Coverflow-style 3D trademarks slider (CSS transforms only — no WebGL).
 * Center card is large with gold border; side cards tilt and fade.
 */
export function TrademarksShowcase() {
  const { isAr } = useDir();
  const prefersReduced = useReducedMotion();
  const { roles } = useAuth();
  const canEdit = roles.includes('admin') || roles.includes('super_admin');
  const [editOpen, setEditOpen] = useState(false);
  const { trademarks, loading, syncing, status, error } = useTrademarks();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = trademarks.length;


  const go = useCallback((dir: 1 | -1) => {
    setActive((a) => (a + dir + total) % total);
  }, [total]);

  // Auto-rotate (pauses on hover/focus and when the user prefers reduced motion)
  useEffect(() => {
    if (paused || total < 2) return;
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mql?.matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % total), 5500);
    return () => window.clearInterval(id);
  }, [total, paused]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(isAr ? -1 : 1);
      if (e.key === 'ArrowLeft') go(isAr ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, isAr]);

  const current = trademarks[Math.min(active, total - 1)] ?? trademarks[0];
  if (!current) return null;


  const features = [
    { icon: Leaf, title: isAr ? 'جودة طبيعية' : 'Natural Quality', desc: isAr ? '100% مواد طبيعية' : '100% natural' },
    { icon: Flame, title: isAr ? 'احتراق طويل' : 'Long Burn', desc: isAr ? 'يدوم وقتاً أطول' : 'Lasts longer' },
    { icon: Sun, title: isAr ? 'حرارة مستقرة' : 'Stable Heat', desc: isAr ? 'أداء ثابت ومتوازن' : 'Balanced output' },
    { icon: Globe2, title: isAr ? 'رماد منخفض' : 'Low Ash', desc: isAr ? 'نقاء وجودة أعلى' : 'Higher purity' },
    { icon: Clock, title: isAr ? 'صديقة للبيئة' : 'Eco-friendly', desc: isAr ? 'منتج مستدام' : 'Sustainable' },
  ];

  return (
    <section
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative section overflow-hidden bg-cream/40"
      aria-labelledby="trademarks-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Soft palm-leaf wash background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_10%,hsl(var(--emerald))_0%,transparent_45%),radial-gradient(circle_at_80%_90%,hsl(var(--gold))_0%,transparent_50%)]" />

      <div className="container relative">
        {/* Editorial header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 border-y border-gold/30 mb-4">
            <span className="text-gold text-[11px] tracking-[0.28em] font-medium uppercase font-sans">
              {isAr ? 'تأسست 2010 — ملف 2060' : 'Est. 2010 — Dossier 2060'}
            </span>
          </div>
          <h2 id="trademarks-title" className="text-4xl md:text-5xl lg:text-6xl text-emerald font-bold font-arabic leading-tight">
            {isAr ? 'علاماتنا التجارية المسجلة' : 'Our Registered Trademarks'}
          </h2>
          <div className="w-24 h-px bg-gold mx-auto mt-5" />
        </div>

        {/* Live-sync status pill */}
        <div aria-live="polite" aria-busy={loading || syncing} className="flex justify-center mb-8 min-h-[24px]">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-[12px] text-foreground/80">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-gold/80 animate-pulse" />
              {isAr ? 'جاري تحميل العلامات…' : 'Loading trademarks…'}
            </span>
          ) : error ? (
            <span className="inline-flex items-center gap-2 text-[12px] text-foreground/75">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-foreground/50" />
              {isAr ? 'عرض النسخة المحفوظة' : 'Showing cached version'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-[12px] text-foreground/75">
              <span aria-hidden="true" className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-emerald-600 animate-pulse' : status === 'reconnecting' ? 'bg-amber-600 animate-pulse' : 'bg-foreground/50'}`} />
              {status === 'live' ? (isAr ? 'متزامن مباشرة' : 'Live sync') : status === 'reconnecting' ? (isAr ? 'إعادة الاتصال…' : 'Reconnecting…') : (isAr ? 'غير متصل' : 'Offline')}
              {syncing && (isAr ? ' • تحديث…' : ' • refreshing…')}
            </span>
          )}
        </div>

        {/* ================= Bento Grid ================= */}
        <div
          role="region"
          aria-roledescription={isAr ? 'شرائح متحركة' : 'carousel'}
          aria-label={isAr ? 'علاماتنا التجارية' : 'Our trademarks'}
        >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            id="trademarks-slide"
            role="group"
            aria-roledescription={isAr ? 'شريحة' : 'slide'}
            aria-label={`${isAr ? current.nameAr : current.nameEn} — ${active + 1} / ${total}`}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={SLIDE_TRANSITION}
            style={{ willChange: 'transform, opacity' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[160px]"
          >
            {/* Logo main card — 8×3 */}
            <div className="md:col-span-8 md:row-span-3 relative bg-background rounded-3xl border border-gold/25 shadow-xl shadow-emerald/5 flex flex-col items-center justify-center p-8 overflow-hidden group">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)/0.06),transparent_60%)]" />
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={isAr ? 'العلامة السابقة' : 'Previous trademark'}
                aria-controls="trademarks-slide"
                className="absolute start-4 top-1/2 -translate-y-1/2 z-20 min-w-11 min-h-11 w-11 h-11 rounded-full bg-cream border border-gold/50 hover:border-gold hover:bg-gold/15 transition flex items-center justify-center text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronLeft aria-hidden="true" className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={isAr ? 'العلامة التالية' : 'Next trademark'}
                aria-controls="trademarks-slide"
                className="absolute end-4 top-1/2 -translate-y-1/2 z-20 min-w-11 min-h-11 w-11 h-11 rounded-full bg-cream border border-gold/50 hover:border-gold hover:bg-gold/15 transition flex items-center justify-center text-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronRight aria-hidden="true" className="w-5 h-5" />
              </button>
              <img
                src={current.image}
                alt={isAr ? current.nameAr : current.nameEn}
                loading="lazy"
                draggable={false}
                className="max-h-[220px] w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="text-center mt-5">
                <h3 className="text-2xl md:text-3xl text-emerald font-bold font-arabic">{current.nameAr}</h3>
                <p className="text-gold text-sm md:text-base tracking-[0.28em] mt-1 font-serif uppercase">{current.nameEn}</p>
              </div>
            </div>

            {/* Registration — 4×1 */}
            <div className="md:col-span-4 md:row-span-1 bg-emerald rounded-3xl p-6 flex flex-col justify-between text-cream">
              <div className="flex justify-between items-start">
                <span className="text-gold text-[11px] font-medium uppercase tracking-widest">{isAr ? 'رقم التسجيل' : 'Registration No.'}</span>
                <Hash className="w-4 h-4 text-gold" />
              </div>
              <div className="text-2xl font-bold tracking-wider font-mono">#{current.registrationNo}</div>
            </div>

            {/* Tagline — 4×2 */}
            <div className="md:col-span-4 md:row-span-2 bg-[hsl(var(--gold)/0.08)] border border-gold/15 rounded-3xl p-7 flex flex-col justify-center">
              <p className="text-emerald text-lg leading-relaxed font-arabic">
                {isAr
                  ? 'مجموعة علامات تجارية سعودية بجودة عالية، نقدمها لكم بفخر من المملكة إلى العالم.'
                  : 'A registered Saudi trademark family — proudly crafted and delivered worldwide.'}
              </p>
              <span className="text-gold italic text-sm mt-3 font-serif">
                {isAr ? 'إرث سعودي، تميّز عالمي.' : 'Excellence rooted in tradition.'}
              </span>
            </div>

            {/* Class / activity — 6×1 */}
            <div className="md:col-span-6 md:row-span-1 bg-background border border-gold/15 border-s-4 border-s-gold rounded-3xl p-6 flex items-center gap-5">
              <div className="text-3xl md:text-4xl font-bold text-emerald font-serif shrink-0">
                {current.niceClass}
              </div>
              <div className="w-px self-stretch bg-gold/25" />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-widest text-gold">{isAr ? 'النشاط' : 'Activity'}</div>
                <div className="text-emerald font-medium font-arabic truncate">{current.goodsAr}</div>
              </div>
            </div>

            {/* Meta — 6×1 */}
            <div className="md:col-span-6 md:row-span-1 bg-emerald rounded-3xl p-6 grid grid-cols-3 items-center text-cream">
              <MetaCol label={isAr ? 'المنشأ' : 'Origin'} value={isAr ? 'المملكة' : 'KSA'} />
              <div className="justify-self-center w-px h-8 bg-cream/15" />
              <MetaCol label={isAr ? 'الحالة' : 'Status'} value={isAr ? 'موثّقة' : 'Verified'} mono />
              <MetaCol label={isAr ? 'ينتهي' : 'Expires'} value={current.expiresHijri} />
              <div className="justify-self-center w-px h-8 bg-cream/15" />
              <MetaCol label={isAr ? 'المالك' : 'Owner'} value={current.ownerAr} />
            </div>
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Notes strip */}
        <div className="mt-6 max-w-4xl mx-auto flex items-start gap-3 text-sm text-foreground/85 bg-background/80 border border-gold/25 rounded-2xl p-4">
          <FileText aria-hidden="true" className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <p className="leading-relaxed font-arabic">
            <span className="text-gold font-semibold me-2">{isAr ? 'ملاحظات:' : 'Notes:'}</span>
            {current.descriptionAr}
          </p>
        </div>

        {/* Trademark dots */}
        <div role="tablist" aria-label={isAr ? 'اختيار العلامة التجارية' : 'Select trademark'} className="flex justify-center gap-1.5 mt-8">
          {trademarks.map((t, i) => (
            <button
              key={t.id ?? i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls="trademarks-slide"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              aria-label={`${isAr ? t.nameAr : t.nameEn} (${i + 1} ${isAr ? 'من' : 'of'} ${trademarks.length})`}
              className="inline-flex items-center justify-center h-11 w-11 group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-all ${i === active ? 'w-8 bg-gold' : 'w-2 bg-gold/50 group-hover:bg-gold/80'}`}
              />
            </button>
          ))}
        </div>

        {/* Feature chips */}
        <ul className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 list-none p-0">
          {features.map((f, i) => (
            <li key={i} className="bg-background border border-gold/25 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-gold/60 hover:-translate-y-0.5 transition-all">
              <span aria-hidden="true" className="w-9 h-9 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4" />
              </span>
              <div>
                <p className="font-arabic text-sm font-semibold text-emerald leading-tight">{f.title}</p>
                <p className="text-[12px] text-foreground/80 leading-tight mt-0.5">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Editorial footer tag */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 text-emerald/85">
            <span aria-hidden="true" className="w-8 h-px bg-gold/60" />
            <span className="text-[11px] uppercase tracking-[0.28em] font-medium">
              {isAr ? 'إرث سعودي أصيل' : 'Authentic Saudi Legacy'}
            </span>
            <span aria-hidden="true" className="w-8 h-px bg-gold/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaCol({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="text-center min-w-0">
      <div className="text-gold text-[11px] uppercase tracking-widest mb-1 font-semibold">{label}</div>
      <div className={`text-cream font-medium truncate ${mono ? 'font-mono text-xs tracking-wider uppercase' : 'font-arabic text-sm'}`}>{value}</div>
    </div>
  );
}

