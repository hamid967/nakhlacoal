import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';
import { AssistantWidget } from './AssistantWidget';
import logo from '@/assets/palm-charcoal-logo.png';

export function WhatsAppFab() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [open, setOpen] = useState(false);

  return (
    <>
      <AssistantWidget open={open} onClose={() => setOpen(false)} />

      {/* Branded AI FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={isAr ? 'مساعد فحم النخلة الذكي' : 'Palm Charcoal AI assistant'}
        aria-expanded={open}
        className="fixed bottom-6 end-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-gold transition-transform duration-500 hover:scale-110 group"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, hsl(var(--gold-hi)) 0%, hsl(var(--gold)) 45%, hsl(var(--dark)) 100%)',
        }}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-gold/30 motion-safe:animate-ping" />}
        <span className="relative w-12 h-12 rounded-full bg-dark flex items-center justify-center overflow-hidden">
          {open ? (
            <X className="w-5 h-5 text-gold-hi" />
          ) : (
            <img src={logo} alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          )}
        </span>
        {!open && (
          <Sparkles className="absolute -top-1 -end-1 w-5 h-5 text-gold-hi drop-shadow-[0_0_6px_hsl(var(--gold-hi))] motion-safe:animate-pulse" />
        )}
      </button>
    </>
  );
}
