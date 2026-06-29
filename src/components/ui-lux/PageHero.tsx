import { ReactNode } from 'react';

/** Editorial section chip in the style of the showcase mockups (e.g. "01 الصفحة الرئيسية"). */
export function SectionChip({ number, label }: { number: string | number; label?: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 select-none mb-6">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[hsl(158_45%_22%)] text-white text-sm font-semibold tabular-nums shadow-sm">
        {String(number).padStart(2, '0')}
      </span>
      {label && <span className="text-sm md:text-base font-medium text-foreground/75">{label}</span>}
    </div>
  );
}

/** Soft palm-leaf SVG for editorial page corners. No external asset weight. */
export function PalmCorner({
  position = 'top-left',
  className = '',
  opacity = 0.16,
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
  const fronds = Array.from({ length: 9 }, (_, i) => (i / 8) * 70 - 5);
  return (
    <svg
      aria-hidden
      viewBox="0 0 280 280"
      className={`pointer-events-none absolute w-[220px] md:w-[320px] ${map[position]} ${className}`}
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="palmG" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(158 45% 28%)" />
          <stop offset="100%" stopColor="hsl(48 60% 55%)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#palmG)" strokeWidth="1.3" strokeLinecap="round">
        {fronds.map((a, i) => {
          const r = (a * Math.PI) / 180;
          const x2 = 18 + Math.cos(r) * 240;
          const y2 = 18 + Math.sin(r) * 240;
          return <line key={`m${i}`} x1="18" y1="18" x2={x2} y2={y2} />;
        })}
        {fronds.map((a, i) => {
          const r = (a * Math.PI) / 180;
          const perp = r + Math.PI / 2;
          return Array.from({ length: 8 }, (_, j) => {
            const t = (j + 1) / 9;
            const fx = 18 + Math.cos(r) * 240 * t;
            const fy = 18 + Math.sin(r) * 240 * t;
            return (
              <line
                key={`f${i}-${j}`}
                x1={fx}
                y1={fy}
                x2={fx + Math.cos(perp) * 13}
                y2={fy + Math.sin(perp) * 13}
                strokeWidth="0.85"
              />
            );
          });
        })}
      </g>
    </svg>
  );
}
