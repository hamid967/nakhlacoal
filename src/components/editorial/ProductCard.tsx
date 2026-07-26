import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { ResponsiveImage } from './ResponsiveImage';

/**
 * بطاقة منتج editorial قابلة لإعادة الاستخدام داخل شبكة Bento المكسورة.
 * variant:
 *  - image : صورة خلفية + عنوان + شارة
 *  - solid : بدون صورة، خلفية متدرجة
 */
type BaseProps = {
  to: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  /** حجم/نوع العرض داخل الشبكة */
  size?: 'hero' | 'small';
};

type ImageProps = BaseProps & {
  variant?: 'image';
  imgBase: string;
  imgFallback: string;
  imgSizes?: string;
  /** درجة تعتيم الصورة (0-1) */
  imgOpacity?: number;
  /** اتجاه التدرّج فوق الصورة */
  overlay?: 'top' | 'right';
};

type SolidProps = BaseProps & {
  variant: 'solid';
  extra?: ReactNode;
};

export type ProductCardProps = ImageProps | SolidProps;

export function ProductCard(props: ProductCardProps) {
  const isHero = props.size === 'hero';

  if (props.variant === 'solid') {
    return (
      <Link
        to={props.to}
        className={
          'group relative overflow-hidden bg-jade ' + (props.className ?? '')
        }
      >
        <div className="absolute inset-0 bg-gradient-to-br from-jade to-dark" />
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">{props.eyebrow}</p>
          <div>
            <h3 className="font-editorial-bold text-2xl leading-tight text-dark-foreground">
              {props.title}
            </h3>
            <ArrowUpRight className="mt-2 h-5 w-5 text-gold" />
          </div>
        </div>
      </Link>
    );
  }

  const overlayClass =
    props.overlay === 'right'
      ? 'bg-gradient-to-r from-dark via-dark/40 to-transparent'
      : isHero
        ? 'bg-gradient-to-t from-dark via-dark/20 to-transparent'
        : 'bg-gradient-to-t from-dark/90 via-dark/30 to-transparent';

  return (
    <Link
      to={props.to}
      className={'group relative overflow-hidden bg-dark-2 ' + (props.className ?? '')}
    >
      <ResponsiveImage
        base={props.imgBase}
        fallback={props.imgFallback}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        sizes={props.imgSizes ?? '(max-width: 1024px) 100vw, 40vw'}
        style={
          props.imgOpacity !== undefined
            ? { opacity: props.imgOpacity }
            : undefined
        }
      />
      <div className={'absolute inset-0 ' + overlayClass} />
      {isHero ? (
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold-ink font-editorial-sans font-medium">
            <span className="h-px w-8 bg-gold/60" />
            {props.eyebrow}
          </p>
          <h3 className="mt-3 font-editorial-bold text-4xl lg:text-6xl text-dark-foreground">
            {props.title}
          </h3>
          {props.description ? (
            <p className="mt-2 text-dark-foreground/70 text-sm max-w-xs">
              {props.description}
            </p>
          ) : null}
        </div>
      ) : props.overlay === 'right' ? (
        <div className="absolute inset-y-0 left-0 p-6 lg:p-8 flex flex-col justify-center max-w-xs">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">{props.eyebrow}</p>
          <h3 className="mt-1 font-editorial-bold text-3xl text-dark-foreground">
            {props.title}
          </h3>
          {props.description ? (
            <p className="mt-2 text-dark-foreground/70 text-sm">{props.description}</p>
          ) : null}
        </div>
      ) : (
        <div className="absolute bottom-0 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">{props.eyebrow}</p>
          <h3 className="mt-1 font-editorial-bold text-2xl text-dark-foreground">
            {props.title}
          </h3>
        </div>
      )}
    </Link>
  );
}

export default ProductCard;
