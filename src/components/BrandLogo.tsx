import logo from '@/assets/palm-charcoal-logo.png';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
  alt?: string;
};

/**
 * BrandLogo — raster logo wrapped with theme-adaptive filters.
 * Uses CSS custom property --logo-filter (defined per theme in index.css)
 * so the same PNG tunes itself for light cream, dark emerald, sand, and noir.
 */
export function BrandLogo({
  className,
  width = 56,
  height = 56,
  eager = false,
  alt = 'فحم النخلة Palm Charcoal',
}: Props) {
  return (
    <img
      src={logo}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      {...(eager ? ({ fetchpriority: 'high' } as any) : {})}
      className={cn('brand-logo', className)}
    />
  );
}

export default BrandLogo;
