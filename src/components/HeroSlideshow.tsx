import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWatermark } from './ImageWatermark';
import { Picture } from './Picture';
import slide1 from '@/assets/slide-coconut-trees.jpg?picture';
import slide2 from '@/assets/slide-coconut-factory.jpg?picture';
import slide3 from '@/assets/slide-coconut-charcoal.jpg?picture';

const DURATION = 5500;

export function HeroSlideshow() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const slides = [
    { img: slide1, ar: 'مزارع جوز الهند — إندونيسيا', en: 'Coconut Plantations — Indonesia', pos: '50% 45%' },
    { img: slide2, ar: 'مصنع الفحم — أفران تقليدية', en: 'Charcoal Factory — Traditional Kilns', pos: '50% 50%' },
    { img: slide3, ar: 'فحم معسل جوز الهند الفاخر', en: 'Premium Coconut Hookah Charcoal', pos: '50% 55%' },
  ];

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(performance.now());
  const touchX = useRef<number | null>(null);

  const go = useCallback((dir: 1 | -1) => {
    setI((p) => (p + dir + slides.length) % slides.length);
    startRef.current = performance.now();
    setProgress(0);
  }, [slides.length]);

  const goTo = useCallback((idx: number) => {
    setI(idx);
    startRef.current = performance.now();
    setProgress(0);
  }, []);

  // Auto-advance + progress
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        setI((prev) => (prev + 1) % slides.length);
        startRef.current = now;
        setProgress(0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, slides.length, i]);

  // Keyboard
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(isAr ? -1 : 1);
    else if (e.key === 'ArrowLeft') go(isAr ? 1 : -1);
  };

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go((dx < 0 ? 1 : -1) as 1 | -1);
    touchX.current = null;
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={isAr ? 'معرض الصور' : 'Image gallery'}
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-[2rem] border-luxe shadow-luxe group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-hi/60"
    >
      {slides.map((s, idx) => {
        const active = idx === i;
        return (
          <div
            key={idx}
            aria-hidden={!active}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
            style={{ opacity: active ? 1 : 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                animation: active ? 'kenburns 7s ease-out forwards' : 'none',
                transformOrigin: 'center center',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <Picture
                source={s.img}
                alt={isAr ? s.ar : s.en}
                eager={idx === 0}
                priority={idx === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="block w-full h-full"
                imgClassName="w-full h-full object-cover"
                imgStyle={{ objectPosition: s.pos }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/15 to-transparent" />
          </div>
        );
      })}

      <ImageWatermark variant="light" position="br" />

      {/* Caption */}
      <div className="absolute bottom-8 inset-x-6 text-background pointer-events-none flex justify-center">
        <div
          key={i}
          className="glass-strip glass-dark inline-block rounded-full px-5 py-2 text-sm md:text-base font-arabic font-medium animate-[fade-in_0.8s_ease-out]"
        >
          {isAr ? slides[i].ar : slides[i].en}
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(isAr ? 1 : -1)}
        aria-label={isAr ? 'التالي' : 'Previous'}
        className="glass-strip glass-dark absolute top-1/2 -translate-y-1/2 start-3 grid place-items-center h-11 w-11 rounded-full text-background/95 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(isAr ? -1 : 1)}
        aria-label={isAr ? 'السابق' : 'Next'}
        className="absolute top-1/2 -translate-y-1/2 end-3 grid place-items-center h-10 w-10 rounded-full bg-dark/40 backdrop-blur-md text-background/90 border border-background/15 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 hover:bg-dark/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute top-5 inset-x-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slide ${idx + 1}`}
            aria-current={idx === i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === i ? 'w-10 bg-gold-hi' : 'w-4 bg-background/40 hover:bg-background/70'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 inset-x-0 h-[3px] bg-background/15">
        <div
          className="h-full bg-gradient-to-r from-gold to-gold-hi"
          style={{ width: `${progress * 100}%`, transition: paused ? 'none' : 'width 80ms linear' }}
        />
      </div>

      {/* Gold sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(115deg, transparent 40%, rgba(212,175,55,0.18) 50%, transparent 60%)',
        }}
      />

      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1.08) translate3d(0,0,0); }
          100% { transform: scale(1.18) translate3d(-1.5%, -1%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes kenburns { 0%,100% { transform: scale(1.05); } }
        }
      `}</style>
    </div>
  );
}
