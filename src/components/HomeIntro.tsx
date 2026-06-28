import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/palm-charcoal-logo.png';

const KEY = 'palm-home-intro-played';

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
    const t1 = setTimeout(() => setPhase('out'), 2400);
    const t2 = setTimeout(() => setPhase('done'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center section-dark transition-opacity duration-700 ease-out ${
        phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden
    >
      {/* Letterbox bars */}
      <div className="absolute inset-x-0 top-0 h-[12vh] bg-black/80" />
      <div className="absolute inset-x-0 bottom-0 h-[12vh] bg-black/80" />

      {/* Ember glow */}
      <div className="absolute inset-0 ember-glow opacity-60 animate-ember" />

      {/* Center stack */}
      <div className="relative flex flex-col items-center text-center px-6">
        <img
          src={logo}
          alt="Palm Charcoal"
          className="h-28 md:h-36 w-auto animate-scale-in drop-shadow-[0_0_40px_rgba(201,168,76,0.55)]"
        />

        {/* Gold rule expands */}
        <span
          className="block h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))] to-transparent mt-6 animate-[introRule_1.2s_ease-out_0.5s_both]"
          style={{ width: '220px' }}
        />

        <div className="mt-5 opacity-0 animate-[introUp_0.9s_ease-out_0.9s_forwards]">
          <div className={`text-[10px] md:text-xs uppercase tracking-[0.45em] text-[hsl(var(--gold-hi))] font-arabic`}>
            {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
          </div>
          <div className={`mt-3 text-xl md:text-3xl text-background ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
            {isAr ? 'جودة طبيعية.. احتراق يدوم' : 'Natural Quality. Lasting Burn.'}
          </div>
        </div>
      </div>

      {/* Skip */}
      <button
        onClick={() => setPhase('done')}
        className="absolute top-6 end-6 text-[11px] tracking-[0.3em] uppercase text-background/60 hover:text-[hsl(var(--gold-hi))] transition-colors font-arabic z-10"
      >
        {isAr ? 'تخطي' : 'Skip'}
      </button>

      <style>{`
        @keyframes introRule { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
        @keyframes introUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
