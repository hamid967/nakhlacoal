/**
 * Reserved-height skeleton for lazy-loaded sections.
 * Prevents CLS while Suspense chunks resolve. Announces politely to screen readers.
 */
type Variant = 'hero' | 'grid' | 'timeline' | 'band';

const HEIGHTS: Record<Variant, string> = {
  hero: 'min-h-[70vh]',
  grid: 'min-h-[480px]',
  timeline: 'min-h-[560px]',
  band: 'min-h-[320px]',
};

export function SectionSkeleton({ variant = 'grid', label }: { variant?: Variant; label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${HEIGHTS[variant]} w-full grid place-items-center`}
    >
      <div className="container">
        <div className="animate-pulse rounded-3xl bg-gold/5 border border-gold/10 h-40 md:h-56 w-full" />
        <span className="sr-only">{label ?? 'Loading section'}</span>
      </div>
    </div>
  );
}
