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
      idleTimer = window.setTimeout(stop, 1200);
    };
    lenis.on('scroll', onScroll);

    // Kick the RAF loop on user input so the very first wheel/touch animates.
    const onInput = () => {
      start();
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(stop, 1200);
    };
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchstart', onInput, { passive: true });


    // Lenis disables native scroll on <html>, which breaks keyboard scrolling
    // (Arrow keys, PageUp/Down, Space, Home/End). Re-implement it manually.
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const el = (e.target as HTMLElement) ?? null;
      // Skip when focus is inside an editable control — let the browser handle it.
      if (el) {
        const tag = el.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          el.isContentEditable ||
          el.closest('input, textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"], [role="menuitem"], [role="dialog"]')
        ) return;
      }


      const vh = window.innerHeight;
      const y = lenis.scroll;
      let target: number | null = null;

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
      start(); // ensure the RAF loop is running so scrollTo animates
      lenis.scrollTo(target, { duration: 0.4 });

    };
    window.addEventListener('keydown', onKey, { passive: false });


    // Pause completely when tab is hidden.
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.clearTimeout(idleTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
      document.removeEventListener('visibilitychange', onVisibility);
      lenis.destroy();
      lenisInstance = null;
    };

  }, []);

  return null;
}
