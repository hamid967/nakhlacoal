import { useEffect, useState } from 'react';

/**
 * Lightweight runtime perf probe. Returns `true` when the device is likely
 * low-powered: small viewport, prefers-reduced-motion, low hardware concurrency,
 * or a measured FPS below `fpsThreshold` over a short sample window.
 */
export function useLowPerf(fpsThreshold = 45): boolean {
  const [low, setLow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const weakCPU = (navigator.hardwareConcurrency ?? 8) <= 4;
    // Device memory is only exposed in Chromium; treat missing as normal.
    const weakMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    return isMobile || reduced || weakCPU || weakMem;
  });

  useEffect(() => {
    if (low) return; // already downgraded
    let frames = 0;
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start < 1000) {
        raf = requestAnimationFrame(tick);
      } else {
        if (frames < fpsThreshold) setLow(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [low, fpsThreshold]);

  return low;
}
