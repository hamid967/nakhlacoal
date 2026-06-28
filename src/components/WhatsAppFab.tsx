import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import logo from '@/assets/palm-charcoal-logo.png';

export function WhatsAppFab() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAr = i18n.language?.startsWith('ar');
  const onAssistantPage = location.pathname.startsWith('/assistant');

  if (onAssistantPage) return null;

  const open = false; // assistant lives on its own route now

  return (
    <div>
      {/* "اضغط هنا للطلب" label */}
      <div
        className="fixed bottom-9 end-24 z-50 pointer-events-none animate-fade-in"
        aria-hidden
      >
        <div className="relative px-3.5 py-2 rounded-full bg-dark text-cream text-xs font-semibold font-arabic shadow-gold border border-gold/40 whitespace-nowrap flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-hi motion-safe:animate-pulse" />
          {isAr ? 'اضغط هنا للطلب' : 'Tap to order'}
          <span className="absolute top-1/2 -translate-y-1/2 -end-1.5 w-3 h-3 rotate-45 bg-dark border-t border-e border-gold/40" />
        </div>
      </div>


      {/* Branded AI FAB — "Living Ember" (جمرة حيّة) */}
      <button
        type="button"
        onClick={() => navigate('/assistant')}
        aria-label={isAr ? 'مساعد فحم النخلة — اضغط هنا للطلب' : 'Palm Charcoal AI — tap to order'}
        aria-expanded={open}
        className={`fixed bottom-6 end-6 z-50 w-[72px] h-[72px] rounded-full flex items-center justify-center group transition-all duration-500 ease-out ${
          open ? 'scale-90 rotate-90' : 'scale-100 rotate-0 hover:scale-110'
        }`}
      >
        {/* Outer ember halo — softer, layered glow */}
        {!open && (
          <>
            <span
              className="absolute -inset-2 rounded-full motion-safe:animate-ember-pulse pointer-events-none"
              style={{ background: 'radial-gradient(circle, hsl(20 85% 55% / 0.28) 0%, hsl(15 80% 45% / 0.12) 45%, transparent 72%)', filter: 'blur(6px)' }}
              aria-hidden
            />
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, hsl(40 90% 60% / 0.18) 0%, transparent 65%)' }}
              aria-hidden
            />
          </>
        )}
        {/* Ember core — refined charcoal with deep glowing center */}
        <span
          className="relative w-[68px] h-[68px] rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 62%, hsl(22 95% 52%) 0%, hsl(10 80% 32%) 24%, hsl(0 45% 12%) 52%, hsl(0 0% 5%) 84%)',
            boxShadow:
              'inset 0 0 22px hsl(15 95% 45% / 0.45), inset 0 -8px 18px hsl(0 0% 0% / 0.75), inset 0 1px 0 hsl(45 80% 70% / 0.25), 0 0 0 1px hsl(var(--gold) / 0.45), 0 12px 36px hsl(15 85% 35% / 0.4), 0 4px 12px hsl(0 0% 0% / 0.5)',
          }}
        >
          {/* Inner pulsing ember — softer, more diffused */}
          <span
            className="absolute inset-0 rounded-full motion-safe:animate-ember-pulse pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 68%, hsl(24 100% 60% / 0.55) 0%, hsl(12 85% 42% / 0.22) 35%, transparent 65%)',
              mixBlendMode: 'screen',
              filter: 'blur(1px)',
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
              style={{ filter: 'drop-shadow(0 0 10px hsl(45 95% 72% / 0.55)) drop-shadow(0 1px 2px hsl(0 0% 0% / 0.6))' }}
            />
          </span>
        </span>
        {!open && (
          <Sparkles className="absolute -top-1 -end-1 w-5 h-5 text-gold-hi drop-shadow-[0_0_6px_hsl(var(--gold-hi))] motion-safe:animate-pulse" />
        )}
      </button>
    </div>
  );
}
