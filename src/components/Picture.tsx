import { CSSProperties, ImgHTMLAttributes } from "react";

type PictureSource = {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
};

type Props = {
  source: PictureSource;
  alt: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  sizes?: string;
  eager?: boolean;
  priority?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "loading" | "style">;

/**
 * Renders a responsive <picture> with AVIF/WebP/JPEG variants generated
 * by vite-imagetools (`?picture` directive). Preserves quality and
 * delivers the smallest supported format per browser.
 */
export function Picture({
  source,
  alt,
  className,
  imgClassName,
  style,
  imgStyle,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  eager,
  priority,
  ...rest
}: Props) {
  const { sources, img } = source;
  return (
    <picture className={className} style={style}>
      {Object.entries(sources).map(([type, srcset]) => (
        <source key={type} type={`image/${type}`} srcSet={srcset} sizes={sizes} />
      ))}
      <img
        {...rest}
        src={img.src}
        width={img.w}
        height={img.h}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? ({ fetchpriority: "high" } as any) : {})}
        className={imgClassName}
        style={imgStyle}
      />
    </picture>
  );
}
