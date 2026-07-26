import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Editorial primitives — تُستعمل عبر كل أقسام الواجهة الرئيسية.
 * مرتبطة بخطة التصميم: docs/DESIGN_PLAN.md (Emerald Prestige × Bold Editorial × Broken Grid)
 */

/** شارة علوية رفيعة بخط ذهبي — تسبق كل عنوان قسم */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold-ink font-editorial-sans font-medium">
      <span className="h-px w-8 bg-gold/60" />
      {children}
    </span>
  );
}

/** رقم زخرفي كبير (01, 02...) خلف المحتوى */
export function BigNumber({ n }: { n: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none font-editorial-bold text-gold/10 leading-none"
      style={{ fontSize: 'clamp(140px, 22vw, 320px)' }}
    >
      {n}
    </div>
  );
}

/** زر CTA أساسي بتدرّج ذهبي — Emerald Prestige motion */
export function GoldCTA({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-3 bg-gradient-to-br from-gold-hi to-gold-lo px-brand-xl py-brand-md text-dark font-editorial-sans font-semibold text-sm uppercase tracking-[0.18em] shadow-gold transition-[transform,box-shadow] duration-base ease-brand-in hover:-translate-y-0.5 hover:shadow-glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-slow ease-brand-in group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}

/** زر CTA ثانوي بحدود ذهبية */
export function GhostCTA({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-3 border border-gold/60 text-gold-ink hover:text-gold hover:bg-gold/5 hover:border-gold px-brand-xl py-brand-md font-editorial-sans font-medium text-sm uppercase tracking-[0.18em] transition-[color,background-color,border-color] duration-base ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </Link>
  );
}

/** عنوان قسم editorial مع eyebrow وعنوان مزدوج السطر */
export function SectionHeader({
  eyebrow,
  children,
  size = 'md',
  dir,
}: {
  eyebrow?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dir?: 'ltr' | 'rtl';
}) {
  const sizes: Record<string, string> = {
    sm: 'clamp(32px, 3.8vw, 56px)',
    md: 'clamp(36px, 4.6vw, 72px)',
    lg: 'clamp(40px, 5.6vw, 88px)',
    xl: 'clamp(48px, 7vw, 120px)',
  };
  return (
    <div className="space-y-6" dir={dir}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className="font-editorial-bold leading-[0.95] text-foreground"
        style={{ fontSize: sizes[size] }}
      >
        {children}
      </h2>
    </div>
  );
}

/** فقرة توضيحية موحّدة تلي عنوان القسم — قياس ونمط ثابت عبر كل الأقسام */
export function SectionLead({
  children,
  tone = 'light',
  className = '',
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const color = tone === 'dark' ? 'text-dark-foreground/70' : 'text-foreground/75';
  return (
    <p className={`${color} text-base lg:text-lg leading-relaxed max-w-xl ${className}`}>
      {children}
    </p>
  );
}

/** بطاقة إحصائية — تُستعمل في Quality lab */
export function StatCard({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="group relative border-t border-gold/40 pt-brand-md transition-[transform,border-color] duration-base ease-brand hover:-translate-y-0.5 hover:border-gold">
      <span aria-hidden className="absolute -top-px left-0 h-px w-0 bg-jade transition-[width] duration-slow ease-brand-in group-hover:w-16" />
      {icon ? <div className="mb-brand-sm text-gold transition-colors duration-base ease-brand group-hover:text-gold-hi">{icon}</div> : null}
      <div className="font-editorial-bold text-4xl lg:text-5xl text-foreground">{value}</div>
      <div className="mt-brand-sm text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
    </div>
  );
}

/** بطاقة خطوة عملية — Craft Process */
export function ProcessStepCard({
  n,
  title,
  description,
  icon,
}: {
  n: string;
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="relative border-t border-gold/30 pt-8 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-editorial-bold text-gold text-5xl">{n}</div>
        {icon ? <div className="text-gold/80">{icon}</div> : null}
      </div>
      <h3 className="font-editorial-bold text-2xl text-dark-foreground">{title}</h3>
      <p className="text-dark-foreground/60 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/** بطاقة ميزة — أيقونة + عنوان قصير */
export function FeatureCard({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-gold/30 pt-6">
      {icon}
      <p className="font-editorial-bold text-2xl text-dark-foreground">{title}</p>
    </div>
  );
}
