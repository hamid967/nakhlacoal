/**
 * WebGL capability probe — cached, SSR-safe.
 *
 * Returns false when:
 *  - no WebGL context can be acquired
 *  - the renderer is a software/SwiftShader/llvmpipe fallback (GPU stall risk)
 *  - the device reports very low memory / CPU cores (mobile potatoes)
 *  - the user prefers reduced motion (respect OS setting)
 *  - `?noWebGL=1` is present in the URL (manual kill switch for QA)
 */
let cached: boolean | null = null;
let lastReason: string | null = null;

const SOFTWARE_RENDERERS =
  /(swiftshader|llvmpipe|software|basic render|microsoft basic|google swiftshader)/i;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    cached = false;
    lastReason = 'ssr';
    return false;
  }

  try {
    // Manual override + reduced motion = no heavy GPU work.
    if (new URLSearchParams(window.location.search).has('noWebGL')) {
      lastReason = 'query-flag';
      return (cached = false);
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      lastReason = 'reduced-motion';
      return (cached = false);
    }

    // Underpowered devices: <=2 cores or <=1GB RAM reported.
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.hardwareConcurrency ?? 4) <= 2) {
      lastReason = 'low-cpu';
      return (cached = false);
    }
    if (nav.deviceMemory !== undefined && nav.deviceMemory <= 1) {
      lastReason = 'low-memory';
      return (cached = false);
    }

    const c = document.createElement('canvas');
    const gl =
      (c.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (c.getContext('webgl') as WebGLRenderingContext | null) ||
      (c.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      lastReason = 'no-context';
      return (cached = false);
    }

    // Detect software renderer → likely GPU stall under load.
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer =
        (dbg && (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string)) || '';
      if (renderer && SOFTWARE_RENDERERS.test(renderer)) {
        lastReason = `software:${renderer}`;
        return (cached = false);
      }
    } catch {
      /* extension blocked — assume OK */
    }

    lastReason = null;
    return (cached = true);
  } catch (e) {
    lastReason = `exception:${(e as Error).message}`;
    return (cached = false);
  }
}

/** Why hasWebGL() returned false (debug aid). */
export function webglDisabledReason(): string | null {
  return lastReason;
}
