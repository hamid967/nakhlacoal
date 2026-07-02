import { ReactNode, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

interface ScrollSceneProps {
  children: ReactNode;
  className?: string;
  /** intensity 0..1 — controls 3D tilt + parallax depth */
  intensity?: number;
  /** rotate axis */
  axis?: 'x' | 'y';
  as?: 'section' | 'div' | 'article';
}

/**
 * ScrollScene
 * Wraps any block with GPU-cheap 3D scroll motion:
 * - Parallax translateY
 * - Perspective rotateX/Y based on viewport progress
 * - Fade + scale in on enter
 * Uses framer-motion's useScroll (rAF-scheduled) and respects prefers-reduced-motion.
 */
export function ScrollScene({
  children,
  className = '',
  intensity = 0.6,
  axis = 'x',
  as = 'section',
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });

  const y = useTransform(smooth, [0, 1], [reduce ? 0 : 60 * intensity, reduce ? 0 : -60 * intensity]);
  const rot = useTransform(
    smooth,
    [0, 0.5, 1],
    reduce ? [0, 0, 0] : [10 * intensity, 0, -10 * intensity],
  );
  const scale = useTransform(smooth, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.96, 1, 0.98]);
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.6]);

  const MotionTag = motion[as] as typeof motion.section;

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
        y,
        opacity,
        rotateX: axis === 'x' ? rot : 0,
        rotateY: axis === 'y' ? rot : 0,
        scale,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </MotionTag>
  );
}

export default ScrollScene;
