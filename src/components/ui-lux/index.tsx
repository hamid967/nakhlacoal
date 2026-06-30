import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LucideIcon, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '@/components/ScrollReveal';

/* ---------- helpers ---------- */
export function useDir() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;
  return { isAr, Arrow: isAr ? ArrowLeft : ArrowRight };
}

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ');

/* ---------- Section wrapper ---------- */
type ToneT = 'plain' | 'surface' | 'dark';
export function LuxSection({
  children,
  tone = 'plain',
  className,
  id,
}: {
  children: ReactNode;
  tone?: ToneT;
  className?: string;
  id?: string;
}) {
  const toneCls =
    tone === 'surface'
      ? 'bg-surface/60 border-y border-foreground/10'
      : tone === 'dark'
      ? 'section-dark'
      : '';
  return (
    <section id={id} className={cx('py-16 md:py-24', toneCls, className)}>
      <div className="container">{children}</div>
    </section>
  );
}

/* ---------- Section header (eyebrow + title + optional lead) ---------- */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'center',
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'start' | 'between';
  action?: ReactNode;
}) {
  const { isAr } = useDir();
  const headBlock = (
    <div className={cx(align === 'center' && 'text-center mx-auto max-w-2xl')}>
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      <h2
        className={cx(
          'text-3xl md:text-5xl mt-4',
          isAr ? 'font-arabic font-bold' : 'font-display font-bold'
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-base md:text-lg text-foreground/70 leading-relaxed font-arabic">
          {lead}
        </p>
      )}
    </div>
  );
  return (
    <ScrollReveal
      className={cx(
        'mb-12 md:mb-14',
        align === 'between' && 'flex flex-col md:flex-row md:items-end justify-between gap-6'
      )}
    >
      {headBlock}
      {action}
    </ScrollReveal>
  );
}

/* ---------- Eyebrow chip ---------- */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

/* ---------- Buttons ---------- */
type BtnProps = {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'gold' | 'ghost' | 'solid-gold';
  className?: string;
  withArrow?: boolean;
};
export function LuxButton({
  to,
  href,
  onClick,
  children,
  variant = 'gold',
  className,
  withArrow,
}: BtnProps) {
  const { Arrow } = useDir();
  const base =
    variant === 'gold'
      ? 'btn-gold !rounded-full'
      : variant === 'ghost'
      ? 'btn-glass'
      : 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-dark text-sm font-bold hover:bg-gold-hi transition-colors';
  const content = (
    <>
      {children}
      {withArrow && <Arrow className="w-4 h-4" />}
    </>
  );
  const cls = cx(base, className);
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  if (href) return <a href={href} className={cls}>{content}</a>;
  return <button onClick={onClick} className={cls}>{content}</button>;
}

/* ---------- Feature card (icon + title + body) ---------- */
export function FeatureCard({
  icon: Icon,
  title,
  body,
  index = 0,
}: {
  icon: LucideIcon;
  title: ReactNode;
  body: ReactNode;
  index?: number;
}) {
  const { isAr } = useDir();
  return (
    <ScrollReveal delay={index * 120}>
      <div className="clay-card shimmer-card group h-full rounded-3xl p-8 md:p-10">
        <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 text-gold-lo flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6" />
        </span>
        <h3 className={cx('text-2xl mb-3', isAr ? 'font-arabic font-bold' : 'font-display font-bold')}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-foreground/70 font-arabic">{body}</p>
      </div>
    </ScrollReveal>
  );
}

/* ---------- Trust strip item ---------- */
export function TrustItem({
  icon: Icon,
  text,
  index = 0,
}: {
  icon: LucideIcon;
  text: ReactNode;
  index?: number;
}) {
  return (
    <ScrollReveal delay={index * 80}>
      <div className="clay-card flex items-center gap-4 rounded-2xl px-5 py-4 h-full">
        <span className="w-11 h-11 rounded-full flex items-center justify-center bg-gold/15 text-gold-lo shrink-0">
          <Icon className="w-5 h-5" />
        </span>
        <p className="text-sm font-arabic text-foreground/80 leading-snug">{text}</p>
      </div>
    </ScrollReveal>
  );
}

