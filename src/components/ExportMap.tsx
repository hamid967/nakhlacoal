import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Interactive Export Map — lightweight SVG equirectangular projection.
 * No external map dependency, no CLS, GPU-only animations.
 * Origin: Jeddah, KSA. Destinations rendered as pulsing gold dots with
 * an on-hover / on-focus tooltip.
 */

type Point = { id: string; lat: number; lng: number; cityAr: string; cityEn: string; noteAr: string; noteEn: string };

const ORIGIN: Point = {
  id: 'origin',
  lat: 21.485811,
  lng: 39.192505,
  cityAr: 'جدة · المقر',
  cityEn: 'Jeddah · HQ',
  noteAr: 'مركز التصنيع والتصدير',
  noteEn: 'Manufacturing & export hub',
};

const POINTS: Point[] = [
  { id: 'uae', lat: 25.276987, lng: 55.296249, cityAr: 'دبي', cityEn: 'Dubai', noteAr: 'موزّع رئيسي — الإمارات', noteEn: 'Primary distributor — UAE' },
  { id: 'kw', lat: 29.375859, lng: 47.977405, cityAr: 'الكويت', cityEn: 'Kuwait City', noteAr: 'سلاسل مطاعم', noteEn: 'Restaurant chains' },
  { id: 'qa', lat: 25.276987, lng: 51.520008, cityAr: 'الدوحة', cityEn: 'Doha', noteAr: 'فنادق فاخرة', noteEn: 'Luxury hotels' },
  { id: 'om', lat: 23.588, lng: 58.3829, cityAr: 'مسقط', cityEn: 'Muscat', noteAr: 'موزّع تجزئة', noteEn: 'Retail distributor' },
  { id: 'jo', lat: 31.9539, lng: 35.9106, cityAr: 'عمّان', cityEn: 'Amman', noteAr: 'شركاء مطاعم', noteEn: 'Restaurant partners' },
  { id: 'eg', lat: 30.0444, lng: 31.2357, cityAr: 'القاهرة', cityEn: 'Cairo', noteAr: 'أسواق جملة', noteEn: 'Wholesale market' },
  { id: 'tr', lat: 41.0082, lng: 28.9784, cityAr: 'إسطنبول', cityEn: 'Istanbul', noteAr: 'أسواق الشيشة', noteEn: 'Shisha market' },
  { id: 'de', lat: 52.52, lng: 13.405, cityAr: 'برلين', cityEn: 'Berlin', noteAr: 'توزيع أوروبي', noteEn: 'EU distribution' },
  { id: 'uk', lat: 51.5074, lng: -0.1278, cityAr: 'لندن', cityEn: 'London', noteAr: 'مقاهي بريميوم', noteEn: 'Premium lounges' },
  { id: 'sg', lat: 1.3521, lng: 103.8198, cityAr: 'سنغافورة', cityEn: 'Singapore', noteAr: 'بوابة آسيا', noteEn: 'Asia gateway' },
];

// Equirectangular projection into 1000×500 viewBox.
const project = (lat: number, lng: number) => {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
};

