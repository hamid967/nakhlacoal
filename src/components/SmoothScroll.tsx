import { useEffect } from 'react';
import Lenis from 'lenis';
import { getReducedMotion } from '@/hooks/useReducedMotion';

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const lowCores = (navigator.hardwareConcurrency ?? 4) < 4;
    // Respect explicit user toggle + OS preference; skip on touch/low-power.
    if (getReducedMotion() || coarse || lowCores) return;

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.1,
    });
    lenisInstance = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
