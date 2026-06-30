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
      duration: 0.6,                       // snappier, less CPU per frame
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
    });
    lenisInstance = lenis;

    let raf = 0;
    let running = false;
    let idleTimer: number | undefined;

    const loop = (time: number) => {
      lenis.raf(time);
      // Bail out if scrolling too fast — let the browser handle it natively to avoid jank.
      if (Math.abs(lenis.velocity) > 80) {
        stop();
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only run RAF while user is actively scrolling; idle for 250ms → pause.
    const onScroll = () => {
      start();
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(stop, 250);
    };
    lenis.on('scroll', onScroll);

    // Pause completely when tab is hidden.
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.clearTimeout(idleTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
