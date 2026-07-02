import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { trademarks, type Trademark } from '@/data/trademarks';
import { SectionHeader } from '@/components/ui-lux';

/**
 * Our Brands — interactive 3D card gallery.
 * - Cursor-tracked perspective tilt (framer-motion springs)
 * - Gold spotlight that follows the pointer
 * - Emissive gold ring + rim glow on hover
 * - Bilingual (AR/EN), fully keyboard-accessible
 */
function BrandCard({ tm, isAr }: { tm: Trademark; isAr: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 150, damping: 15 });

  const spotX = useTransform(mx, (v) => `${v * 100}%`);
  const spotY = useTransform(my, (v) => `${v * 100}%`);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function handleLeave() {
    mx.set(0.5); my.set(0.5); setHover(false);
  }

  return (
    <motion.article
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={handleLeave}
      tabIndex={0}
      aria-label={isAr ? tm.nameAr : tm.nameEn}
      style={{ perspective: 1400 }}
      className="relative group focus-visible:outline-none"
    >
      <motion.div
        style={{
          rotateX: rx,
          rotateY: ry,
          transformStyle: 'preserve-3d',
          background:
            'linear-gradient(155deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
        }}
        className="relative overflow-hidden rounded-2xl border border-[hsl(var(--gold))]/30 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] group-hover:shadow-[0_30px_90px_-20px_rgba(201,168,76,0.45)] group-focus-visible:shadow-[0_30px_90px_-20px_rgba(201,168,76,0.55)] transition-shadow duration-500"
      >
        {/* Gold spotlight following cursor */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(500px circle at ${spotX.get()} ${spotY.get()}, rgba(255,196,110,0.28), transparent 55%)`,
            // fallback if runtime template not reactive: use CSS vars below
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(600px circle at var(--sx) var(--sy), rgba(255,196,110,0.32), transparent 55%)',
            ['--sx' as string]: spotX,
            ['--sy' as string]: spotY,
          } as React.CSSProperties}
        />

        {/* Inner gold hairline frame */}
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-[hsl(var(--gold))]/25" />

        {/* Emissive ring on hover */}
        <div
          className={`pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, rgba(201,168,76,0.0) 0deg, rgba(201,168,76,0.55) 90deg, rgba(255,214,133,0.0) 180deg, rgba(201,168,76,0.55) 270deg, rgba(201,168,76,0.0) 360deg)',
            maskImage: 'linear-gradient(#000,#000)',
            filter: 'blur(10px)',
          }}
        />

        <div className="relative p-6 sm:p-7" style={{ transform: 'translateZ(40px)' }}>
          {/* Logo plate */}
          <div className="relative aspect-square rounded-xl grid place-items-center overflow-hidden bg-[hsl(var(--background))]/50">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 50% 20%, rgba(255,190,110,0.18), transparent 60%)',
            }} />
            <motion.img
              src={tm.image}
              alt={isAr ? tm.nameAr : tm.nameEn}
              loading="lazy"
              decoding="async"
              className="relative w-4/5 h-4/5 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
              animate={{ scale: hover ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            />
          </div>

          {/* Name */}
          <div className="mt-5 flex items-baseline justify-between gap-3">
            <div>
              <h3 className={`text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] ${isAr ? 'font-arabic' : 'font-display'}`}>
                {isAr ? tm.nameAr : tm.nameEn}
              </h3>
              <p className="text-[11px] tracking-[0.25em] uppercase text-[hsl(var(--gold-ink))] mt-0.5">
                {isAr ? tm.nameEn : tm.nameAr}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold-ink))] bg-[hsl(var(--background))]/40">
              #{tm.registrationNo}
            </span>
          </div>

          {/* Meta rows */}
          <dl className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">{isAr ? 'الفئة' : 'Class'}</dt>
              <dd className="font-mono">{tm.niceClass}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">{isAr ? 'البضائع' : 'Goods'}</dt>
              <dd className="text-end max-w-[60%] line-clamp-1">{tm.goodsAr}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[hsl(var(--muted-foreground))]">{isAr ? 'تنتهي' : 'Expires'}</dt>
              <dd className="font-mono">{tm.expiresHijri} <span className="text-[hsl(var(--muted-foreground))]">AH</span></dd>
            </div>
          </dl>

          {/* Color chips */}
          <div className="mt-4 flex items-center gap-1.5">
            {tm.colors.map((c) => (
              <span
                key={c}
                aria-hidden
                className="h-3 w-3 rounded-full ring-1 ring-black/10 shadow-sm"
                style={{ backgroundColor: c }}
              />
            ))}
            <span className="ms-auto text-[10px] tracking-[0.25em] uppercase text-[hsl(var(--gold-ink))]">
              {isAr ? 'مسجّلة رسميًا' : 'Officially Registered'}
            </span>
          </div>
        </div>

        {/* Bottom gold sheen */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-40'}`}
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(201,168,76,0.14))',
          }}
        />
      </motion.div>
    </motion.article>
  );
}

export default function OurBrands3D() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden" aria-labelledby="brands-3d-heading">
      {/* ambient gold aura */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(1200px circle at 50% 0%, rgba(201,168,76,0.10), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow={isAr ? 'علاماتنا' : 'OUR BRANDS'}
          title={isAr ? 'خمس علامات تجارية مسجّلة' : 'Five Registered Trademarks'}
          subtitle={
            isAr
              ? 'محفظة العلامات التجارية الخاصة بمصنع فحم النخلة — كل بطاقة توثّق علامة رسمية بتفاصيلها الكاملة.'
              : 'Al Nakhla Coal trademark portfolio — every card documents an officially registered mark.'
          }
        />

        <div id="brands-3d-heading" className="sr-only">{isAr ? 'علاماتنا التجارية' : 'Our Brands'}</div>

        <div className="mt-10 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {trademarks.map((tm) => (
            <BrandCard key={tm.id} tm={tm} isAr={!!isAr} />
          ))}
        </div>
      </div>
    </section>
  );
}
