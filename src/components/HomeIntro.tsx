import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trademarks } from '@/data/trademarks';
import bg from '@/assets/intro-palm-bg.jpg';

const KEY = 'palm-home-intro-played';

const order = [2, 1, 0, 3, 4];
const cards = order.map((i) => trademarks[i]);
const center = trademarks[0];

export function HomeIntro() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');
  const [typed, setTyped] = useState('');

  const dossier = isAr
    ? `> PALM_CHARCOAL // ملف العلامة 2060\n> تهيئة الواجهة الهولوغرافية ...\n> فحص العلامات التجارية المسجّلة ...\n> [✓] تم التحقق — جودة سعودية موثّقة\n> فتح بوابة فحم النخلة ...`
    : `> PALM_CHARCOAL // BRAND DOSSIER 2060\n> Initializing holographic interface ...\n> Verifying registered trademarks ...\n> [✓] Authenticated — Certified Saudi Quality\n> Opening Palm Charcoal portal ...`;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === '1') { setPhase('done'); return; }
      sessionStorage.setItem(KEY, '1');
    } catch {}
    const t1 = setTimeout(() => setPhase('out'), 29200);
    const t2 = setTimeout(() => setPhase('done'), 30000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase === 'done') return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(dossier.slice(0, i));
      if (i >= dossier.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [dossier, phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-700 ease-out ${
        phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,12,8,0.92), rgba(2,8,5,0.96)), url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-hidden
    >
      {/* Cyber grid */}
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.55) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />
      {/* Scan line */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--gold-hi))] to-transparent shadow-[0_0_24px_hsl(var(--gold-hi))] pointer-events-none animate-[scan2060_4.5s_linear_infinite]" />
      {/* Vignette + noise */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)' }} />

      {/* Skip */}
      <button
        onClick={() => setPhase('done')}
        className="absolute top-6 end-6 z-20 text-[11px] tracking-[0.3em] uppercase text-[hsl(var(--gold-hi))]/70 hover:text-[hsl(var(--gold-hi))] transition-colors font-arabic border border-[hsl(var(--gold-hi))]/30 px-3 py-1 rounded-sm backdrop-blur"
      >
        {isAr ? 'تخطي ▸' : 'SKIP ▸'}
      </button>

      {/* HUD corners */}
      {[
        'top-4 start-4 border-t-2 border-s-2',
        'top-4 end-4 border-t-2 border-e-2',
        'bottom-4 start-4 border-b-2 border-s-2',
        'bottom-4 end-4 border-b-2 border-e-2',
      ].map((c, i) => (
        <div key={i} className={`absolute ${c} w-10 h-10 border-[hsl(var(--gold-hi))]/70`} />
      ))}

      <div className="relative h-full w-full flex flex-col items-center justify-center gap-5 md:gap-8 px-4 py-8 text-center">
        {/* Title */}
        <div className="opacity-0 animate-[introUp_0.9s_ease-out_0.2s_forwards]">
          <div className="text-[10px] tracking-[0.5em] text-[hsl(var(--gold-hi))]/80 mb-2 font-mono">
            EST · 2010 — PROTOCOL 2060
          </div>
          <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}
              style={{ color: 'hsl(var(--gold-hi))', textShadow: '0 0 24px rgba(201,168,76,0.45)' }}>
            {isAr ? 'شركة فحم النخلة' : 'Palm Charcoal Company'}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3 md:mt-4">
            <span className="block h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-[hsl(var(--gold-hi))]" />
            <span className="text-[hsl(var(--gold-hi))] rotate-45 inline-block w-2 h-2 border border-[hsl(var(--gold-hi))] animate-pulse" />
            <span className="block h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-[hsl(var(--gold-hi))]" />
          </div>
        </div>

        {/* Coverflow */}
        <div
          className="relative w-full max-w-5xl opacity-0 animate-[introUp_1s_ease-out_0.6s_forwards]"
          style={{ perspective: '1400px', height: 'clamp(180px, 32vw, 320px)' }}
        >
          {cards.map((c, i) => {
            const offset = i - 2;
            const isCenter = offset === 0;
            const xPct = offset * 22;
            const rotY = offset * -18;
            const scale = isCenter ? 1 : 0.78 - Math.abs(offset) * 0.06;
            const z = -Math.abs(offset) * 90;
            return (
              <div
                key={c.id}
                className="absolute top-1/2 left-1/2 transition-transform duration-700"
                style={{
                  width: 'clamp(130px, 22vw, 240px)',
                  height: 'clamp(130px, 22vw, 240px)',
                  transform: `translate(-50%, -50%) translateX(${xPct}%) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`,
                  zIndex: isCenter ? 10 : 5 - Math.abs(offset),
                }}
              >
                <div
                  className={`relative w-full h-full rounded-2xl bg-black/40 backdrop-blur-md border flex items-center justify-center p-3 md:p-4 overflow-hidden ${
                    isCenter
                      ? 'border-[hsl(var(--gold-hi))] shadow-[0_0_60px_-5px_rgba(201,168,76,0.6)]'
                      : 'border-[hsl(var(--gold-hi))]/30 shadow-[0_0_30px_-12px_rgba(201,168,76,0.35)]'
                  }`}
                >
                  {/* Holo sweep */}
                  <div className="absolute inset-0 pointer-events-none opacity-60"
                    style={{
                      background: 'linear-gradient(115deg, transparent 40%, rgba(201,168,76,0.25) 50%, transparent 60%)',
                      animation: 'holoSweep 3.6s ease-in-out infinite',
                    }}
                  />
                  <img src={c.image} alt={c.nameAr} className="max-w-full max-h-full object-contain relative z-[1] drop-shadow-[0_0_12px_rgba(201,168,76,0.3)]" loading="eager" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2060 Dossier terminal */}
        <div className="opacity-0 animate-[introUp_0.9s_ease-out_1s_forwards] w-full max-w-2xl">
          <pre className="text-start font-mono text-[10px] sm:text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap bg-black/55 border border-[hsl(var(--gold-hi))]/40 rounded-lg p-3 sm:p-4 text-[hsl(var(--gold-hi))] shadow-[inset_0_0_30px_rgba(201,168,76,0.15)] min-h-[110px]">
{typed}<span className="inline-block w-2 h-3 bg-[hsl(var(--gold-hi))] ms-1 animate-pulse" />
          </pre>
        </div>

        {/* Registration strip */}
        <div className="bg-black/50 backdrop-blur-md border border-[hsl(var(--gold-hi))]/40 rounded-2xl px-4 sm:px-6 md:px-8 py-3 md:py-5 shadow-[0_0_30px_-10px_rgba(201,168,76,0.4)] grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-3 text-[10px] sm:text-[11px] md:text-xs opacity-0 animate-[introUp_0.9s_ease-out_1.3s_forwards] max-w-2xl w-full">
          <Meta label={isAr ? 'رقم التسجيل' : 'Reg No.'} value={center.registrationNo} />
          <Meta label={isAr ? 'فئة العلامة' : 'Class'} value={center.niceClass.replace('الفئة ', '')} />
          <Meta label={isAr ? 'تاريخ التسجيل' : 'Filed'} value={center.filedHijri} />
          <Meta label={isAr ? 'تاريخ الانتهاء' : 'Expires'} value={center.expiresHijri} />
          <Meta label={isAr ? 'النشاط' : 'Activity'} value={center.goodsAr} />
          <Meta label={isAr ? 'البلد' : 'Country'} value={center.countryAr} />
        </div>
      </div>

      <style>{`
        @keyframes introUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scan2060 { 0% { top: -2%; } 100% { top: 102%; } }
        @keyframes holoSweep { 0%,100% { transform: translateX(-30%); } 50% { transform: translateX(30%); } }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[scan2060_4\\.5s_linear_infinite\\] { animation: none !important; display: none; }
        }
      `}</style>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center md:items-start font-arabic">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--gold-hi))]">{label}</span>
      <span className="text-[hsl(var(--gold-hi))]/85 font-medium mt-0.5 text-center md:text-start">{value}</span>
    </div>
  );
}
