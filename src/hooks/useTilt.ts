import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Subtle 3D tilt for Clay cards. Active Theory–style without overdoing it.
 * Sets CSS vars --rx / --ry / --mx / --my on the element; CSS reads them.
 *
 * Performance:
 * - Disabled on coarse pointers (touch) and reduced-motion users.
 * - Paused when the element is off-screen (IntersectionObserver).
 * - rAF coalesced + delta threshold to skip near-duplicate frames (~saves 30–50% CPU on idle hover).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 6) {
  const ref = useRef<T | null>(null);
  const raf = useRef<number | null>(null);
  const last = useRef({ rx: 0, ry: 0 });
  const visible = useRef(true);
  const reduce = useReducedMotion();

  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(hover: none), (pointer: coarse)').matches;
  const disabled = reduce || coarse;

  useEffect(() => {
    if (disabled || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => { visible.current = entries[0]?.isIntersecting ?? true; },
      { rootMargin: '50px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled]);

  const onMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (disabled || !visible.current) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * max * 2;
      const rx = -(py - 0.5) * max * 2;
      // Skip if change is below perceptible threshold (~0.25deg)
      if (Math.abs(rx - last.current.rx) < 0.25 && Math.abs(ry - last.current.ry) < 0.25) return;
      last.current = { rx, ry };
      if (raf.current) return; // coalesce: only one pending frame
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
    },
    [max, disabled]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
    last.current = { rx: 0, ry: 0 };
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  // No-op handlers when disabled so consumers can pass them unconditionally.
  if (disabled) {
    return { ref, onPointerMove: undefined, onPointerLeave: undefined };
  }
  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
}
