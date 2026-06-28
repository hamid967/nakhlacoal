import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import logo from '@/assets/palm-charcoal-logo.png';


export function WhatsAppFab() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
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
        <div className="relative px-3.5 py-2 rounded-full bg-dark/95 backdrop-blur-md text-cream text-xs font-semibold font-arabic shadow-gold border border-gold/50 whitespace-nowrap">
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

      {/* Premium Palm Charcoal AI FAB — perfectly circular */}
      <button
        type="button"
        onClick={() => navigate('/assistant')}
        aria-label={isAr ? 'مساعد فحم النخلة — اضغط هنا للطلب' : 'Palm Charcoal AI — tap to order'}
        className="fixed bottom-6 end-6 z-50 w-20 h-20 rounded-full flex items-center justify-center group transition-transform duration-500 ease-out hover:scale-110 motion-safe:animate-fab-float"
      >
        {/* Outer luxury halo */}
        <span
          className="absolute -inset-3 rounded-full motion-safe:animate-halo-breathe pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--gold-hi) / 0.4) 0%, hsl(var(--gold) / 0.2) 40%, transparent 72%)',
            filter: 'blur(10px)',
          }}
          aria-hidden
        />

        {/* SVG rotating gold rings — guarantees perfect circle */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none motion-safe:animate-gold-spin"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient id="fab-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45 95% 75%)" />
              <stop offset="50%" stopColor="hsl(45 90% 55%)" />
              <stop offset="100%" stopColor="hsl(38 80% 45%)" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#fab-gold-grad)"
            strokeWidth="1.5"
            strokeDasharray="60 40 30 50 20 60"
            strokeLinecap="round"
            opacity="0.95"
          />
        </svg>
        <svg
          className="absolute inset-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] pointer-events-none motion-safe:animate-gold-spin-reverse"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="hsl(45 90% 70%)"
            strokeWidth="0.6"
            strokeDasharray="2 8"
            opacity="0.7"
          />
        </svg>

        {/* Charcoal core — perfectly round */}
        <span
          className="relative w-[68px] h-[68px] aspect-square rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, hsl(0 0% 20%) 0%, hsl(0 0% 8%) 55%, hsl(0 0% 3%) 100%)',
            boxShadow:
              'inset 0 1px 0 hsl(45 80% 75% / 0.4), inset 0 -10px 22px hsl(0 0% 0% / 0.85), 0 0 0 1.5px hsl(var(--gold) / 0.7), 0 14px 40px hsl(0 0% 0% / 0.55), 0 0 30px hsl(var(--gold) / 0.35)',
          }}
        >
          {/* Silky gold light sweep */}
          <span
            className="absolute inset-0 motion-safe:animate-gold-sweep pointer-events-none"
            style={{
              background:
                'linear-gradient(100deg, transparent 35%, hsl(45 95% 80% / 0.35) 50%, transparent 65%)',
              mixBlendMode: 'screen',
            }}
            aria-hidden
          />

          {/* Gold vignette */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 100%, hsl(var(--gold) / 0.25) 0%, transparent 60%)',
            }}
            aria-hidden
          />

          {/* Palm Charcoal logo — larger & crisper */}
          <img
            src={logo}
            alt=""
            width={56}
            height={56}
            className="relative w-14 h-14 object-contain transition-transform duration-500 group-hover:scale-105"
            style={{
              filter:
                'drop-shadow(0 0 14px hsl(45 95% 72% / 0.75)) drop-shadow(0 2px 3px hsl(0 0% 0% / 0.8)) brightness(1.15) contrast(1.1)',
            }}
          />
        </span>

        {/* Sparkle accents */}
        <span
          className="absolute top-1 end-3 w-1.5 h-1.5 rounded-full bg-gold-hi motion-safe:animate-ember-pulse pointer-events-none"
          style={{ boxShadow: '0 0 8px hsl(var(--gold-hi))' }}
          aria-hidden
        />
        <span
          className="absolute bottom-3 start-1 w-1 h-1 rounded-full bg-gold motion-safe:animate-ember-pulse pointer-events-none"
          style={{ boxShadow: '0 0 6px hsl(var(--gold))', animationDelay: '1.4s' }}
          aria-hidden
        />
      </button>
    </div>
  );
}
