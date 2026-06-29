import { ReactNode } from 'react';

/** Editorial section chip + title in the style of the showcase mockups (01 الصفحة الرئيسية). */
export function SectionChip({ number, label }: { number: string | number; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[hsl(var(--brand-green,158_45%_22%))] text-white text-sm font-semibold tabular-nums shadow-sm">
        {String(number).padStart(2, '0')}
      </span>
      <span className="text-sm md:text-base font-medium text-foreground/80">{label}</span>
    </div>
  );
}

/** Soft palm-leaf decoration for editorial page corners. Pure SVG, no asset weight. */
export function PalmCorner({
  position = 'top-left',
  className = '',
  opacity = 0.18,
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  opacity?: number;
}) {
  const map: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 -scale-x-100',
    'bottom-left': 'bottom-0 left-0 -scale-y-100',
    'bottom-right': 'bottom-0 right-0 -scale-100',
  };
  return (
    <svg
      aria-hidden
      viewBox="0 0 280 280"
      className={`pointer-events-none absolute w-[220px] md:w-[300px] ${map[position]} ${className}`}
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="palmG" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(158 45% 30%)" />
          <stop offset="100%" stopColor="hsl(48 60% 55%)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#palmG)" strokeWidth="1.4" strokeLinecap="round">
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 8) * 70 - 5;
          const r = a * (Math.PI / 180);
          const x2 = 20 + Math.cos(r) * 230;
          const y2 = 20 + Math.sin(r) * 230;
          return <line key={i} x1="20" y1="20" x2={x2} y2={y2} />;
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 8) * 70 - 5;
          const r = a * (Math.PI / 180);
          const cx = 20 + Math.cos(r) * 230;
          const cy = 20 + Math.sin(r) * 230;
          return Array.from({ length: 8 }).map((__, j) => {
            const t = (j + 1) / 9;
            const fx = 20 + Math.cos(r) * 230 * t;
            const fy = 20 + Math.sin(r) * 230 * t;
            const perp = r + Math.PI / 2;
            const len = 14;
            return (
              <line
                key={`${i}-${j}`}
                x1={fx}
                y1={fy}
                x2={fx + Math.cos(perp) * len}
                y2={fy + Math.sin(perp) * len}
                strokeWidth="0.9"
              />
            );
          });
        })}
      </g>
    </svg>
  );
}

/** Numbered editorial hero used at the top of each page (matches showcase mockups). */
export function PageHero({
  number,
  eyebrow,
  title,
  subtitle,
  actions,
  decor = true,
}: {
  number: string | number;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  decor?: boolean;
}) {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-32 pb-10 md:pb-14">
      {decor && (
        <>
          <PalmCorner position="top-left" />
          <PalmCorner position="top-right" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <SectionChip number={number} label={eyebrow} />
        <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base md:text-lg text-foreground/65 leading-relaxed">
            {subtitle}
          </p>
        )}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
