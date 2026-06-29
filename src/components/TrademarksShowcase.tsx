import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hash, Tag, Calendar, CalendarOff, User, Package, FileText } from 'lucide-react';
import { useTrademarks } from '@/hooks/useTrademarks';
import { Flame, Clock, Sun, Leaf, Globe2 } from 'lucide-react';
import { useDir, SectionHeader } from '@/components/ui-lux';

/**
 * Coverflow-style 3D trademarks slider (CSS transforms only — no WebGL).
 * Center card is large with gold border; side cards tilt and fade.
 */
export function TrademarksShowcase() {
  const { isAr } = useDir();
  const { trademarks, loading } = useTrademarks();
  const [active, setActive] = useState(0);
  const total = trademarks.length;


  const go = useCallback((dir: 1 | -1) => {
    setActive((a) => (a + dir + total) % total);
  }, [total]);

  // Auto-rotate
  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % total), 5500);
    return () => window.clearInterval(id);
  }, [total]);

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
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Soft palm-leaf wash background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_10%,hsl(var(--emerald))_0%,transparent_45%),radial-gradient(circle_at_80%_90%,hsl(var(--gold))_0%,transparent_50%)]" />

      <div className="container relative">
        <SectionHeader
          eyebrow={isAr ? 'علاماتنا التجارية' : 'Our Trademarks'}
          title={isAr ? 'شركة فحم النخلة' : 'Palm Charcoal Group'}
        />
        <p className="text-center max-w-2xl mx-auto -mt-4 mb-12 text-sm md:text-base text-foreground/70 font-arabic leading-relaxed">
          {isAr
            ? 'مجموعة علامات تجارية سعودية مسجلة بجودة عالية، نقدمها لكم بفخر من المملكة إلى العالم.'
            : 'A registered Saudi trademark family — proudly crafted and delivered worldwide.'}
        </p>

        {/* Coverflow stage */}
        <div className="relative" style={{ perspective: '1400px' }}>
          {/* Arrows */}
          <button
            onClick={() => go(-1)}
            aria-label="prev"
            className="absolute start-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full glass-card border border-gold/40 hover:border-gold hover:bg-gold/10 transition flex items-center justify-center text-gold"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="next"
            className="absolute end-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full glass-card border border-gold/40 hover:border-gold hover:bg-gold/10 transition flex items-center justify-center text-gold"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards */}
          <div className="relative h-[340px] md:h-[420px] flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            {trademarks.map((t, i) => {
              const raw = i - active;
              const half = total / 2;
              const off = raw > half ? raw - total : raw < -half ? raw + total : raw;
              const abs = Math.abs(off);
              if (abs > 2) return null;
              const isCenter = off === 0;
              const spread = window.innerWidth < 768 ? 110 : 220;
              const x = off * spread;
              const rotY = off * -22;
              const z = -abs * 120;
              const scale = isCenter ? 1.15 : 0.85 - abs * 0.05;
              const opacity = isCenter ? 1 : 0.55 - abs * 0.15;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(i)}
                  aria-label={t.nameAr}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out focus:outline-none"
                  style={{
                    transform: `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`,
                    opacity,
                    zIndex: 20 - abs,
                  }}
                >
                  <div
                    className={`w-[200px] h-[280px] md:w-[280px] md:h-[360px] rounded-2xl flex items-center justify-center p-6 transition-all duration-500 ${
                      isCenter
                        ? 'bg-cream border-2 border-gold shadow-[0_30px_80px_-20px_rgba(180,138,59,0.45),0_0_0_1px_rgba(180,138,59,0.2)_inset]'
                        : 'bg-cream/85 border border-gold/25 shadow-xl'
                    }`}
                  >
                    <img
                      src={t.image}
                      alt={t.nameAr}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain drop-shadow-sm"
                      draggable={false}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {trademarks.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`go to ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-gold' : 'w-2 bg-gold/30 hover:bg-gold/60'}`}
              />
            ))}
          </div>
        </div>

        {/* Details card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mt-10 max-w-3xl mx-auto glass-card rounded-2xl border border-gold/25 p-6 md:p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 text-sm">
              <Field icon={Hash}     label={isAr ? 'رقم التسجيل'   : 'Reg. No.'}    value={current.registrationNo} mono />
              <Field icon={Tag}      label={isAr ? 'فئة العلامة'   : 'Class'}       value={current.niceClass} />
              <Field icon={Calendar} label={isAr ? 'تاريخ التسجيل' : 'Registered'}  value={current.registeredHijri} />
              <Field icon={CalendarOff} label={isAr ? 'تاريخ الانتهاء' : 'Expires'} value={current.expiresHijri} />
              <Field icon={User}     label={isAr ? 'المالك'        : 'Owner'}       value={current.ownerAr} />
              <Field icon={Package}  label={isAr ? 'النشاط'        : 'Activity'}    value={current.goodsAr} />
            </div>
            <div className="mt-5 pt-4 border-t border-gold/15">
              <div className="flex items-start gap-2 text-xs md:text-sm text-foreground/70">
                <FileText className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  <span className="text-gold/90 font-semibold me-2">{isAr ? 'ملاحظات:' : 'Notes:'}</span>
                  {current.descriptionAr}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feature chips */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass-card rounded-xl border border-gold/20 px-4 py-3 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4" />
              </span>
              <div className="text-right rtl:text-right">
                <p className="font-arabic text-sm font-semibold text-foreground leading-tight">{f.title}</p>
                <p className="text-[11px] text-foreground/60 leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, value, mono }: { icon: typeof Hash; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gold mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-foreground/55">{label}</div>
        <div className={`text-sm text-foreground ${mono ? 'font-mono text-gold' : ''} truncate`}>{value}</div>
      </div>
    </div>
  );
}
