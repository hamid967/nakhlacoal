/**
 * Locks the reserved-height baseline for every SectionSkeleton variant.
 *
 * The values below were derived from a live Playwright measurement of the
 * real rendered section heights on Home at mobile / tablet / desktop
 * (see /tmp/browser/skel audit). They are the *minimum* px height each
 * skeleton must reserve so that when the lazy chunk resolves the page
 * doesn't jump upward (CLS regression).
 *
 * If someone lowers a HEIGHTS entry in SectionSkeleton.tsx below the
 * measured floor, this test fails — forcing them to re-measure before
 * shipping a change that could reintroduce layout shift.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionSkeleton } from '../SectionSkeleton';

// Floor = smallest real section height observed across all breakpoints,
// rounded down to a safe reserve. Must be ≤ the value shipped in HEIGHTS.
const FLOOR_PX: Record<string, number> = {
  grid: 640,
  timeline: 720,
  band: 460,
  press: 300,
  awards: 320,
  constellation: 580,
  film: 720,
  cases: 720,
  map: 900,
};

// Hero uses viewport units (70vh); assert the class shape instead of px.
describe('SectionSkeleton reserved heights (CLS budget)', () => {
  it('hero reserves 70vh', () => {
    const { container } = render(<SectionSkeleton variant="hero" />);
    const el = container.querySelector('[aria-busy="true"]') as HTMLElement;
    expect(el.className).toMatch(/min-h-\[70vh\]/);
  });

  it.each(Object.entries(FLOOR_PX))(
    '%s reserves ≥ %ipx (matches measured real content floor)',
    (variant, floor) => {
      const { container } = render(<SectionSkeleton variant={variant as never} />);
      const el = container.querySelector('[aria-busy="true"]') as HTMLElement;
      const m = el.className.match(/min-h-\[(\d+)px\]/);
      expect(m, `variant "${variant}" is missing a pixel min-h class`).not.toBeNull();
      const reserved = Number(m![1]);
      expect(
        reserved,
        `variant "${variant}" reserves ${reserved}px but real content floor is ${floor}px — this will cause CLS. Re-measure and update HEIGHTS.`,
      ).toBeGreaterThanOrEqual(floor);
    },
  );
});
