import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { LuxSection, SectionHeader } from './ui-lux';
import { ImageWatermark } from './ImageWatermark';
import { Picture } from './Picture';
import s1 from '@/assets/step-harvest.jpg?picture';
import s2 from '@/assets/step-carbonize.jpg?picture';
import s3 from '@/assets/step-grind.jpg?picture';
import s4 from '@/assets/step-press.jpg?picture';
import s5 from '@/assets/step-pack.jpg?picture';

export function ProcessSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const stripRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragState = useRef<{ active: boolean; startX: number; startScroll: number; moved: boolean }>({
    active: false, startX: 0, startScroll: 0, moved: false,
  });
  const [playing, setPlaying] = useState(true);
  const [dragging, setDragging] = useState(false);

  // Auto-scroll loop (smooth, GPU-friendly via rAF)
  useEffect(() => {
    if (!playing) return;
    const el = stripRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const speed = 0.35; // px per frame (~21px/s)
    const tick = () => {
      if (!stripRef.current) return;
      const node = stripRef.current;
      const max = node.scrollWidth - node.clientWidth;
      if (max <= 0) { rafRef.current = requestAnimationFrame(tick); return; }
      let next = node.scrollLeft + speed;
      if (next >= max - 0.5) next = 0;
      node.scrollLeft = next;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, dragging]);

  // Pointer drag-to-scroll
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el) return;
    dragState.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragState.current;
    if (!st.active || !stripRef.current) return;
    const dx = e.clientX - st.startX;
    if (Math.abs(dx) > 3) st.moved = true;
    stripRef.current.scrollLeft = st.startScroll - dx;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    try { stripRef.current?.releasePointerCapture(e.pointerId); } catch {}
    setDragging(false);
  }, []);

  const steps = [
    { img: s1, ar: { t: 'الحصاد والاختيار', d: 'قشور جوز الهند الناضجة من إندونيسيا، فرز يدوي للأجود فقط.' }, en: { t: 'Harvest & Selection', d: 'Mature coconut shells, hand-sorted for top grade only.' } },
    { img: s2, ar: { t: 'الكربنة في الأفران', d: 'حرق بطيء في أفران مغلقة بدرجة حرارة مدروسة لكربون نقي.' }, en: { t: 'Carbonization', d: 'Slow-burned in sealed kilns for pure, smoke-free carbon.' } },
    { img: s3, ar: { t: 'الطحن والخلط', d: 'مسحوق ناعم مع رابط طبيعي ١٠٠٪ بدون كيماويات.' }, en: { t: 'Grinding & Mixing', d: 'Fine powder bound with 100% natural binder.' } },
    { img: s4, ar: { t: 'الكبس والتجفيف', d: 'مكعبات ٢٥مم تُجفّف ٤٨ ساعة لكثافة وحرارة مثالية.' }, en: { t: 'Pressing & Drying', d: '25mm cubes slow-dried for 48 hours.' } },
    { img: s5, ar: { t: 'التغليف والشحن', d: 'عبوات محكمة جاهزة للجلسات الفاخرة حول العالم.' }, en: { t: 'Packaging & Shipping', d: 'Sealed pouches, ready for premium sessions worldwide.' } },
  ];

  // 8 evenly distributed sprocket holes
  const sprockets = Array.from({ length: 8 });

  return (
    <LuxSection tone="surface" className="py-20 md:py-28 overflow-hidden">
      <SectionHeader
        eyebrow={isAr ? 'طريقة الصنع' : 'How it’s made'}
        title={isAr ? 'رحلة فحم النخلة — مشهد بمشهد' : 'The Palm Charcoal journey — frame by frame'}
      />

      <ScrollReveal>
        {/* FILMSTRIP */}
        <div
          className="relative mx-[-1rem] md:mx-[-2rem] py-6 md:py-8"
          style={{
            background:
              'linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.7), 0 30px 60px -20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top sprocket row */}
          <div className="absolute inset-x-0 top-0 h-6 md:h-8 flex items-center justify-around px-4">
            {sprockets.map((_, k) => (
              <span
                key={`t${k}`}
                className="block w-6 h-3 md:w-9 md:h-4 rounded-[3px] bg-background/95"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
              />
            ))}
          </div>
          {/* Bottom sprocket row */}
          <div className="absolute inset-x-0 bottom-0 h-6 md:h-8 flex items-center justify-around px-4">
            {sprockets.map((_, k) => (
              <span
                key={`b${k}`}
                className="block w-6 h-3 md:w-9 md:h-4 rounded-[3px] bg-background/95"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
              />
            ))}
          </div>

          {/* Frames */}
          <div className="relative px-6 md:px-12 py-8 md:py-10">
            <div
              ref={stripRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onMouseEnter={() => setPlaying(false)}
              onMouseLeave={() => setPlaying(true)}
              className={`flex gap-3 md:gap-4 overflow-x-auto snap-x scrollbar-none pb-2 select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                scrollbarWidth: 'none',
                scrollBehavior: dragging ? 'auto' : 'smooth',
                willChange: 'scroll-position',
                transform: 'translate3d(0,0,0)',
                touchAction: 'pan-y',
              }}
            >

              {steps.map((step, i) => {
                const txt = isAr ? step.ar : step.en;
                return (
                  <div
                    key={i}
                    className="group snap-center shrink-0 w-[78vw] sm:w-[44vw] md:w-[32vw] lg:w-[22vw] relative"
                    style={{
                      border: '1px solid rgba(212,175,55,0.25)',
                      background: '#000',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.7)',
                    }}
                  >
                    {/* Frame number — film slate style */}
                    <div className="absolute top-2 start-2 z-20 flex items-center gap-1.5 px-2 py-1 bg-dark/80 backdrop-blur-sm"
                      style={{ border: '1px solid rgba(212,175,55,0.4)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] tracking-[0.2em] font-mono text-gold-hi">
                        SCN {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Picture
                        source={step.img}
                        alt={txt.t}
                        sizes="(min-width: 1024px) 22vw, (min-width: 768px) 32vw, (min-width: 640px) 44vw, 78vw"
                        className="block w-full h-full"
                        imgClassName="w-full h-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
                        style={{ filter: 'contrast(1.05) saturate(1.05)' }}
                      />
                      {/* Film grain + vignette */}
                      <div
                        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
                        style={{
                          backgroundImage:
                            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/></svg>")',
                        }}
                      />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />

                      <ImageWatermark variant="light" position="br" />

                      {/* Caption — bottom */}
                      <div className="absolute bottom-3 inset-x-3 text-background">
                        <div className="text-[10px] tracking-[0.25em] uppercase text-gold-hi/90 mb-1 font-mono">
                          {isAr ? `مشهد ${i + 1} / ${steps.length}` : `Scene ${i + 1} / ${steps.length}`}
                        </div>
                        <h3 className={`text-base md:text-lg leading-tight mb-1 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
                          {txt.t}
                        </h3>
                        <p className={`text-[11px] md:text-xs leading-relaxed text-background/80 ${isAr ? 'font-arabic' : ''}`}>
                          {txt.d}
                        </p>
                      </div>

                      {/* Cinematic gold sweep */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                          background:
                            'linear-gradient(115deg, transparent 40%, rgba(212,175,55,0.18) 50%, transparent 60%)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 start-0 w-12 md:w-20"
            style={{ background: 'linear-gradient(90deg, #0a0a0a, transparent)' }}
          />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-12 md:w-20"
            style={{ background: 'linear-gradient(270deg, #0a0a0a, transparent)' }}
          />

          {/* Play/Pause control */}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}
            className="absolute bottom-3 end-3 md:bottom-4 md:end-4 z-30 flex items-center gap-2 px-3 py-1.5 bg-dark/80 backdrop-blur-sm text-gold-hi text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-dark transition-colors"
            style={{ border: '1px solid rgba(212,175,55,0.4)' }}
          >
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}</span>
          </button>

        </div>

        {/* Slate footer */}
        <div className="mt-6 flex items-center justify-between text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase text-foreground/50">
          <span>● REC · 24fps · ProRes</span>
          <span className="text-gold-lo">www.nakhlacoal.com</span>
          <span>PALM CHARCOAL — KSA</span>
        </div>
      </ScrollReveal>
    </LuxSection>
  );
}
