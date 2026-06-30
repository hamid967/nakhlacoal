import { useTranslation } from 'react-i18next';

export function TaglineStrip() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const words = isAr
    ? ['نقاء', 'استدامة', 'تميّز']
    : ['Purity', 'Sustainability', 'Excellence'];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="w-full border-y border-[hsl(var(--gold))]/20 bg-[hsl(var(--dark))]/70 backdrop-blur-md"
      role="note"
      aria-label={isAr ? 'شعار العلامة' : 'Brand tagline'}
    >
      <div className="container flex items-center justify-center gap-4 sm:gap-8 py-2">
        {words.map((w, i) => (
          <span key={w} className="flex items-center gap-4 sm:gap-8">
            <span
              className={`text-[11px] sm:text-xs tracking-[0.4em] uppercase text-[hsl(var(--gold-hi))] ${
                isAr ? 'font-arabic' : 'font-display'
              }`}
            >
              {w}{isAr ? '.' : '.'}
            </span>
            {i < words.length - 1 && (
              <span
                aria-hidden
                className="h-1 w-1 rounded-full bg-[hsl(var(--gold))]/70"
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
