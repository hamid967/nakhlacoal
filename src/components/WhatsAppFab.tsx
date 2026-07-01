import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';
import { AssistantWidget } from './AssistantWidget';
import { BrandLogo } from '@/components/BrandLogo';

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

  // Allow other pages (e.g. /quote) to open the assistant via custom event
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('palm:open-assistant', onOpen);
    return () => window.removeEventListener('palm:open-assistant', onOpen);
  }, []);

  return (
    <div ref={wrapRef}>
      <AssistantWidget open={open} onClose={() => setOpen(false)} />

      {/* "اضغط هنا للطلب" — refined pill */}
      {!open && (
        <div className="fixed bottom-10 end-24 z-50 pointer-events-none animate-fade-in" aria-hidden>
          <div className="relative px-4 py-2 rounded-full bg-gradient-to-b from-dark to-[hsl(var(--dark)/0.92)] text-cream text-[11px] font-semibold font-arabic tracking-wide border border-gold/50 whitespace-nowrap flex items-center gap-2 shadow-[0_10px_30px_-8px_hsl(var(--gold)/0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-gold-hi motion-safe:animate-pulse" />
            <span className="bg-gradient-to-l from-gold-hi to-cream bg-clip-text text-transparent">
              {isAr ? 'اضغط هنا لطلبك الآن' : 'Tap to order now'}
            </span>
            <span className="absolute top-1/2 -translate-y-1/2 -end-1.5 w-3 h-3 rotate-45 bg-dark border-t border-e border-gold/50" />
          </div>
        </div>
      )}

      {/* Branded AI FAB — refined luxury */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? 'مساعد فحم النخلة — اضغط هنا للطلب' : 'Palm Charcoal AI — tap to order'}
        aria-expanded={open}
        className={`fixed bottom-6 end-6 z-50 w-[68px] h-[68px] rounded-full flex items-center justify-center group transition-all duration-500 ease-out ${
          open ? 'scale-90 rotate-45' : 'scale-100 rotate-0 hover:scale-[1.08]'
        }`}
        style={{
          background: 'conic-gradient(from 220deg at 50% 50%, hsl(var(--gold-hi)), hsl(var(--gold)) 35%, hsl(var(--dark)) 60%, hsl(var(--gold)) 90%, hsl(var(--gold-hi)))',
          boxShadow: '0 0 0 1px hsl(var(--gold) / 0.55), 0 12px 40px -6px hsl(var(--gold) / 0.55), inset 0 1px 0 hsl(var(--gold-hi) / 0.6)',
        }}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-gold/30 motion-safe:animate-ping" />}
        <span className="relative w-[56px] h-[56px] rounded-full bg-gradient-to-b from-[hsl(var(--dark))] to-[hsl(0_0%_5%)] flex items-center justify-center overflow-hidden ring-1 ring-gold/40">
          {/* inner subtle glow */}
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_30%,hsl(var(--gold-hi)/0.28),transparent_65%)]" />
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-0 scale-50 rotate-45' : 'opacity-100 scale-100 rotate-0'}`}>
            <BrandLogo
              alt=""
              width={44}
              height={44}
              className="w-[44px] h-[44px] object-contain drop-shadow-[0_0_10px_hsl(var(--gold-hi)/0.65)]"
            />

          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
            <X className="w-6 h-6 text-gold-hi" />
          </span>
        </span>
        {!open && (
          <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-dark border border-gold/60 flex items-center justify-center shadow-gold">
            <Sparkles className="w-3 h-3 text-gold-hi motion-safe:animate-pulse" />
          </span>
        )}
      </button>
    </div>
  );
}
