import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Flame, ArrowUpRight } from 'lucide-react';
import productBbq from '@/assets/product-bbq.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productLump from '@/assets/product-lump.jpg';
import { useLowPerf } from '@/hooks/useLowPerf';

export function ProductShowcase3D() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [active, setActive] = useState(1);
  const lowPerf = useLowPerf();

  const items = [
    { img: productHookah, ar: 'فحم شيشة كوبي', en: 'Hookah Cubes', tag: isAr ? 'رمّاد ناعم' : 'Fine Ash', to: '/products/hookah' },
    { img: productBbq, ar: 'فحم شواء طبيعي', en: 'BBQ Natural', tag: isAr ? 'حرارة عالية' : 'High Heat', to: '/products/bbq' },
    { img: productCoconut, ar: 'فحم جوز الهند', en: 'Coconut Charcoal', tag: isAr ? '85% كربون' : '85% Carbon', to: '/products/coconut' },
    { img: productLump, ar: 'فحم لمب فاخر', en: 'Premium Lump', tag: isAr ? 'حرق طويل' : 'Long Burn', to: '/products/lump' },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#0B0B0B] overflow-hidden isolate">
      {/* Ambient gold glow */}
      {!lowPerf && (
        <>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[70%] bg-[radial-gradient(ellipse_at_center,hsl(46_72%_62%/0.12),transparent_65%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.6))] pointer-events-none" />
        </>
      )}

      <div className="container relative">
        <div className="text-center mb-14 md:mb-20">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4 font-arabic">
            {isAr ? 'تشكيلة نوار' : 'Noir Collection'}
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
            {isAr ? 'منتجات مصنوعة بلمسة سينمائية' : 'Products crafted in cinematic light'}
          </h2>
        </div>

        {/* 3D perspective carousel — falls back to a lightweight scale/opacity slide on low-perf devices */}
        <div
          className="relative h-[420px] md:h-[520px]"
          style={{ perspective: lowPerf ? undefined : '1600px' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: lowPerf ? undefined : 'preserve-3d' }}
          >
            {items.map((item, i) => {
              const offset = i - active;
              const abs = Math.abs(offset);
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={isAr ? item.ar : item.en}
                  className="absolute w-[260px] md:w-[340px] h-[360px] md:h-[460px] rounded-3xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                  animate={{
                    x: offset * (lowPerf ? 180 : 220),
                    rotateY: lowPerf ? 0 : offset * -22,
                    scale: abs === 0 ? 1 : abs === 1 ? 0.85 : 0.7,
                    opacity: abs > 2 ? 0 : abs === 0 ? 1 : lowPerf ? 0.35 : 0.55,
                    zIndex: 10 - abs,
                  }}
                  transition={
                    lowPerf
                      ? { type: 'tween', duration: 0.35, ease: 'easeOut' }
                      : { type: 'spring', stiffness: 120, damping: 20 }
                  }
                  style={{ transformStyle: lowPerf ? undefined : 'preserve-3d', willChange: 'transform' }}
                >
                  <img
                    src={item.img}
                    alt={isAr ? item.ar : item.en}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  {/* Gold rim + overlay (rim skipped on low-perf) */}
                  {!lowPerf && (
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-[hsl(var(--gold))]/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-start">
                    <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-[hsl(var(--gold-hi,46_95%_78%))] mb-2">
                      <Flame className="w-3 h-3" />
                      {item.tag}
                    </div>
                    <div className="text-white text-lg md:text-xl font-semibold font-arabic">
                      {isAr ? item.ar : item.en}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-center gap-3">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${isAr ? 'الانتقال إلى المنتج' : 'Go to product'} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                active === i ? 'w-10 bg-[hsl(var(--gold))]' : 'w-4 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to={items[active].to}
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold))]/50 text-[hsl(var(--gold-hi,46_95%_78%))] px-7 py-3 text-sm hover:bg-[hsl(var(--gold))]/10 transition"
          >
            {isAr ? 'استكشف المنتج' : 'Explore product'}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
