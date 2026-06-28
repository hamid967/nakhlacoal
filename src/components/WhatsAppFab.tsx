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

      {/* Branded AI FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? 'مساعد فحم النخلة الذكي' : 'Palm Charcoal AI assistant'}
        aria-expanded={open}
        className={`fixed bottom-6 end-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-gold group transition-all duration-500 ease-out ${
          open ? 'scale-90 rotate-90' : 'scale-100 rotate-0 hover:scale-110'
        }`}
        style={{
          background:
            'radial-gradient(circle at 30% 30%, hsl(var(--gold-hi)) 0%, hsl(var(--gold)) 45%, hsl(var(--dark)) 100%)',
        }}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-gold/30 motion-safe:animate-ping" />}
        <span className="relative w-12 h-12 rounded-full bg-dark flex items-center justify-center overflow-hidden">
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
            <img src={logo} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
            <X className="w-5 h-5 text-gold-hi" />
          </span>
        </span>
        {!open && (
          <Sparkles className="absolute -top-1 -end-1 w-5 h-5 text-gold-hi drop-shadow-[0_0_6px_hsl(var(--gold-hi))] motion-safe:animate-pulse" />
        )}
      </button>
    </div>
  );
}
