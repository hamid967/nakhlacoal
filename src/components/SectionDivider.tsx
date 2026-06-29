/**
 * Cinematic gold divider between sections.
 * Animated SVG wave with grain overlay — purely decorative.
 */
type Props = { flip?: boolean; tone?: 'light' | 'dark' };

export function SectionDivider({ flip = false, tone = 'light' }: Props) {
  const fill = tone === 'dark' ? 'hsl(var(--background))' : 'hsl(var(--surface-2))';
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden -my-px pointer-events-none ${flip ? 'rotate-180' : ''}`}
      style={{ height: 72 }}
    >
      {/* Gold hairline */}
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
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
}
