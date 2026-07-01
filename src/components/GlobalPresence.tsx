import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDir } from '@/components/ui-lux';

type Region = {
  id: string;
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  x: number; // % of viewBox width
  y: number; // % of viewBox height
  hub?: boolean;
};

const REGIONS: Region[] = [
  { id: 'sa', name: { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' }, role: { ar: 'المقر الرئيسي · جدة', en: 'HQ · Jeddah' }, x: 58, y: 46, hub: true },
  { id: 'ae', name: { ar: 'الإمارات', en: 'United Arab Emirates' }, role: { ar: 'مركز التوزيع الخليجي', en: 'Gulf distribution hub' }, x: 62, y: 47 },
  { id: 'kw', name: { ar: 'الكويت', en: 'Kuwait' }, role: { ar: 'شراكات جملة', en: 'Wholesale partners' }, x: 60, y: 43 },
  { id: 'qa', name: { ar: 'قطر', en: 'Qatar' }, role: { ar: 'قطاع الضيافة', en: 'Hospitality sector' }, x: 61, y: 46 },
  { id: 'eg', name: { ar: 'مصر', en: 'Egypt' }, role: { ar: 'شبكة المقاهي', en: 'Lounges network' }, x: 55, y: 47 },
  { id: 'tr', name: { ar: 'تركيا', en: 'Türkiye' }, role: { ar: 'شحن أوروبي', en: 'European gateway' }, x: 56, y: 40 },
  { id: 'de', name: { ar: 'ألمانيا', en: 'Germany' }, role: { ar: 'مستورد معتمد', en: 'Approved importer' }, x: 51, y: 34 },
  { id: 'uk', name: { ar: 'المملكة المتحدة', en: 'United Kingdom' }, role: { ar: 'قنوات فاخرة', en: 'Premium channels' }, x: 48, y: 32 },
  { id: 'us', name: { ar: 'الولايات المتحدة', en: 'United States' }, role: { ar: 'موزّع ساحل شرقي', en: 'East-coast distributor' }, x: 24, y: 40 },
  { id: 'jp', name: { ar: 'اليابان', en: 'Japan' }, role: { ar: 'يـاكيتوري بريميوم', en: 'Yakitori premium' }, x: 84, y: 42 },
  { id: 'sg', name: { ar: 'سنغافورة', en: 'Singapore' }, role: { ar: 'محور آسيوي', en: 'Asia hub' }, x: 79, y: 58 },
  { id: 'za', name: { ar: 'جنوب إفريقيا', en: 'South Africa' }, role: { ar: 'شراكة براي', en: 'Braai partnership' }, x: 55, y: 74 },
];

export function GlobalPresence() {
  const { isAr } = useDir();
  const [active, setActive] = useState<string>('sa');
  const activeRegion = REGIONS.find((r) => r.id === active) ?? REGIONS[0];

  return (
    <section
      aria-label={isAr ? 'الحضور العالمي' : 'Global presence'}
      className="relative z-0 isolate bg-[#0B0B0B] py-24 md:py-32 overflow-hidden"
    >
      <div className="container">
        <div className="mb-12 md:mb-16 max-w-2xl">
          <div className="text-[hsl(46_90%_60%)] text-xs uppercase tracking-[0.28em] mb-4 font-arabic">
            {isAr ? 'الحضور العالمي' : 'Global presence'}
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
            {isAr ? 'من جدة إلى أسواق العالم' : 'From Jeddah to the world'}
          </h2>
          <p className="mt-4 text-white/70 font-arabic text-base md:text-lg">
            {isAr
              ? 'شبكة موزّعين وشركاء في أكثر من ١٢ دولة عبر الشرق الأوسط وأوروبا وآسيا والأمريكتين.'
              : 'A partner network across 12+ countries spanning the Middle East, Europe, Asia and the Americas.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map */}
          <div className="lg:col-span-8">
            <div className="relative rounded-3xl border border-[hsl(46_90%_50%/0.2)] bg-gradient-to-br from-white/[0.03] to-black/40 p-4 md:p-6">
              <svg
                viewBox="0 0 100 60"
                className="w-full h-auto"
                role="img"
                aria-label={isAr ? 'خريطة مواقع فحم النخلة' : 'Palm Charcoal presence map'}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Latitude grid lines (cheap, no external tiles) */}
                {[15, 30, 45].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(46 90% 60% / 0.06)" strokeWidth="0.1" />
                ))}
                {[25, 50, 75].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="60" stroke="hsl(46 90% 60% / 0.06)" strokeWidth="0.1" />
                ))}

                {/* Simplified continent silhouettes */}
                <g fill="hsl(46 30% 20% / 0.35)" stroke="hsl(46 90% 60% / 0.15)" strokeWidth="0.15">
                  {/* North America */}
                  <path d="M8,22 Q18,18 28,22 L32,32 Q28,42 20,44 L14,42 Q8,36 6,30 Z" />
                  {/* South America */}
                  <path d="M24,46 Q30,44 32,50 L30,58 Q26,60 22,56 Z" />
                  {/* Europe */}
                  <path d="M46,28 Q52,26 56,30 L54,36 Q50,38 46,36 Z" />
                  {/* Africa */}
                  <path d="M48,40 Q56,38 58,44 L56,56 Q52,60 48,56 L46,48 Z" />
                  {/* Middle East / Asia */}
                  <path d="M56,36 Q68,32 82,36 L88,42 Q82,50 72,50 L60,48 Q56,44 56,40 Z" />
                  {/* Australia */}
                  <path d="M80,54 Q88,52 90,56 L86,60 Q82,60 80,58 Z" />
                </g>

                {/* Great-circle arcs from HQ (Saudi) to hubs */}
                {REGIONS.filter((r) => r.id !== 'sa').map((r) => {
                  const hq = REGIONS[0];
                  const mx = (hq.x + r.x) / 2;
                  const my = Math.min(hq.y, r.y) - 6;
                  const isActive = active === r.id || active === 'sa';
                  return (
                    <path
                      key={`arc-${r.id}`}
                      d={`M ${hq.x} ${hq.y} Q ${mx} ${my} ${r.x} ${r.y}`}
                      fill="none"
                      stroke="hsl(46 90% 60%)"
                      strokeWidth="0.15"
                      strokeOpacity={isActive ? 0.6 : 0.18}
                      strokeDasharray="0.6 0.6"
                    />
                  );
                })}

                {/* Nodes */}
                {REGIONS.map((r) => {
                  const isActive = r.id === active;
                  return (
                    <g
                      key={r.id}
                      transform={`translate(${r.x} ${r.y})`}
                      onMouseEnter={() => setActive(r.id)}
                      onFocus={() => setActive(r.id)}
                      onClick={() => setActive(r.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={isAr ? r.name.ar : r.name.en}
                      aria-pressed={isActive}
                      className="cursor-pointer focus:outline-none"
                    >
                      {r.hub && (
                        <circle
                          r={isActive ? 2.4 : 2}
                          fill="hsl(46 90% 60% / 0.15)"
                          stroke="hsl(46 90% 60% / 0.5)"
                          strokeWidth="0.1"
                        >
                          <animate attributeName="r" values="2;3;2" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        r={isActive ? 0.9 : 0.6}
                        fill={r.hub ? 'hsl(46 90% 65%)' : isActive ? 'hsl(46 90% 60%)' : 'hsl(46 90% 55% / 0.7)'}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Stats strip — very cheap DOM */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { v: '12+', l: isAr ? 'دولة' : 'Countries' },
                { v: '40', l: isAr ? 'حاوية / سنة' : 'Containers/yr' },
                { v: '99%', l: isAr ? 'التسليم في الموعد' : 'On-time delivery' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[hsl(46_90%_50%/0.2)] bg-black/40 px-4 py-4 md:py-5 text-center"
                >
                  <div className="text-2xl md:text-3xl font-display font-bold text-[hsl(46_90%_65%)]">{s.v}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/60 font-arabic">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Region list */}
          <div className="lg:col-span-4">
            <motion.div
              key={activeRegion.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-[hsl(46_90%_50%/0.3)] bg-black/50 p-6 mb-4"
            >
              <div className="text-[hsl(46_90%_60%)] text-[10px] uppercase tracking-[0.24em] font-arabic mb-2">
                {isAr ? 'الموقع النشط' : 'Active region'}
              </div>
              <div className="text-white text-xl font-display font-bold">
                {isAr ? activeRegion.name.ar : activeRegion.name.en}
              </div>
              <div className="text-white/70 text-sm mt-1 font-arabic">
                {isAr ? activeRegion.role.ar : activeRegion.role.en}
              </div>
            </motion.div>

            <ul className="max-h-[360px] overflow-y-auto pr-1 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
              {REGIONS.map((r) => {
                const isActive = r.id === active;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(r.id)}
                      onFocus={() => setActive(r.id)}
                      onClick={() => setActive(r.id)}
                      aria-pressed={isActive}
                      className={`w-full text-start px-4 py-3 flex items-center gap-3 transition-colors focus-visible:ring-2 focus-visible:ring-[hsl(46_90%_60%)] ${
                        isActive ? 'bg-[hsl(46_90%_50%/0.08)]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          r.hub ? 'bg-[hsl(46_90%_65%)]' : 'bg-white/40'
                        }`}
                        aria-hidden
                      />
                      <span className="flex-1">
                        <span className="block text-white text-sm font-arabic">
                          {isAr ? r.name.ar : r.name.en}
                        </span>
                        <span className="block text-white/50 text-xs font-arabic">
                          {isAr ? r.role.ar : r.role.en}
                        </span>
                      </span>
                      {r.hub && (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(46_90%_65%)] border border-[hsl(46_90%_50%/0.4)] rounded-full px-2 py-0.5">
                          {isAr ? 'مقر' : 'HQ'}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
