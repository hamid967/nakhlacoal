import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function TaglineStrip() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const words = isAr
    ? ['نقاء', 'استدامة', 'تميّز']
    : ['Purity', 'Sustainability', 'Excellence'];

  return (
    <>
      {/* Spacer so page content isn't covered by the fixed nav + strip */}
      <div aria-hidden className={scrolled ? 'h-[92px] md:h-[100px]' : 'h-[108px] md:h-[116px]'} />
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className={`fixed inset-x-0 z-40 border-y border-[hsl(var(--gold))]/25 bg-[hsl(var(--dark-2))] backdrop-blur-md transition-all duration-500 ${
          scrolled ? 'top-[64px] md:top-[72px]' : 'top-[80px] md:top-[88px]'
        }`}
        role="note"
        aria-label={isAr ? 'شعار العلامة' : 'Brand tagline'}
      >
        <div className="container flex items-center justify-center gap-4 sm:gap-8 py-2">
          {words.map((w, i) => (
            <span key={w} className="flex items-center gap-4 sm:gap-8">
              <span
                className={`text-[11px] sm:text-xs tracking-[0.4em] uppercase font-semibold text-[hsl(var(--gold-hi))] ${
                  isAr ? 'font-arabic' : 'font-display'
                }`}
              >
                {w}.
              </span>
              {i < words.length - 1 && (
                <span aria-hidden className="h-1 w-1 rounded-full bg-[hsl(var(--gold-hi))]" />
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
