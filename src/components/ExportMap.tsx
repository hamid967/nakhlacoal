import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Ship, Clock, Package, MapPin, Anchor } from 'lucide-react';

/**
 * Interactive Export Map — lightweight SVG equirectangular projection.
 * Click a destination to open a side panel with shipment details.
 */

type Point = {
  id: string;
  lat: number;
  lng: number;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  noteAr: string;
  noteEn: string;
  transitDays: number;
  port: string;
  incoterm: string;
  monthlyTons: number;
  frequencyAr: string;
  frequencyEn: string;
};

const ORIGIN = {
  id: 'origin',
  lat: 21.485811,
  lng: 39.192505,
  cityAr: 'جدة · المقر',
  cityEn: 'Jeddah · HQ',
};

const POINTS: Point[] = [
  { id: 'uae', lat: 25.276987, lng: 55.296249, cityAr: 'دبي', cityEn: 'Dubai', countryAr: 'الإمارات', countryEn: 'UAE', noteAr: 'موزّع رئيسي — الإمارات', noteEn: 'Primary distributor — UAE', transitDays: 4, port: 'Jebel Ali', incoterm: 'CIF', monthlyTons: 42, frequencyAr: 'أسبوعيًا', frequencyEn: 'Weekly' },
  { id: 'kw', lat: 29.375859, lng: 47.977405, cityAr: 'الكويت', cityEn: 'Kuwait City', countryAr: 'الكويت', countryEn: 'Kuwait', noteAr: 'سلاسل مطاعم', noteEn: 'Restaurant chains', transitDays: 6, port: 'Shuwaikh', incoterm: 'CFR', monthlyTons: 18, frequencyAr: 'كل أسبوعين', frequencyEn: 'Bi-weekly' },
  { id: 'qa', lat: 25.276987, lng: 51.520008, cityAr: 'الدوحة', cityEn: 'Doha', countryAr: 'قطر', countryEn: 'Qatar', noteAr: 'فنادق فاخرة', noteEn: 'Luxury hotels', transitDays: 5, port: 'Hamad', incoterm: 'CIF', monthlyTons: 22, frequencyAr: 'أسبوعيًا', frequencyEn: 'Weekly' },
  { id: 'om', lat: 23.588, lng: 58.3829, cityAr: 'مسقط', cityEn: 'Muscat', countryAr: 'عُمان', countryEn: 'Oman', noteAr: 'موزّع تجزئة', noteEn: 'Retail distributor', transitDays: 6, port: 'Sohar', incoterm: 'FOB', monthlyTons: 14, frequencyAr: 'شهريًا', frequencyEn: 'Monthly' },
  { id: 'jo', lat: 31.9539, lng: 35.9106, cityAr: 'عمّان', cityEn: 'Amman', countryAr: 'الأردن', countryEn: 'Jordan', noteAr: 'شركاء مطاعم', noteEn: 'Restaurant partners', transitDays: 7, port: 'Aqaba', incoterm: 'CIF', monthlyTons: 12, frequencyAr: 'شهريًا', frequencyEn: 'Monthly' },
  { id: 'eg', lat: 30.0444, lng: 31.2357, cityAr: 'القاهرة', cityEn: 'Cairo', countryAr: 'مصر', countryEn: 'Egypt', noteAr: 'أسواق جملة', noteEn: 'Wholesale market', transitDays: 3, port: 'Sokhna', incoterm: 'CFR', monthlyTons: 30, frequencyAr: 'أسبوعيًا', frequencyEn: 'Weekly' },
  { id: 'tr', lat: 41.0082, lng: 28.9784, cityAr: 'إسطنبول', cityEn: 'Istanbul', countryAr: 'تركيا', countryEn: 'Turkey', noteAr: 'أسواق الشيشة', noteEn: 'Shisha market', transitDays: 12, port: 'Ambarli', incoterm: 'CIF', monthlyTons: 20, frequencyAr: 'كل أسبوعين', frequencyEn: 'Bi-weekly' },
  { id: 'de', lat: 52.52, lng: 13.405, cityAr: 'برلين', cityEn: 'Berlin', countryAr: 'ألمانيا', countryEn: 'Germany', noteAr: 'توزيع أوروبي', noteEn: 'EU distribution', transitDays: 22, port: 'Hamburg', incoterm: 'DAP', monthlyTons: 16, frequencyAr: 'شهريًا', frequencyEn: 'Monthly' },
  { id: 'uk', lat: 51.5074, lng: -0.1278, cityAr: 'لندن', cityEn: 'London', countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom', noteAr: 'مقاهي بريميوم', noteEn: 'Premium lounges', transitDays: 24, port: 'Felixstowe', incoterm: 'DAP', monthlyTons: 10, frequencyAr: 'شهريًا', frequencyEn: 'Monthly' },
  { id: 'sg', lat: 1.3521, lng: 103.8198, cityAr: 'سنغافورة', cityEn: 'Singapore', countryAr: 'سنغافورة', countryEn: 'Singapore', noteAr: 'بوابة آسيا', noteEn: 'Asia gateway', transitDays: 18, port: 'PSA', incoterm: 'CIF', monthlyTons: 24, frequencyAr: 'كل أسبوعين', frequencyEn: 'Bi-weekly' },
];

const project = (lat: number, lng: number) => {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
};

export function ExportMap() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [hover, setHover] = useState<Point | null>(null);
  const [selected, setSelected] = useState<Point | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const pointRefs = useRef<Array<SVGGElement | null>>([]);

  // Pre-sort by longitude so ArrowRight/Left move geographically (LTR reading).
  // In RTL locales we mirror the horizontal direction.
  const orderedIdx = POINTS.map((_, i) => i).sort(
    (a, b) => POINTS[a].lng - POINTS[b].lng
  );
  const posInOrder = (i: number) => orderedIdx.indexOf(i);

  const focusPoint = (i: number) => {
    const clamped = (i + POINTS.length) % POINTS.length;
    setFocusIdx(clamped);
    pointRefs.current[clamped]?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<SVGGElement>, i: number) => {
    const horiz = isAr ? -1 : 1;
    const cur = posInOrder(i);
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusPoint(orderedIdx[(cur + horiz + POINTS.length) % POINTS.length]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusPoint(orderedIdx[(cur - horiz + POINTS.length) % POINTS.length]);
        break;
      case 'ArrowDown': {
        e.preventDefault();
        // Nearest point below current by latitude
        const cy = POINTS[i].lat;
        const below = POINTS
          .map((p, idx) => ({ idx, d: cy - p.lat }))
          .filter((x) => x.d > 0.5)
          .sort((a, b) => a.d - b.d)[0];
        if (below) focusPoint(below.idx);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const cy = POINTS[i].lat;
        const above = POINTS
          .map((p, idx) => ({ idx, d: p.lat - cy }))
          .filter((x) => x.d > 0.5)
          .sort((a, b) => a.d - b.d)[0];
        if (above) focusPoint(above.idx);
        break;
      }
      case 'Home':
        e.preventDefault();
        focusPoint(orderedIdx[0]);
        break;
      case 'End':
        e.preventDefault();
        focusPoint(orderedIdx[orderedIdx.length - 1]);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelected(POINTS[i]);
        break;
      case 'Escape':
        if (selected) {
          e.preventDefault();
          setSelected(null);
        }
        break;
    }
  };

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
              ? 'انقر على أي وجهة ذهبية أو استخدم الأسهم ← → ↑ ↓ ثم Enter لعرض تفاصيل الشحن.'
              : 'Click any gold destination, or use ← → ↑ ↓ arrows then Enter to open shipment details.'}
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
              <linearGradient id="arcHot" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(46 90% 70%)" stopOpacity="1" />
                <stop offset="50%" stopColor="hsl(46 95% 78%)" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(46 80% 60%)" stopOpacity="0.9" />
              </linearGradient>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g fill="hsl(0 0% 100% / 0.10)">
              {Array.from({ length: 40 }).map((_, r) =>
                Array.from({ length: 80 }).map((_, c) => {
                  const x = 15 + c * 12.2;
                  const y = 20 + r * 12;
                  const in1 =
                    Math.sin((x + y) * 0.02) + Math.cos(x * 0.015) + Math.sin(y * 0.03) > 0.4;
                  return in1 ? <circle key={`${r}-${c}`} cx={x} cy={y} r={0.9} /> : null;
                })
              )}
            </g>

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

            {/* Progressive gold arc for the currently-selected destination */}
            {selected && (() => {
              const d = project(selected.lat, selected.lng);
              const mx = (o.x + d.x) / 2;
              const my = (o.y + d.y) / 2 - 60;
              const path = `M ${o.x} ${o.y} Q ${mx} ${my} ${d.x} ${d.y}`;
              return (
                <g key={`sel-${selected.id}`} filter="url(#goldGlow)">
                  {/* Soft halo underlay */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="hsl(46 90% 70%)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeOpacity="0.25"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                  />
                  {/* Main gold stroke */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="url(#arcHot)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                  />
                  {/* Sparkle traveling along the path */}
                  <circle r="3.5" fill="hsl(46 100% 85%)">
                    <animateMotion dur="1.6s" repeatCount="indefinite" path={path} rotate="auto" />
                    <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })()}



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

            {POINTS.map((p, i) => {
              const d = project(p.lat, p.lng);
              const isActive = hover?.id === p.id || selected?.id === p.id;
              const isFocused = focusIdx === i;
              return (
                <g
                  key={p.id}
                  ref={(el) => (pointRefs.current[i] = el)}
                  transform={`translate(${d.x} ${d.y})`}
                  onMouseEnter={() => setHover(p)}
                  onMouseLeave={() => setHover((h) => (h?.id === p.id ? null : h))}
                  onFocus={() => {
                    setHover(p);
                    setFocusIdx(i);
                  }}
                  onBlur={() => setHover(null)}
                  onClick={() => {
                    setFocusIdx(i);
                    setSelected(p);
                  }}
                  onKeyDown={(e) => handleKey(e, i)}
                  tabIndex={isFocused ? 0 : -1}
                  role="button"
                  aria-label={`${isAr ? p.cityAr : p.cityEn} — ${isAr ? 'اعرض تفاصيل الشحن' : 'View shipment details'} (${i + 1}/${POINTS.length})`}
                  aria-pressed={selected?.id === p.id}
                  className="focus:outline-none [&:focus-visible_.focus-ring]:opacity-100"
                  style={{ cursor: 'pointer' }}
                >
                  <circle r="14" fill="url(#glow)" opacity={isActive ? 1 : 0.6} />
                  <circle r={isActive ? 5.5 : 4} fill="hsl(46 72% 62%)">
                    <animate attributeName="opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle r="1.6" fill="hsl(0 0% 4%)" />
                  {/* High-contrast focus ring — visible only when keyboard-focused */}
                  <circle
                    className="focus-ring"
                    r="12"
                    fill="none"
                    stroke="hsl(0 0% 100%)"
                    strokeWidth="2"
                    opacity="0"
                    style={{ transition: 'opacity 0.15s' }}
                  />
                  <circle
                    className="focus-ring"
                    r="14"
                    fill="none"
                    stroke="hsl(46 72% 62%)"
                    strokeWidth="1.5"
                    opacity="0"
                    style={{ transition: 'opacity 0.15s' }}
                  />
                  {isFocused && (
                    <text
                      x="0"
                      y="-20"
                      textAnchor="middle"
                      fill="hsl(46 72% 62%)"
                      fontSize="11"
                      fontWeight="700"
                      style={{ paintOrder: 'stroke', stroke: 'hsl(0 0% 0%)', strokeWidth: 3 }}
                    >
                      {isAr ? p.cityAr : p.cityEn}
                    </text>
                  )}
                </g>
              );
            })}

          </svg>

          {hover && !selected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute top-4 end-4 max-w-[240px] rounded-xl border border-[hsl(var(--gold))]/40 bg-black/85 backdrop-blur px-4 py-3 shadow-[0_20px_40px_-16px_hsl(0_0%_0%/0.9)]"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold-hi))]">
                {isAr ? 'انقر للتفاصيل' : 'Click for details'}
              </div>
              <div className={`mt-1 text-lg text-[hsl(var(--foreground))] ${isAr ? 'font-arabic font-bold' : 'font-semibold'}`}>
                {isAr ? hover.cityAr : hover.cityEn}
              </div>
              <div className={`mt-1 text-xs text-[hsl(var(--foreground))]/70 ${isAr ? 'font-arabic' : ''}`}>
                {isAr ? hover.noteAr : hover.noteEn}
              </div>
            </motion.div>
          )}

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

        {/* Guide / Legend — explains icons, values, and route semantics */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              swatch: (
                <span className="relative inline-flex w-6 h-6 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-[hsl(46_72%_62%/0.25)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_10px_hsl(46_72%_62%/0.9)]" />
                </span>
              ),
              titleAr: 'وجهة تصدير نشطة',
              titleEn: 'Active export destination',
              descAr: 'نقطة ذهبية متوهّجة تمثّل ميناء تفريغ نصدّر إليه شحنات منتظمة. انقر لعرض التفاصيل.',
              descEn: 'A glowing gold point marks a discharge port we ship to on a recurring basis. Click to view details.',
            },
            {
              swatch: (
                <span
                  className="inline-block w-8 h-0"
                  style={{ borderTop: '2px dashed hsl(46 72% 62% / 0.7)' }}
                />
              ),
              titleAr: 'مسار شحن معياري',
              titleEn: 'Standard shipping arc',
              descAr: 'خط منقّط ذهبي يربط جدة بكل وجهة، يمثّل قناة تصدير قائمة عبر البحر أو الجو.',
              descEn: 'A dashed gold arc from Jeddah to each port represents an established sea or air export lane.',
            },
            {
              swatch: (
                <span className="relative inline-block w-10 h-2 rounded-full bg-gradient-to-r from-[hsl(46_95%_78%)] to-[hsl(46_80%_60%/0.4)] shadow-[0_0_14px_hsl(46_90%_70%/0.8)]" />
              ),
              titleAr: 'مسار مضاء عند التحديد',
              titleEn: 'Highlighted route on selection',
              descAr: 'عند اختيار وجهة يُرسم مسارها تدريجيًا بلون ذهبي متوهّج مع شرارة متحرّكة توضح اتجاه الشحن.',
              descEn: 'Selecting a port draws its lane progressively in glowing gold, with a moving sparkle showing shipping direction.',
            },
            {
              swatch: (
                <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.25em] text-[hsl(var(--gold-hi))]">
                  <span className="rounded border border-[hsl(var(--gold))]/50 px-1.5 py-0.5">CIF</span>
                  <span className="rounded border border-[hsl(var(--gold))]/50 px-1.5 py-0.5">FOB</span>
                </span>
              ),
              titleAr: 'قيم وأرقام الشحن',
              titleEn: 'Shipment values & terms',
              descAr: 'مدة العبور بالأيام، الحجم الشهري بالأطنان، تردّد الشحنات، وشرط التسليم Incoterm (CIF/FOB/DAP).',
              descEn: 'Transit time (days), monthly volume (tons), shipping frequency, and the Incoterm (CIF/FOB/DAP) used per lane.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[hsl(var(--gold))]/20 bg-black/40 p-4 transition hover:border-[hsl(var(--gold))]/50"
            >
              <div className="flex items-center gap-3 min-h-[2rem]">{item.swatch}</div>
              <div
                className={`mt-3 text-sm font-semibold text-[hsl(var(--foreground))] ${
                  isAr ? 'font-arabic' : ''
                }`}
              >
                {isAr ? item.titleAr : item.titleEn}
              </div>
              <p
                className={`mt-1.5 text-xs leading-relaxed text-[hsl(var(--foreground))]/65 ${
                  isAr ? 'font-arabic' : ''
                }`}
              >
                {isAr ? item.descAr : item.descEn}
              </p>
            </div>
          ))}
        </div>

        <p
          className={`mt-6 text-center text-xs text-[hsl(var(--foreground))]/50 ${
            isAr ? 'font-arabic' : ''
          }`}
        >
          {isAr
            ? 'ملاحظة: الأرقام تقديرية للأحجام المعتادة وقد تختلف بحسب الموسم وحجم الطلب.'
            : 'Note: Figures are indicative averages; actual volumes vary by season and order size.'}
        </p>
      </div>


      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side={isAr ? 'left' : 'right'}
          className="bg-[hsl(var(--dark))] border-[hsl(var(--gold))]/30 text-[hsl(var(--foreground))] w-full sm:max-w-md"
        >
          {selected && (
            <>
              <SheetHeader className={isAr ? 'text-right' : 'text-left'}>
                <div className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))]">
                  {isAr ? 'تفاصيل الشحن' : 'Shipment details'}
                </div>
                <SheetTitle className={`text-2xl text-[hsl(var(--foreground))] ${isAr ? 'font-arabic' : 'font-display'}`}>
                  {isAr ? selected.cityAr : selected.cityEn}
                  <span className="block text-sm text-[hsl(var(--foreground))]/60 font-normal mt-1">
                    {isAr ? selected.countryAr : selected.countryEn}
                  </span>
                </SheetTitle>
                <SheetDescription className={`text-[hsl(var(--foreground))]/70 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? selected.noteAr : selected.noteEn}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <DetailCard
                  icon={<Clock className="w-4 h-4" />}
                  label={isAr ? 'مدة العبور' : 'Transit time'}
                  value={isAr ? `${selected.transitDays} يوم` : `${selected.transitDays} days`}
                  isAr={isAr}
                />
                <DetailCard
                  icon={<Anchor className="w-4 h-4" />}
                  label={isAr ? 'ميناء الوصول' : 'Port of arrival'}
                  value={selected.port}
                  isAr={isAr}
                />
                <DetailCard
                  icon={<Package className="w-4 h-4" />}
                  label={isAr ? 'الحجم الشهري' : 'Monthly volume'}
                  value={isAr ? `${selected.monthlyTons} طن` : `${selected.monthlyTons} tons`}
                  isAr={isAr}
                />
                <DetailCard
                  icon={<Ship className="w-4 h-4" />}
                  label={isAr ? 'التردد' : 'Frequency'}
                  value={isAr ? selected.frequencyAr : selected.frequencyEn}
                  isAr={isAr}
                />
                <DetailCard
                  icon={<MapPin className="w-4 h-4" />}
                  label={isAr ? 'شرط التسليم' : 'Incoterm'}
                  value={selected.incoterm}
                  isAr={isAr}
                />
                <DetailCard
                  icon={<MapPin className="w-4 h-4" />}
                  label={isAr ? 'المنشأ' : 'Origin'}
                  value={isAr ? 'جدة' : 'Jeddah'}
                  isAr={isAr}
                />
              </div>

              <div className="mt-8 rounded-xl border border-[hsl(var(--gold))]/25 bg-black/40 p-4">
                <div className={`text-xs text-[hsl(var(--foreground))]/60 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr
                    ? 'للحصول على عرض سعر مخصّص لهذه الوجهة، تواصل مع فريق التصدير.'
                    : 'For a custom quote to this destination, contact our export team.'}
                </div>
                <a
                  href={`https://wa.me/966540060095?text=${encodeURIComponent(
                    isAr
                      ? `مرحبًا، أرغب بعرض سعر شحن إلى ${selected.cityAr} (${selected.countryAr}).`
                      : `Hello, I'd like a shipping quote to ${selected.cityEn} (${selected.countryEn}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center w-full rounded-lg bg-[hsl(var(--gold))] text-black font-medium py-2.5 text-sm hover:brightness-110 transition"
                >
                  {isAr ? 'اطلب عرض سعر عبر واتساب' : 'Request a WhatsApp quote'}
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function DetailCard({
  icon,
  label,
  value,
  isAr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isAr: boolean;
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--gold))]/20 bg-black/40 p-3">
      <div className="flex items-center gap-1.5 text-[hsl(var(--gold-hi))]">
        {icon}
        <span className={`text-[10px] tracking-[0.2em] uppercase ${isAr ? 'font-arabic' : ''}`}>
          {label}
        </span>
      </div>
      <div className={`mt-1.5 text-sm text-[hsl(var(--foreground))] font-medium ${isAr ? 'font-arabic' : ''}`}>
        {value}
      </div>
    </div>
  );
}
