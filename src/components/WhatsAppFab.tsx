import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '@/assets/palm-charcoal-logo.png';

export function WhatsAppFab() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAr = i18n.language?.startsWith('ar');
  const onAssistantPage = location.pathname.startsWith('/assistant');

  if (onAssistantPage) return null;

  return (
    <div>
      {/* "اضغط هنا للطلب" label */}
      <div
        className="fixed bottom-10 end-28 z-50 pointer-events-none animate-fade-in"
        aria-hidden
      >
        <div className="relative px-3.5 py-2 rounded-full bg-dark/95 backdrop-blur-md text-cream text-xs font-semibold font-arabic shadow-gold border border-gold/50 whitespace-nowrap overflow-hidden">
          <span
            className="relative z-10 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, hsl(var(--gold-hi)) 0%, hsl(45 95% 88%) 50%, hsl(var(--gold)) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3.5s ease-in-out infinite',
            }}
          >
            {isAr ? 'اضغط هنا للطلب' : 'Tap to order'}
          </span>
          <span className="absolute top-1/2 -translate-y-1/2 -end-1.5 w-3 h-3 rotate-45 bg-dark border-t border-e border-gold/50" />
        </div>
      </div>

      {/* Premium Palm Charcoal AI FAB */}
      <button
        type="button"
        onClick={() => navigate('/assistant')}
        aria-label={isAr ? 'مساعد فحم النخلة — اضغط هنا للطلب' : 'Palm Charcoal AI — tap to order'}
        className="fixed bottom-6 end-6 z-50 w-[78px] h-[78px] rounded-full flex items-center justify-center group transition-transform duration-500 ease-out hover:scale-110 motion-safe:animate-fab-float"
      >
        {/* Outer luxury halo */}
        <span
          className="absolute -inset-3 rounded-full motion-safe:animate-halo-breathe pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--gold-hi) / 0.35) 0%, hsl(var(--gold) / 0.18) 40%, transparent 72%)',
            filter: 'blur(8px)',
          }}
          aria-hidden
        />

        {/* Rotating gold conic ring */}
        <span
          className="absolute -inset-[3px] rounded-full motion-safe:animate-gold-spin pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, hsl(var(--gold-hi)) 0deg, transparent 70deg, hsl(var(--gold)) 180deg, transparent 250deg, hsl(var(--gold-hi)) 360deg)',
            WebkitMask: 'radial-gradient(circle, transparent 62%, #000 64%)',
                    mask: 'radial-gradient(circle, transparent 62%, #000 64%)',
          }}
          aria-hidden
        />

        {/* Counter-rotating thin ring */}
        <span
          className="absolute -inset-[1px] rounded-full motion-safe:animate-gold-spin-reverse pointer-events-none opacity-70"
          style={{
            background:
              'conic-gradient(from 180deg, transparent 0deg, hsl(45 95% 85%) 90deg, transparent 180deg, hsl(var(--gold)) 270deg, transparent 360deg)',
            WebkitMask: 'radial-gradient(circle, transparent 70%, #000 71%)',
                    mask: 'radial-gradient(circle, transparent 70%, #000 71%)',
          }}
          aria-hidden
        />

        {/* Charcoal core with logo */}
        <span
          className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, hsl(0 0% 18%) 0%, hsl(0 0% 8%) 55%, hsl(0 0% 3%) 100%)',
            boxShadow:
              'inset 0 1px 0 hsl(45 80% 75% / 0.35), inset 0 -10px 22px hsl(0 0% 0% / 0.85), 0 0 0 1px hsl(var(--gold) / 0.55), 0 14px 40px hsl(0 0% 0% / 0.55), 0 0 28px hsl(var(--gold) / 0.3)',
          }}
        >
          {/* Silky gold light sweep */}
          <span
            className="absolute inset-0 motion-safe:animate-gold-sweep pointer-events-none"
            style={{
              background:
                'linear-gradient(100deg, transparent 35%, hsl(45 95% 80% / 0.32) 50%, transparent 65%)',
              mixBlendMode: 'screen',
            }}
            aria-hidden
          />

          {/* Inner gold vignette */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 100%, hsl(var(--gold) / 0.22) 0%, transparent 55%)',
            }}
            aria-hidden
          />

          {/* Palm Charcoal logo */}
          <img
            src={logo}
            alt=""
            width={54}
            height={54}
            className="relative w-[54px] h-[54px] object-contain transition-transform duration-500 group-hover:scale-105"
            style={{
              filter:
                'drop-shadow(0 0 12px hsl(45 95% 72% / 0.65)) drop-shadow(0 2px 3px hsl(0 0% 0% / 0.7))',
            }}
          />
        </span>

        {/* Sparkle accents */}
        <span
          className="absolute -top-0.5 end-2 w-1.5 h-1.5 rounded-full bg-gold-hi motion-safe:animate-ember-pulse pointer-events-none"
          style={{ boxShadow: '0 0 8px hsl(var(--gold-hi))' }}
          aria-hidden
        />
        <span
          className="absolute bottom-2 -start-0.5 w-1 h-1 rounded-full bg-gold motion-safe:animate-ember-pulse pointer-events-none"
          style={{ boxShadow: '0 0 6px hsl(var(--gold))', animationDelay: '1.4s' }}
          aria-hidden
        />
      </button>
    </div>
  );
}