/* ---------- Stat block ---------- */
export function Stat({
  value,
  label,
  size = 'md',
}: {
  value: ReactNode;
  label: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const num =
    size === 'lg' ? 'text-6xl md:text-7xl' : size === 'sm' ? 'text-2xl' : 'text-3xl md:text-4xl';
  return (
    <div>
      <div className={cx(num, 'font-bold text-jade font-display leading-none')}>{value}</div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-foreground/60 mt-2 font-arabic">
        {label}
      </div>
    </div>
  );
}

/* ---------- Product / link card ---------- */
export function ProductCard({
  img,
  name,
  tag,
  to = '/products',
  index = 0,
}: {
  img: string;
  name: ReactNode;
  tag?: ReactNode;
  to?: string;
  index?: number;
}) {
  const { isAr, Arrow } = useDir();
  return (
    <ScrollReveal delay={index * 80}>
      <Link to={to} className="group block">
        <div className="clay-card aspect-[4/5] overflow-hidden rounded-2xl mb-4 relative !p-0">
          <img
            src={img}
            alt={typeof name === 'string' ? name : ''}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={cx('text-base md:text-lg mb-1', isAr ? 'font-arabic font-bold' : 'font-display font-bold')}>
              {name}
            </h3>
            {tag && <p className="text-xs text-foreground/60 font-arabic">{tag}</p>}
          </div>
          <span className="w-9 h-9 rounded-full bg-dark text-background flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
            <Arrow className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

/* ---------- Testimonial card ---------- */
export function TestimonialCard({
  name,
  role,
  body,
  meta,
  index = 0,
}: {
  name: string;
  role: ReactNode;
  body: ReactNode;
  meta?: ReactNode;
  index?: number;
}) {
  return (
    <ScrollReveal delay={index * 100}>
      <figure className="clay-card h-full rounded-3xl p-8 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <span className="flex gap-0.5 text-gold-hi">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-4 h-4 fill-current" />
            ))}
          </span>
          {meta && (
            <span className="text-[11px] font-arabic px-2.5 py-1 rounded-full bg-jade/10 text-jade border border-jade/20">
              {meta}
            </span>
          )}
        </div>
        <blockquote className="text-foreground/80 leading-relaxed font-arabic mb-6 flex-1">
          “{body}”
        </blockquote>
        <figcaption className="flex items-center gap-3 pt-5 border-t border-foreground/10">
          <span className="w-10 h-10 rounded-full bg-dark text-background flex items-center justify-center font-bold font-display">
            {name.charAt(0)}
          </span>
          <div>
            <div className="text-sm font-bold font-arabic">{name}</div>
            <div className="text-xs text-foreground/60 font-arabic">{role}</div>
          </div>
        </figcaption>
      </figure>
    </ScrollReveal>
  );
}

/* ---------- CTA band (dark emerald w/ rounded ember glow) ---------- */
export function CtaBand({
  title,
  lead,
  ctaLabel,
  ctaTo,
}: {
  title: ReactNode;
  lead?: ReactNode;
  ctaLabel: ReactNode;
  ctaTo: string;
}) {
  const { isAr, Arrow } = useDir();
  return (
    <section className="pb-20 md:pb-28">
      <div className="container">
        <ScrollReveal>
          <div className="section-dark rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 ember-glow opacity-50" />
            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8">
                <h2 className={cx('text-3xl md:text-5xl leading-tight', isAr ? 'font-arabic font-bold' : 'font-display font-bold')}>
                  {title}
                </h2>
                {lead && <p className="mt-4 text-background/75 font-arabic max-w-xl">{lead}</p>}
              </div>
              <div className="md:col-span-4 flex md:justify-end gap-3 flex-wrap">
                <Link
                  to={ctaTo}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-dark text-sm font-bold hover:bg-gold-hi transition-colors"
                >
                  {ctaLabel}
                  <Arrow className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ---------- Page hero (compact, for inner pages) ---------- */
import { SectionChip, PalmCorner } from './PageHero';
export { SectionChip, PalmCorner } from './PageHero';

export function PageIntro({
  eyebrow,
  title,
  lead,
  number,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  number?: string | number;
}) {
  const { isAr } = useDir();
  return (
    <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 overflow-hidden">
      <PalmCorner position="top-left" />
      <PalmCorner position="top-right" />
      <div className="container relative max-w-5xl mx-auto text-center">
        {number !== undefined ? (
          <div className="flex justify-center"><SectionChip number={number} label={eyebrow} /></div>
        ) : (
          eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>
        )}
        <h1 className={cx('text-4xl md:text-6xl leading-tight mt-4', isAr ? 'font-arabic font-bold' : 'font-display font-bold')}>
          {title}
        </h1>
        {lead && (
          <p className="mt-5 text-base md:text-lg text-foreground/75 leading-relaxed font-arabic">
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}

