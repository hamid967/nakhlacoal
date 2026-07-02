/**
 * Unified cinematic gold divider between sections.
 * Responsive height, tokenized colors, decorative only.
 */
type Props = {
  flip?: boolean;
  tone?: 'light' | 'dark';
  /** compact = thinner divider for dense stacks */
  compact?: boolean;
};

export function SectionDivider({ flip = false, tone = 'light', compact = false }: Props) {
  const fill = tone === 'dark' ? 'hsl(var(--background))' : 'hsl(var(--surface-2))';
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={[
        'relative w-full overflow-hidden -my-px pointer-events-none select-none',
        compact ? 'h-8 md:h-12' : 'h-12 md:h-16 lg:h-20',
        flip ? 'rotate-180' : '',
      ].join(' ')}
    >
      {/* Gold hairline — consistent across breakpoints */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/40 to-transparent" />
      {/* Wave */}
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <path
          d="M0,40 C240,72 480,0 720,32 C960,64 1200,16 1440,40 L1440,72 L0,72 Z"
          fill={fill}
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
