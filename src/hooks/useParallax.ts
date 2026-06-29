import { useEffect } from "react";

/**
 * Premium parallax preset.
 * Apply class `lux-parallax` and optionally `lux-parallax-slow|med|fast`
 * to any element. This hook updates a CSS variable `--pp` based on the
 * scroll position relative to the viewport center, multiplied by
 * `--pp-speed` (defaults set by the speed modifier classes).
 *
 * Respects prefers-reduced-motion.
 */
export function useParallax(selector = ".lux-parallax") {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = center - vh / 2;
        const speed = parseFloat(
          getComputedStyle(el).getPropertyValue("--pp-speed") || "0.06"
        );
        el.style.setProperty("--pp", String(-delta * speed));
      });
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [selector]);
}
