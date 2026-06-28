import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trademarks } from '@/data/trademarks';
import bg from '@/assets/intro-palm-bg.jpg';

const KEY = 'palm-home-intro-played';

// Coverflow order: side, side, CENTER, side, side
const order = [2, 1, 0, 3, 4]; // al-markaz, nakhlan, palm-charcoal(center), al-nakhlatain, baashen
const cards = order.map((i) => trademarks[i]);
const center = trademarks[0];

export function HomeIntro() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === '1') {
        setPhase('done');
        return;
      }
      sessionStorage.setItem(KEY, '1');
    } catch {}
    const t1 = setTimeout(() => setPhase('out'), 5200);
    const t2 = setTimeout(() => setPhase('done'), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-700 ease-out ${
        phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(248,242,228,0.92), rgba(244,234,212,0.95)), url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-hidden
    >
      {/* Skip */}
      <button
        onClick={() => setPhase('done')}
        className="absolute top-6 end-6 z-20 text-[11px] tracking-[0.3em] uppercase text-foreground/60 hover:text-[hsl(var(--gold-hi))] transition-colors font-arabic"
      >
        {isAr ? 'تخطي' : 'Skip'}
      </button>

      <div className="relative h-full w-full flex flex-col items-center justify-center gap-6 md:gap-10 px-4 py-8 text-center">
        {/* Title */}
        <div className="opacity-0 animate-[introUp_0.9s_ease-out_0.2s_forwards]">
          <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}
              style={{ color: '#1A4A00' }}>
            {isAr ? 'شركة فحم النخلة' : 'Palm Charcoal Company'}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3 md:mt-4">
            <span className="block h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-[hsl(var(--gold))]" />
            <span className="text-[hsl(var(--gold))] rotate-45 inline-block w-2 h-2 border border-[hsl(var(--gold))]" />
            <span className="block h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-[hsl(var(--gold))]" />
          </div>
          <p className={`mt-4 max-w-xl mx-auto text-xs sm:text-sm md:text-base text-foreground/75 leading-relaxed px-2 ${isAr ? 'font-arabic' : ''}`}>
            {isAr
              ? 'مجموعة علامات تجارية سعودية مسجّلة بجودة عالية، نقدّمها لكم بفخر من المملكة إلى العالم.'
              : 'A family of registered Saudi trademarks of the highest quality — proudly delivered from the Kingdom to the world.'}
          </p>
        </div>

        {/* Coverflow */}
        <div
          className="relative w-full max-w-5xl opacity-0 animate-[introUp_1s_ease-out_0.6s_forwards]"
          style={{ perspective: '1400px', height: 'clamp(180px, 32vw, 320px)' }}
        >
          {cards.map((c, i) => {
            const offset = i - 2; // -2,-1,0,1,2
            const isCenter = offset === 0;
            const xPct = offset * 22; // spread in % of container width
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
                  className={`w-full h-full rounded-2xl bg-white/90 backdrop-blur-sm border ${
                    isCenter
                      ? 'border-[hsl(var(--gold))] shadow-[0_20px_60px_-10px_rgba(201,168,76,0.45)]'
                      : 'border-white/60 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)]'
                  } flex items-center justify-center p-3 md:p-4`}
                >
                  <img
                    src={c.image}
                    alt={c.nameAr}
                    className="max-w-full max-h-full object-contain"
                    loading="eager"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Registration strip */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/70 rounded-2xl px-4 sm:px-6 md:px-8 py-3 md:py-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-3 text-[10px] sm:text-[11px] md:text-xs opacity-0 animate-[introUp_0.9s_ease-out_1s_forwards] max-w-2xl w-full">
          <Meta label={isAr ? 'رقم التسجيل' : 'Reg No.'} value={center.registrationNo} />
          <Meta label={isAr ? 'فئة العلامة' : 'Class'} value={center.niceClass.replace('الفئة ', '')} />
          <Meta label={isAr ? 'تاريخ التسجيل' : 'Filed'} value={center.filedHijri} />
          <Meta label={isAr ? 'تاريخ الانتهاء' : 'Expires'} value={center.expiresHijri} />
          <Meta label={isAr ? 'المالك' : 'Owner'} value={center.ownerAr} />
          <Meta label={isAr ? 'النشاط' : 'Activity'} value={center.goodsAr} />
        </div>
      </div>

      <style>{`
        @keyframes introUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center md:items-start font-arabic">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--gold-hi))]">{label}</span>
      <span className="text-foreground/85 font-medium mt-0.5 text-center md:text-start">{value}</span>
    </div>
  );
}
