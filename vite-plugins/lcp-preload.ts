import type { Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Options = {
  /**
   * Source filename basenames (without extension) of LCP image candidates,
   * in priority order. First one resolved in the emitted bundle wins.
   */
  candidates: string[];
  /** Format priority. Default: ['avif','webp','jpg','png']. */
  formats?: Array<'avif' | 'webp' | 'jpg' | 'png'>;
};

const MIME: Record<string, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  png: 'image/png',
};

/**
 * Build-only Vite plugin that injects
 *   <link rel="preload" as="image" type="..." fetchpriority="high" href="...">
 * into the emitted `dist/index.html`.
 *
 * Implementation note: Vite calls `transformIndexHtml` BEFORE `generateBundle`,
 * so we can't observe hashed asset names there. Instead we patch the file in
 * `writeBundle`, after both the HTML and the assets exist on disk.
 */
export function lcpPreload(opts: Options): Plugin {
  const formats = opts.formats ?? ['avif', 'webp', 'jpg', 'png'];
  let outDir = 'dist';
  let base = '/';

  return {
    name: 'lcp-preload',
    apply: 'build',
    configResolved(cfg) {
      outDir = cfg.build.outDir;
      base = cfg.base || '/';
    },
    writeBundle(_, bundle) {
      const files = Object.keys(bundle);
      let href: string | null = null;
      let fmt: string | null = null;
      outer: for (const name of opts.candidates) {
        for (const f of formats) {
          const match = files.find((p) => p.includes(name) && p.endsWith(`.${f}`));
          if (match) {
            href = base.replace(/\/$/, '') + '/' + match;
            fmt = f;
            break outer;
          }
        }
      }
      if (!href || !fmt) return;

      const indexPath = resolve(outDir, 'index.html');
      let html: string;
      try {
        html = readFileSync(indexPath, 'utf8');
      } catch {
        return;
      }
      const tag = `<link rel="preload" as="image" type="${MIME[fmt]}" href="${href}" fetchpriority="high" />`;
      if (html.includes(tag)) return;
      writeFileSync(indexPath, html.replace('</head>', `  ${tag}\n  </head>`));
    },
  };
}
