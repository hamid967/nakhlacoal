/** Cream/gold skeleton shown while WebGL + textures load. Kept dependency-free so
 *  it can be imported eagerly without pulling three.js into the main bundle. */
export function Trademarks3DSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-md border border-[hsl(var(--gold))]/30 bg-gradient-to-b from-surface-2 to-surface-3 animate-pulse"
            style={{
              width: i === 1 ? 140 : 110,
              height: i === 1 ? 200 : 160,
              opacity: i === 1 ? 1 : 0.65,
              boxShadow: '0 10px 30px -12px rgba(120,98,72,0.35)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
