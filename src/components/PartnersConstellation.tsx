import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Node = { x: number; y: number; ar: string; en: string; kind: 'hotel' | 'restaurant' | 'distributor' };

const NODES: Node[] = [
  { x: 12, y: 30, ar: 'فنادق الرياض', en: 'Riyadh Hotels', kind: 'hotel' },
  { x: 28, y: 62, ar: 'مطاعم جدة', en: 'Jeddah Restaurants', kind: 'restaurant' },
  { x: 45, y: 22, ar: 'موزّع الخليج', en: 'Gulf Distributor', kind: 'distributor' },
  { x: 58, y: 55, ar: 'سلاسل مطاعم دبي', en: 'Dubai F&B Chains', kind: 'restaurant' },
  { x: 72, y: 30, ar: 'موزّع دولي', en: 'International Partner', kind: 'distributor' },
  { x: 86, y: 66, ar: 'فنادق قطر', en: 'Qatar Hotels', kind: 'hotel' },
  { x: 38, y: 82, ar: 'مطاعم مكة', en: 'Makkah Restaurants', kind: 'restaurant' },
  { x: 65, y: 84, ar: 'موزّع الشرقية', en: 'Eastern Distributor', kind: 'distributor' },
];

// pre-picked link pairs — visually pleasing "constellation"
const LINKS: [number, number][] = [
  [0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 5],
  [1, 6], [3, 6], [3, 7], [5, 7], [2, 4],
];

export function PartnersConstellation() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="relative z-0 isolate py-24 md:py-32 bg-[#0B0B0B] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(46_72%_62%/0.08),transparent_65%)] pointer-events-none" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-20">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4 font-arabic">
            {isAr ? 'كوكبة الشركاء' : 'Partner Constellation'}
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
            {isAr ? 'شبكة تربطنا بأفضل الوجهات' : 'A network of premium destinations'}
          </h2>
          <p className="mt-5 text-white/60 text-base md:text-lg font-arabic">
            {isAr
              ? 'فنادق، مطاعم، وموزّعون رسميون في المملكة والخليج ومن حولها.'
              : 'Hotels, restaurants and official distributors across KSA, the GCC and beyond.'}
          </p>
        </div>

        <div className="relative w-full aspect-[16/9] rounded-3xl border border-white/5 bg-black/40 overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            role="img"
            aria-label={isAr ? 'خريطة شبكة الشركاء' : 'Partner network'}
          >
            {/* Links */}
            {LINKS.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="hsl(46 72% 62%)"
                strokeOpacity={0.25}
                strokeWidth={0.15}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
              />
            ))}
            {/* Nodes */}
            {NODES.map((n, i) => (
              <motion.circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={0.9}
                fill="hsl(46 90% 68%)"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
              />
            ))}
          </svg>

          {/* HTML labels overlay for a11y & crisp text */}
          {NODES.map((n, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className="mt-3 inline-block rounded-full border border-[hsl(var(--gold))]/25 bg-black/70 px-2.5 py-1 text-[10px] md:text-xs text-white/80 whitespace-nowrap font-arabic">
                {isAr ? n.ar : n.en}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/60 font-arabic">
          <span>{isAr ? '● فنادق' : '● Hotels'}</span>
          <span>{isAr ? '● مطاعم' : '● Restaurants'}</span>
          <span>{isAr ? '● موزّعون' : '● Distributors'}</span>
        </div>
      </div>
    </section>
  );
}
