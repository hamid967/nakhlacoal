import type { Plugin } from 'vite';

type Options = {
  /**
   * Source filename basenames (without extension) of LCP image candidates.
   * The first one resolved in the bundle is preloaded.
   * Examples: 'product-coconut' for `product-coconut.jpg`,
   *           'slide-coconut-trees' for `slide-coconut-trees.jpg?picture`.
   */
  candidates: string[];
  /**
   * Preferred format priority. Picks the first format that exists for the
   * matched candidate. Default: ['avif','webp','jpg','png'].
   */
  formats?: Array<'avif' | 'webp' | 'jpg' | 'png'>;
};

const MIME: Record<string, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  png: 'image/png',
};

/**
 * Build-only Vite plugin: injects
 *   <link rel="preload" as="image" type="..." fetchpriority="high" href="...">
 * for the highest-priority LCP candidate it can find in the emitted bundle.
 * Works with both raw `?import` jpg/png and `vite-imagetools` (?picture) outputs.
 */
export function lcpPreload(opts: Options): Plugin {
  const formats = opts.formats ?? ['avif', 'webp', 'jpg', 'png'];
  let injection: string | null = null;

  return {
    name: 'lcp-preload',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle);
      for (const name of opts.candidates) {
        for (const fmt of formats) {
          const match = files.find(
            (f) => f.includes(name) && f.endsWith(`.${fmt}`),
          );
          if (match) {
            injection = `<link rel="preload" as="image" type="${MIME[fmt]}" href="/${match}" fetchpriority="high" />`;
            return;
          }
        }
      }
    },
    transformIndexHtml(html) {
      if (!injection) return html;
      return html.replace('</head>', `  ${injection}\n  </head>`);
    },
  };
}