export function ExportMap() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [hover, setHover] = useState<Point | null>(null);

  const o = project(ORIGIN.lat, ORIGIN.lng);

  return (
    <section className="relative py-20 md:py-28 bg-[hsl(var(--dark))] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(700px 400px at 50% 50%, hsl(46 72% 62% / 0.10), transparent 70%)',
        }}
      />

      <div className="container relative">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
            {isAr ? '— من جدة إلى العالم —' : '— From Jeddah to the world —'}
          </span>
          <h2
            className={`mt-4 text-3xl md:text-5xl text-[hsl(var(--foreground))] ${
              isAr ? 'font-arabic font-bold' : 'font-display font-bold'
            }`}
          >
            {isAr ? 'شبكة تصديرنا العالمية' : 'Our global export network'}
          </h2>
          <p className={`mt-4 text-[hsl(var(--foreground))]/60 max-w-xl mx-auto ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? 'مرّر فوق النقاط الذهبية لعرض الوجهات ووسائل التوزيع.'
              : 'Hover the gold points to explore destinations and distribution partners.'}
          </p>
        </div>

        <div
          className="relative rounded-3xl border border-[hsl(var(--gold))]/25 bg-black/50 p-4 md:p-6 overflow-hidden"
          style={{ boxShadow: '0 40px 100px -40px hsl(46 72% 62% / 0.28)' }}
        >
          <svg viewBox="0 0 1000 500" className="w-full h-auto" role="img" aria-label={isAr ? 'خريطة التصدير' : 'Export map'}>
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(46 72% 62%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(46 72% 62%)" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(46 72% 62%)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(46 72% 62%)" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Dotted world grid — abstract, no external topology */}
            <g fill="hsl(0 0% 100% / 0.10)">
              {Array.from({ length: 40 }).map((_, r) =>
                Array.from({ length: 80 }).map((_, c) => {
                  const x = 15 + c * 12.2;
                  const y = 20 + r * 12;
                  // Landmass-ish mask via sine — purely aesthetic
                  const in1 =
                    Math.sin((x + y) * 0.02) + Math.cos(x * 0.015) + Math.sin(y * 0.03) > 0.4;
                  return in1 ? <circle key={`${r}-${c}`} cx={x} cy={y} r={0.9} /> : null;
                })
              )}
            </g>

            {/* Arcs from Jeddah to each destination */}
            {POINTS.map((p, i) => {
              const d = project(p.lat, p.lng);
              const mx = (o.x + d.x) / 2;
              const my = (o.y + d.y) / 2 - 60;
              return (
                <motion.path
                  key={p.id}
                  d={`M ${o.x} ${o.y} Q ${mx} ${my} ${d.x} ${d.y}`}
                  fill="none"
                  stroke="url(#arc)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, delay: 0.15 * i, ease: 'easeInOut' }}
                />
              );
            })}

            {/* Origin — Jeddah */}
            <g transform={`translate(${o.x} ${o.y})`}>
              <circle r="22" fill="url(#glow)" />
              <circle r="6" fill="hsl(46 72% 62%)" />
              <circle r="10" fill="none" stroke="hsl(46 72% 62%)" strokeWidth="1.2" opacity="0.6">
                <animate attributeName="r" values="6;18;6" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
              </circle>
              <text x="10" y="-10" fill="hsl(46 72% 62%)" fontSize="12" fontWeight="600">
                {isAr ? 'جدة' : 'Jeddah'}
              </text>
            </g>

            {/* Destination points */}
            {POINTS.map((p) => {
              const d = project(p.lat, p.lng);
              const isActive = hover?.id === p.id;
              return (
                <g
                  key={p.id}
                  transform={`translate(${d.x} ${d.y})`}
                  onMouseEnter={() => setHover(p)}
                  onMouseLeave={() => setHover((h) => (h?.id === p.id ? null : h))}
                  onFocus={() => setHover(p)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={isAr ? p.cityAr : p.cityEn}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <circle r="14" fill="url(#glow)" opacity={isActive ? 1 : 0.6} />
                  <circle r={isActive ? 5.5 : 4} fill="hsl(46 72% 62%)">
                    <animate attributeName="opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle r="1.6" fill="hsl(0 0% 4%)" />
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute top-4 end-4 max-w-[240px] rounded-xl border border-[hsl(var(--gold))]/40 bg-black/85 backdrop-blur px-4 py-3 shadow-[0_20px_40px_-16px_hsl(0_0%_0%/0.9)]"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold-hi))]">
                {isAr ? 'وجهة تصدير' : 'Export destination'}
              </div>
              <div className={`mt-1 text-lg text-[hsl(var(--foreground))] ${isAr ? 'font-arabic font-bold' : 'font-semibold'}`}>
                {isAr ? hover.cityAr : hover.cityEn}
              </div>
              <div className={`mt-1 text-xs text-[hsl(var(--foreground))]/70 ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? hover.noteAr : hover.noteEn}
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[hsl(var(--foreground))]/60">
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_10px_hsl(46_72%_62%/0.8)]" />
              {isAr ? `${POINTS.length}+ وجهة نشطة` : `${POINTS.length}+ active destinations`}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-6 h-px bg-[hsl(var(--gold))]/60" style={{ borderTop: '1px dashed hsl(46 72% 62% / 0.6)' }} />
              {isAr ? 'مسار شحن' : 'Shipping route'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
