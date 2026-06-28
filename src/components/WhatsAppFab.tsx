import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';
import { AssistantWidget } from './AssistantWidget';
import logo from '@/assets/palm-charcoal-logo.png';

export function WhatsAppFab() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={wrapRef}>
      <AssistantWidget open={open} onClose={() => setOpen(false)} />

      {/* "اضغط هنا للطلب" label */}
      {!open && (
        <div
          className="fixed bottom-9 end-24 z-50 pointer-events-none animate-fade-in"
          aria-hidden
        >
          <div className="relative px-3.5 py-2 rounded-full bg-dark text-cream text-xs font-semibold font-arabic shadow-gold border border-gold/40 whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-hi motion-safe:animate-pulse" />
            {isAr ? 'اضغط هنا للطلب' : 'Tap to order'}
            {/* arrow pointing to FAB */}
            <span className="absolute top-1/2 -translate-y-1/2 -end-1.5 w-3 h-3 rotate-45 bg-dark border-t border-e border-gold/40" />
          </div>
        </div>
      )}

      {/* Branded AI FAB — "Living Ember" (جمرة حيّة) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? 'مساعد فحم النخلة — اضغط هنا للطلب' : 'Palm Charcoal AI — tap to order'}
        aria-expanded={open}
        className={`fixed bottom-6 end-6 z-50 w-[72px] h-[72px] rounded-full flex items-center justify-center group transition-all duration-500 ease-out ${
          open ? 'scale-90 rotate-90' : 'scale-100 rotate-0 hover:scale-110'
        }`}
      >
        {/* Outer ember halo — soft red glow */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full motion-safe:animate-ping"
            style={{ background: 'radial-gradient(circle, hsl(15 90% 55% / 0.55) 0%, transparent 70%)' }}
            aria-hidden
          />
        )}
        {/* Ember core — charcoal black with red-hot center */}
        <span
          className="relative w-[68px] h-[68px] rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 60%, hsl(18 100% 58%) 0%, hsl(8 85% 38%) 22%, hsl(0 60% 16%) 50%, hsl(0 0% 6%) 82%)',
            boxShadow:
              'inset 0 0 18px hsl(15 100% 50% / 0.55), inset 0 -6px 14px hsl(0 0% 0% / 0.7), 0 0 0 1.5px hsl(var(--gold) / 0.55), 0 10px 32px hsl(15 90% 45% / 0.5)',
          }}
        >
          {/* Inner pulsing red-hot glow */}
          <span
            className="absolute inset-0 rounded-full motion-safe:animate-ember-pulse pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 65%, hsl(22 100% 62% / 0.9) 0%, hsl(10 90% 45% / 0.4) 30%, transparent 60%)',
              mixBlendMode: 'screen',
            }}
            aria-hidden
          />
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
            <img
              src={logo}
              alt=""
              width={50}
              height={50}
              className="relative w-[50px] h-[50px] object-contain"
              style={{ filter: 'drop-shadow(0 0 8px hsl(45 90% 70% / 0.85)) drop-shadow(0 0 4px hsl(20 100% 55% / 0.6))' }}
            />
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
            <X className="w-6 h-6 text-gold-hi relative" />
          </span>
        </span>
        {!open && (
          <Sparkles className="absolute -top-1 -end-1 w-5 h-5 text-gold-hi drop-shadow-[0_0_6px_hsl(var(--gold-hi))] motion-safe:animate-pulse" />
        )}
      </button>
    </div>
  );
}
