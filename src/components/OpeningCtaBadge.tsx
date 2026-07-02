import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

/**
 * OpeningCtaBadge
 * Bilingual (AR/EN) opening badge with a luxury hover:
 * - Sweeping gold shine on hover
 * - Ember pulse dot
 * - Icon slides + rotates 45°
 * - Smooth link transition to /contact
 */
export function OpeningCtaBadge() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="container flex justify-center py-10 md:py-14" dir={isAr ? 'rtl' : 'ltr'}>
      <Link
        to="/contact"
        aria-label={isAr ? 'تواصل مع فحم النخلة' : 'Contact Palm Charcoal'}
        className="group relative inline-flex items-center gap-4 md:gap-5 px-6 md:px-8 py-3 md:py-4 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b09] transition-all duration-500 ease-out hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, rgba(5,11,9,0.9), rgba(13,122,95,0.35))',
          boxShadow:
            'inset 0 0 0 1px rgba(201,168,76,0.4), 0 20px 60px -20px rgba(201,168,76,0.35)',
          color: '#f5f0e0',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Gold sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
          style={{
            background:
              'linear-gradient(120deg, transparent 0%, rgba(201,168,76,0.28) 50%, transparent 100%)',
          }}
        />

        {/* Ember pulse */}
        <span aria-hidden className="relative inline-flex w-2.5 h-2.5 shrink-0">
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(201,168,76,0.7)', animationDuration: '2.4s' }}
          />
          <span
            className="relative inline-block w-2.5 h-2.5 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #e8cf7e, #c9a84c 60%, #7a6428)',
              boxShadow: '0 0 12px rgba(201,168,76,0.9)',
            }}
          />
        </span>

        {/* Bilingual text */}
        <span className="relative flex items-baseline gap-3">
          <span
            className="text-[10px] uppercase tracking-[0.4em]"
            style={{ color: '#c9a84c', fontFamily: 'Fira Sans, sans-serif' }}
          >
            {isAr ? 'ابدأ التجربة' : 'Begin'}
          </span>
          <span
            className="text-lg md:text-xl"
            style={{
              fontFamily: isAr ? 'Amiri, serif' : 'DM Serif Display, serif',
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {isAr ? 'تواصل مع فحم النخلة' : 'Speak to Palm Charcoal'}
          </span>
          <span
            className="hidden md:inline text-[11px] tracking-[0.3em]"
            style={{ color: 'rgba(245,240,224,0.55)', fontFamily: 'Fira Sans, sans-serif' }}
          >
            {isAr ? '· EN / AR' : '· AR / EN'}
          </span>
        </span>

        {/* Icon */}
        <span
          aria-hidden
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 group-hover:rotate-45 group-hover:bg-[rgba(201,168,76,0.25)]"
          style={{
            background: 'rgba(201,168,76,0.12)',
            boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.5)',
            color: '#c9a84c',
          }}
        >
          <ArrowUpRight size={18} />
        </span>
      </Link>
    </div>
  );
}

export default OpeningCtaBadge;
