/**
 * Lightweight WebGL capability probe — cached, SSR-safe.
 * Returns false on browsers/envs without a usable WebGL context
 * (e.g. headless Firefox without GPU, locked-down enterprise builds).
 */
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    cached = false;
    return false;
  }
  try {
    const c = document.createElement('canvas');
    const gl =
      (c.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (c.getContext('webgl') as WebGLRenderingContext | null) ||
      (c.getContext('experimental-webgl') as WebGLRenderingContext | null);
    cached = !!gl;
    return cached;
  } catch {
    cached = false;
    return false;
  }
}
