import { useEffect, useRef } from 'react';
import { getReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Lightweight parallax: translates the element on Y based on its position
 * relative to the viewport center. `speed` 0 = static, 0.3 = subtle, 1 = strong.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.3) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (getReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let visible = false;

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { rootMargin: '100px' }
    );
    io.observe(el);

    const update = () => {
      if (visible) {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * speed * -1;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed]);

  return ref;
}
