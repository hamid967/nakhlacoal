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

    // Lenis disables native scroll on <html>, which breaks keyboard scrolling
    // (Arrow keys, PageUp/Down, Space, Home/End). Re-implement it manually.
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const vh = window.innerHeight;
      const y = lenis.scroll;
      let target: number | null = null;
      let smooth = true;

      switch (e.key) {
        case 'ArrowDown':      target = y + 80; break;
        case 'ArrowUp':        target = y - 80; break;
        case 'PageDown':       target = y + vh * 0.9; break;
        case 'PageUp':         target = y - vh * 0.9; break;
        case ' ':              target = y + (e.shiftKey ? -vh * 0.9 : vh * 0.9); break;
        case 'Home':           target = 0; break;
        case 'End':            target = document.documentElement.scrollHeight; break;
        default: return;
      }
      e.preventDefault();
      lenis.scrollTo(target, { immediate: !smooth, duration: 0.4 });
    };
    window.addEventListener('keydown', onKey, { passive: false });

    // Pause completely when tab is hidden.
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.clearTimeout(idleTimer);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
