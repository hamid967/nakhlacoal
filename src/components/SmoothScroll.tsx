import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — global buttery scroll powered by Lenis.
 *
 * Accessibility:
 * - Disables entirely when `prefers-reduced-motion: reduce` is set.
 * - Reacts live to preference changes (no reload needed).
 * - Never hijacks keyboard: Lenis passes native keyboard scroll through,
 *   and we skip smoothing while focus is inside form inputs.
 * - Never blocks anchor navigation: honors CSS `scroll-behavior` fallback.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    let raf = 0;

    const isEditable = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        node.isContentEditable === true
      );
    };

    const start = () => {
      if (mq.matches) return; // reduced-motion → native scroll only
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1, // native feel on touch
        wheelMultiplier: 1,
        lerp: 0.1,
      });

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // Pause smoothing while typing so caret & scroll behave natively
      const onFocusIn = (e: FocusEvent) => {
        if (isEditable(e.target)) lenis?.stop();
      };
      const onFocusOut = (e: FocusEvent) => {
        if (isEditable(e.target)) lenis?.start();
      };
      document.addEventListener('focusin', onFocusIn);
      document.addEventListener('focusout', onFocusOut);

      // Cleanup handles attached to this activation
      (start as unknown as { _cleanup?: () => void })._cleanup = () => {
        document.removeEventListener('focusin', onFocusIn);
        document.removeEventListener('focusout', onFocusOut);
      };
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      (start as unknown as { _cleanup?: () => void })._cleanup?.();
      lenis?.destroy();
      lenis = null;
    };

    start();

    // React live to preference changes
    const onChange = () => {
      stop();
      start();
    };
    mq.addEventListener('change', onChange);

    return () => {
      mq.removeEventListener('change', onChange);
      stop();
    };
  }, []);

  return null;
}

export default SmoothScroll;
