import { ImgHTMLAttributes, useMemo } from 'react';

// Eagerly collect all responsive variants generated under src/assets/design/responsive
const webpFiles = import.meta.glob('@/assets/design/responsive/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const jpgFiles = import.meta.glob('@/assets/design/responsive/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function buildVariants(files: Record<string, string>, base: string) {
  const prefix = `/src/assets/design/responsive/${base}-`;
  const variants: { url: string; width: number }[] = [];
  for (const [path, url] of Object.entries(files)) {
    if (!path.includes(`/responsive/${base}-`)) continue;
    const m = path.match(/-(\d+)\.(webp|jpg)$/);
    if (m) variants.push({ url, width: parseInt(m[1], 10) });
    void prefix;
  }
  return variants.sort((a, b) => a.width - b.width);
}

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  /** Base filename without extension, e.g. "hero-editorial" */
  base: string;
  /** Fallback (full-size original) src */
  fallback: string;
  /** `sizes` attribute — defaults to full-viewport hint */
  sizes?: string;
}

export function ResponsiveImage({
  base,
  fallback,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw',
  alt = '',
  loading = 'lazy',
  decoding = 'async',
  ...rest
}: Props) {
  const webp = useMemo(() => buildVariants(webpFiles, base), [base]);
  const jpg = useMemo(() => buildVariants(jpgFiles, base), [base]);

  const toSrcSet = (v: { url: string; width: number }[]) =>
    v.map((x) => `${x.url} ${x.width}w`).join(', ');

  return (
    <picture>
      {webp.length > 0 && (
        <source type="image/webp" srcSet={toSrcSet(webp)} sizes={sizes} />
      )}
      {jpg.length > 0 && (
        <source type="image/jpeg" srcSet={toSrcSet(jpg)} sizes={sizes} />
      )}
      <img
        src={fallback}
        alt={alt}
        loading={loading}
        decoding={decoding}
        {...rest}
      />
    </picture>
  );
}

export default ResponsiveImage;
