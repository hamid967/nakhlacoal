import type { Plugin } from 'vite';

type Options = {
  /**
   * Base name (without extension) of the LCP image to preload.
   * Matches the source filename used with `?picture`.
   * Example: 'slide-coconut-trees' for `slide-coconut-trees.jpg?picture`.
   */
  match: string;
  /** Preferred format. Default: 'avif'. */
  format?: 'avif' | 'webp' | 'jpg';
  /**
   * Preferred width bucket (must exist in imagetools `w=` list).
   * Default: 1280 (closest to typical desktop hero).
   */
  width?: number;
};

/**
 * Vite plugin that injects a `<link rel="preload" as="image" fetchpriority="high">`
 * into index.html pointing at the hashed asset emitted by `vite-imagetools`
 * for the configured LCP image. Build-only — dev gets no preload tag.
 */
export function lcpPreload(opts: Options): Plugin {
  const format = opts.format ?? 'avif';
  const width = opts.width ?? 1280;
  let href: string | null = null;

  return {
    name: 'lcp-preload',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      // Filenames look like: `assets/slide-coconut-trees-1280-HASH.avif`
      const re = new RegExp(
        `${opts.match}[-_].*${width}.*\\.${format}$|${opts.match}[-_].*\\.${format}$`,
      );
      const candidates = Object.keys(bundle).filter(
        (f) => f.endsWith(`.${format}`) && f.includes(opts.match),
      );
      if (!candidates.length) return;
      // Prefer one that contains the exact width bucket; fall back to first.
      const exact = candidates.find((f) => f.includes(String(width)));
      href = '/' + (exact ?? candidates[0]);
      void re;
    },
    transformIndexHtml(html) {
      if (!href) return html;
      const mime = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      const tag = `<link rel="preload" as="image" type="${mime}" href="${href}" fetchpriority="high" />`;
      return html.replace('</head>', `  ${tag}\n  </head>`);
    },
  };
}
