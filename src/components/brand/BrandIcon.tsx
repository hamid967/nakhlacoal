import { brandIcons, iconSizes, type BrandIconName } from "@/lib/brandTokens";

type Size = keyof typeof iconSizes | number;

interface BrandIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: BrandIconName;
  size?: Size;
  color?: string;
  title?: string;
}

/**
 * BrandIcon — renders a Palm Charcoal identity SVG.
 * SVGs use `currentColor`, so `color` (or Tailwind `text-*`) controls the stroke.
 */
export function BrandIcon({
  name,
  size = "md",
  color,
  title,
  style,
  ...rest
}: BrandIconProps) {
  const px = typeof size === "number" ? size : iconSizes[size];
  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{
        display: "inline-flex",
        width: px,
        height: px,
        color,
        WebkitMaskImage: `url(${brandIcons[name]})`,
        maskImage: `url(${brandIcons[name]})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        backgroundColor: "currentColor",
        ...style,
      }}
      {...rest}
    />
  );
}
