import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Props = {
  density?: number;          // particles per 100k px²
  className?: string;
  color?: string;            // rgba inner color
};

/**
 * Active-Theory-style ambient particle field, canvas-based for portability.
 * - Pauses when off-screen (IntersectionObserver)
 * - Disables on reduce-motion, touch-only, or low hardwareConcurrency (<4)
 * - DPR-capped at 1.5 to stay GPU-cheap
 */
export function GoldParticles({ density = 6, className = '', color = '200, 168, 110' }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (reduced) return;
    if (typeof window === 'undefined') return;

    const lowPower =
      (navigator.hardwareConcurrency ?? 4) < 4 ||
      window.matchMedia('(pointer: coarse)').matches;
    if (lowPower) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    let rafId = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(90, Math.floor((w * h) / 100_000 * density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.18,
        r: 0.6 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.5,
      }));
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4; else if (p.x > w + 4) p.x = -4;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, `rgba(${color}, ${p.a})`);
        g.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(canvas);

    resize();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced, density, color]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
