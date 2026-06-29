import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trademarks, type Trademark } from '@/data/trademarks';
const IntroWebGL = lazy(() => import('./IntroWebGL'));

const KEY = 'palm-home-intro-played';
const SETTINGS_KEY = 'palm-intro-settings';

// Show all 5 trademarks in this on-stage order
const ORDER = [0, 1, 2, 3, 4];
const SLIDES = ORDER.map((i) => trademarks[i]);

// Defaults — overridable from Settings via localStorage `palm-intro-settings`:
// { slideMs: 5200, transitionMs: 1100, typeMs: 22 }
const DEFAULTS = { slideMs: 5200, transitionMs: 1100, typeMs: 22 };
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw);
    return {
      slideMs: Math.max(1500, Number(p.slideMs) || DEFAULTS.slideMs),
      transitionMs: Math.max(200, Number(p.transitionMs) || DEFAULTS.transitionMs),
      typeMs: Math.max(5, Number(p.typeMs) || DEFAULTS.typeMs),
    };
  } catch { return DEFAULTS; }
}


// Strict, uniform dossier — driven only by real fields in trademarks.ts.
// Any empty/undefined value is replaced by a visible "—" so the layout is
// identical for every brand (no missing rows, no shifting alignment).
function buildDossier(tm: Trademark, isAr: boolean): string[] {
  const v = (x?: string) => (x && x.trim() ? x.trim() : '—');
  const klass = isAr
    ? v(tm.niceClass)
    : v(tm.niceClass).replace('الفئة', 'Class');

  const rows: Array<[string, string]> = isAr
    ? [
        ['العلامة',       `${v(tm.nameAr)}  (${v(tm.nameEn)})`],
        ['رقم التسجيل',   v(tm.registrationNo)],
        ['الفئة',         klass],
        ['البضائع',       v(tm.goodsAr)],
        ['المالك',        v(tm.ownerAr)],
        ['العنوان',       `${v(tm.addressAr)} — ${v(tm.countryAr)}`],
        ['تاريخ الإيداع', `${v(tm.filedHijri)} هـ`],
        ['تاريخ التسجيل', `${v(tm.registeredHijri)} هـ`],
        ['الانتهاء',      `${v(tm.expiresHijri)} هـ`],
      ]
    : [
        ['Mark',     `${v(tm.nameEn)}  (${v(tm.nameAr)})`],
        ['Reg. No',  v(tm.registrationNo)],
        ['Class',    klass],
        ['Goods',    v(tm.goodsAr)],
        ['Owner',    v(tm.ownerAr)],
        ['Address',  `${v(tm.addressAr)} — ${v(tm.countryAr)}`],
        ['Filed',    `${v(tm.filedHijri)} AH`],
        ['Reg.',     `${v(tm.registeredHijri)} AH`],
        ['Expires',  `${v(tm.expiresHijri)} AH`],
      ];

  const pad = Math.max(...rows.map(([k]) => k.length));
  const header = isAr ? 'PALM_CHARCOAL // ملف العلامة' : 'PALM_CHARCOAL // BRAND DOSSIER';
  const footer = isAr
    ? '[✓] موثّقة لدى وزارة التجارة السعودية'
    : '[✓] Certified by Saudi Ministry of Commerce';

  return [
    `> ${header}`,
    ...rows.map(([k, val]) => `> ${k.padEnd(pad, ' ')} : ${val}`),
    `> ${footer}`,
  ];
}



