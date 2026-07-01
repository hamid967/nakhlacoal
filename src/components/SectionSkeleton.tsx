/**
 * Reserved-height skeletons for lazy-loaded sections.
 * Prevents CLS while Suspense chunks resolve. Announces politely to screen readers.
 * Batch 3 additions mirror the actual layout of each section so the fallback
 * doesn't collapse into an empty gap.
 */
type Variant =
  | 'hero'
  | 'grid'
  | 'timeline'
  | 'band'
  | 'press'
  | 'awards'
  | 'constellation'
  | 'film'
  | 'cases'
  | 'map';

const HEIGHTS: Record<Variant, string> = {
  hero: 'min-h-[70vh]',
  grid: 'min-h-[480px]',
  timeline: 'min-h-[560px]',
  band: 'min-h-[320px]',
  press: 'min-h-[220px]',
  awards: 'min-h-[260px]',
  constellation: 'min-h-[520px]',
  film: 'min-h-[640px]',
  cases: 'min-h-[560px]',
  map: 'min-h-[600px]',
};

function BaseWrap({
  variant,
  label,
  children,
}: {
  variant: Variant;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${HEIGHTS[variant]} w-full grid place-items-center bg-[#0B0B0B]`}
    >
      <div className="container w-full">
        {children}
        <span className="sr-only">{label ?? 'Loading section'}</span>
      </div>
    </div>
  );
}

export function SectionSkeleton({
  variant = 'grid',
  label,
}: {
  variant?: Variant;
  label?: string;
}) {
  switch (variant) {
    case 'press':
      // Row of 6 muted logo pills
      return (
        <BaseWrap variant={variant} label={label}>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 py-10 opacity-60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-6 md:h-7 w-24 md:w-28 rounded-sm bg-white/10"
              />
            ))}
          </div>
        </BaseWrap>
      );

    case 'awards':
      // Marquee-like track of gold ribbon chips
      return (
        <BaseWrap variant={variant} label={label}>
          <div className="relative overflow-hidden py-10">
            <div className="flex gap-6 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 h-16 w-56 rounded-full border border-[hsl(46_90%_50%/0.25)] bg-gradient-to-r from-[hsl(46_90%_50%/0.08)] to-transparent"
                />
              ))}
            </div>
          </div>
        </BaseWrap>
      );

    case 'constellation':
      // Central node with orbiting placeholders
      return (
        <BaseWrap variant={variant} label={label}>
          <div className="relative h-[420px] md:h-[480px] w-full">
            <div className="absolute inset-0 grid place-items-center">
              <div className="animate-pulse h-24 w-24 rounded-full bg-[hsl(46_90%_50%/0.15)] border border-[hsl(46_90%_50%/0.3)]" />
            </div>
            {[
              'top-6 left-1/4',
              'top-10 right-1/4',
              'bottom-8 left-1/3',
              'bottom-12 right-1/3',
              'top-1/2 left-6',
              'top-1/2 right-6',
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} animate-pulse h-10 w-10 rounded-full bg-white/5 border border-white/10`}
              />
            ))}
          </div>
        </BaseWrap>
      );

    case 'film':
      // Cinematic 16:9-ish poster block with caption bar
      return (
        <BaseWrap variant={variant} label={label}>
          <div className="py-8">
            <div className="mx-auto mb-8 h-4 w-40 rounded bg-white/10 animate-pulse" />
            <div className="mx-auto mb-10 h-8 md:h-10 w-2/3 rounded bg-white/10 animate-pulse" />
            <div className="relative rounded-3xl overflow-hidden border border-[hsl(46_90%_50%/0.2)] bg-black/60">
              <div className="animate-pulse h-[380px] md:h-[520px] w-full bg-gradient-to-b from-white/[0.04] to-black/60" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <div className="h-3 w-3/4 max-w-xl rounded bg-white/10 mb-3 animate-pulse" />
                <div className="h-3 w-1/2 max-w-md rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </BaseWrap>
      );

    case 'cases':
      // Header row + big card + dots (mirrors CaseStudies layout)
      return (
        <BaseWrap variant={variant} label={label}>
          <div className="py-8">
            <div className="mb-10 flex items-end justify-between">
              <div className="space-y-3">
                <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-8 md:h-10 w-72 md:w-[28rem] rounded bg-white/10 animate-pulse" />
              </div>
              <div className="hidden md:flex gap-2">
                <div className="h-11 w-11 rounded-full bg-white/5 border border-[hsl(46_90%_50%/0.2)] animate-pulse" />
                <div className="h-11 w-11 rounded-full bg-white/5 border border-[hsl(46_90%_50%/0.2)] animate-pulse" />
              </div>
            </div>
            <div className="rounded-3xl border border-[hsl(46_90%_50%/0.2)] bg-white/[0.02] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
                <div className="h-8 w-3/4 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-11/12 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="rounded-2xl border border-[hsl(46_90%_50%/0.2)] bg-black/40 p-8 grid place-items-center">
                <div className="h-16 w-32 rounded bg-[hsl(46_90%_50%/0.15)] animate-pulse" />
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-1.5 w-6 rounded-full bg-white/15 animate-pulse" />
              ))}
            </div>
          </div>
        </BaseWrap>
      );

    default:
      return (
        <BaseWrap variant={variant} label={label}>
          <div className="animate-pulse rounded-3xl bg-gold/5 border border-gold/10 h-40 md:h-56 w-full" />
        </BaseWrap>
      );
  }
}
