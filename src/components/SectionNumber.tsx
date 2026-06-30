/**
 * Editorial section numbering — matches PageHero "01/07 → 07/07" style.
 * Floats at the top corner of a section. Decorative.
 */
type Props = { index: number; total?: number; align?: 'start' | 'end' };

export function SectionNumber({ index, total = 7, align = 'start' }: Props) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div
      aria-hidden="true"
      className={`mb-6 md:mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold-ink/70 font-display ${
        align === 'end' ? 'justify-end' : ''
      }`}
    >
      <span className="text-[hsl(var(--gold-ink))] font-semibold">{pad(index)}</span>
      <span className="h-px w-10 bg-gold/30" />
      <span>{pad(total)}</span>
    </div>
  );
}