export function HomeIntro() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState('');
  const reduce = useRef(false);

  const settings = useRef(loadSettings());
  const { slideMs, transitionMs, typeMs } = settings.current;

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      if (sessionStorage.getItem(KEY) === '1') { setPhase('done'); return; }
      sessionStorage.setItem(KEY, '1');
    } catch {}
    const total = slideMs * SLIDES.length + 800;
    const t1 = setTimeout(() => setPhase('out'), total - 800);
    const t2 = setTimeout(() => setPhase('done'), total);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slideMs]);

  // Auto-advance slides
  useEffect(() => {
    if (phase === 'done') return;
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), slideMs);
    return () => clearInterval(id);
  }, [phase, slideMs]);

  // Typewriter dossier per active slide
  const dossierText = useMemo(() => buildDossier(SLIDES[active], !!isAr).join('\n'), [active, isAr]);
  useEffect(() => {
    setTyped('');
    if (phase === 'done') return;
    if (reduce.current) { setTyped(dossierText); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(dossierText.slice(0, i));
      if (i >= dossierText.length) clearInterval(id);
    }, typeMs);
    return () => clearInterval(id);
  }, [dossierText, phase, typeMs]);


  if (phase === 'done') return null;

  const current = SLIDES[active];

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-700 ease-out ${
        phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'hsl(var(--background))' }}
      aria-hidden
    >
      {/* WebGL cinematic backdrop (Three.js + R3F) */}
      <Suspense fallback={null}>
        <IntroWebGL />
      </Suspense>

      {/* Classic paper grain + vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
        style={{ backgroundImage: 'radial-gradient(rgba(60,40,10,0.5) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(60,40,10,0.35) 100%)' }} />


      {/* Skip */}
      <button
        onClick={() => setPhase('done')}
        className="absolute top-6 end-6 z-20 text-[11px] tracking-[0.3em] uppercase text-primary/70 hover:text-[hsl(var(--gold-hi))] transition-colors font-arabic border border-primary/25 px-3 py-1 rounded-sm bg-white/40 backdrop-blur"
      >
        {isAr ? 'تخطي ▸' : 'SKIP ▸'}
      </button>

      {/* Classic ornament corners */}
      {[
        'top-5 start-5 border-t-2 border-s-2',
        'top-5 end-5 border-t-2 border-e-2',
        'bottom-5 start-5 border-b-2 border-s-2',
        'bottom-5 end-5 border-b-2 border-e-2',
      ].map((c, i) => (
        <div key={i} className={`absolute ${c} w-12 h-12 border-[hsl(var(--gold))]/70`} />
      ))}

      <div className="relative h-full w-full flex flex-col items-center justify-center gap-5 md:gap-8 px-4 py-10 text-center">
        {/* Heading */}
        <div className="opacity-0 animate-[introUp_0.9s_ease-out_0.2s_forwards]">
          <div className="text-[10px] tracking-[0.5em] text-[hsl(var(--gold-ink))] mb-2 font-mono font-semibold">
            EST · 2010 — DOSSIER 2060
          </div>
          <h1 className={`text-2xl sm:text-4xl md:text-5xl text-primary ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>

            {isAr ? 'علاماتنا التجارية المسجّلة' : 'Our Registered Trademarks'}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="block h-px w-16 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] rotate-45 inline-block w-2 h-2 border border-[hsl(var(--gold))]" />
            <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[hsl(var(--gold))]" />
          </div>
        </div>

        {/* Slide stage — cinematic 2060 cross-fade with 3D depth + holo flicker */}
        <div
          className="relative w-full max-w-md"
          style={{ height: 'clamp(200px, 34vw, 320px)', perspective: '1400px' }}
        >
          {SLIDES.map((tm, i) => {
            const isActive = i === active;
            // Direction: previous slide exits left/back, next enters from right/front.
            const delta = (i - active + SLIDES.length) % SLIDES.length;
            const isNext = delta === 1;
            const xOff = isActive ? 0 : isNext ? 60 : -60;
            const ry = isActive ? 0 : isNext ? -18 : 18;
            return (
              <div
                key={tm.id}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: `translate3d(${xOff}px,0,${isActive ? 0 : -120}px) rotateY(${ry}deg) scale(${isActive ? 1 : 0.9})`,
                  filter: isActive ? 'blur(0) saturate(1.05)' : 'blur(6px) saturate(0.85)',
                  transformStyle: 'preserve-3d',
                  transition: `opacity ${transitionMs}ms cubic-bezier(0.22,1,0.36,1), transform ${transitionMs}ms cubic-bezier(0.22,1,0.36,1), filter ${transitionMs}ms ease-out`,
                  pointerEvents: isActive ? 'auto' : 'none',
                  willChange: 'transform, opacity, filter',
                }}
              >
                <div className="relative w-full h-full rounded-2xl bg-white/95 border border-[hsl(var(--gold))] shadow-[0_20px_60px_-10px_rgba(160,120,40,0.5)] p-5 overflow-hidden">
                  {/* inner classic frame */}
                  <div className="absolute inset-2 rounded-xl border border-[hsl(var(--gold))]/40 pointer-events-none" />
                  {/* 2060 holo flicker on enter */}
                  {isActive && (
                    <div
                      key={`flick-${active}`}
                      className="absolute inset-0 pointer-events-none mix-blend-screen"
                      style={{
                        background:
                          'repeating-linear-gradient(to bottom, rgba(201,168,76,0.10) 0 1px, transparent 1px 3px)',
                        animation: `holoFlicker ${Math.max(420, transitionMs * 0.7)}ms ease-out 1`,
                      }}
                    />
                  )}
                  {/* gold scan sweep */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(115deg, transparent 42%, rgba(201,168,76,0.28) 50%, transparent 58%)',
                      animation: 'holoSweep 3.2s ease-in-out infinite',
                    }} />
                  <img
                    src={tm.image}
                    alt={tm.nameAr}
                    className="relative z-[1] w-full h-full object-contain"
                    loading="eager"
                  />
                </div>
              </div>
            );
          })}
        </div>


        {/* Brand name + slide pager */}
        <div className="opacity-0 animate-[introUp_0.7s_ease-out_0.6s_forwards] flex flex-col items-center gap-2">
          <div className={`text-lg md:text-2xl font-bold text-primary ${isAr ? 'font-arabic' : 'font-display'}`}>
            {isAr ? current.nameAr : current.nameEn}
            <span className="mx-2 text-[hsl(var(--gold-ink))]">·</span>
            <span className="text-[hsl(var(--gold-ink))] text-sm md:text-base font-mono font-semibold">#{current.registrationNo}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? 'w-8 bg-[hsl(var(--gold-hi))]' : 'w-2 bg-primary/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2060 terminal — live, per-slide */}
        <div className="opacity-0 animate-[introUp_0.9s_ease-out_0.9s_forwards] w-full max-w-2xl">
          <pre
            className="text-start font-mono text-[10px] sm:text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap bg-[#0c1108]/92 border border-[hsl(var(--gold-hi))]/50 rounded-lg p-3 sm:p-4 text-[hsl(var(--gold-hi))] shadow-[inset_0_0_30px_rgba(201,168,76,0.18)] min-h-[180px]"
            dir="ltr"
            style={{ textAlign: isAr ? 'right' : 'left' }}
          >
{typed}<span className="inline-block w-2 h-3 bg-[hsl(var(--gold-hi))] ms-1 align-middle animate-pulse" />
          </pre>
        </div>
      </div>

      <style>{`
        @keyframes introUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes holoSweep { 0%,100% { transform: translateX(-30%); } 50% { transform: translateX(30%); } }
        @keyframes holoFlicker {
          0%   { opacity: 0; transform: translateY(-6px); }
          20%  { opacity: 0.9; }
          40%  { opacity: 0.35; }
          60%  { opacity: 0.75; }
          100% { opacity: 0; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="holoSweep"], [style*="holoFlicker"] { animation: none !important; }
        }
      `}</style>

    </div>
  );
}
