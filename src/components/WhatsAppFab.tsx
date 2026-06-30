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

  // Allow other pages (e.g. /quote) to open the assistant via custom event
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('palm:open-assistant', onOpen);
    return () => window.removeEventListener('palm:open-assistant', onOpen);
  }, []);

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

      {/* Branded AI FAB — Palm Charcoal logo */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? 'مساعد فحم النخلة — اضغط هنا للطلب' : 'Palm Charcoal AI — tap to order'}
        aria-expanded={open}
        className={`fixed bottom-6 end-6 z-50 w-[72px] h-[72px] rounded-full flex items-center justify-center shadow-gold group transition-all duration-500 ease-out ${
          open ? 'scale-90 rotate-90' : 'scale-100 rotate-0 hover:scale-110'
        }`}
        style={{
          background:
            'radial-gradient(circle at 30% 25%, hsl(var(--gold-hi)) 0%, hsl(var(--gold)) 50%, hsl(var(--dark)) 100%)',
          boxShadow: '0 0 0 2px hsl(var(--gold) / 0.4), 0 8px 32px hsl(var(--gold) / 0.45)',
        }}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-gold/40 motion-safe:animate-ping" />}
        <span className="relative w-[58px] h-[58px] rounded-full bg-dark flex items-center justify-center overflow-hidden ring-1 ring-gold/50">
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
            <img
              src={logo}
              alt=""
              width={52}
              height={52}
              className="w-[52px] h-[52px] object-contain drop-shadow-[0_0_8px_hsl(var(--gold-hi)/0.6)]"
            />
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
            <X className="w-6 h-6 text-gold-hi" />
          </span>
        </span>
        {!open && (
          <Sparkles className="absolute -top-1 -end-1 w-5 h-5 text-gold-hi drop-shadow-[0_0_6px_hsl(var(--gold-hi))] motion-safe:animate-pulse" />
        )}
      </button>
    </div>
  );
}
