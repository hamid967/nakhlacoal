import { motion, useReducedMotion } from 'framer-motion';
import logo from '@/assets/palm-charcoal-logo.png';
import canvasImg from '@/assets/intro-palm-bg.jpg';

interface Props {
  isAr: boolean;
}

export function BrandCanvas({ isAr }: Props) {
  const reduce = useReducedMotion();
  return (
    <aside
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16"
      aria-hidden="true"
    >
      {/* Cinematic background */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ scale: reduce ? 1 : 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <img
          src={canvasImg}
          alt=""
          className="size-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0.0)_0%,hsl(var(--background)/0.55)_60%,hsl(var(--background)/0.92)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-background/30" />
      </motion.div>

      {/* Top: logo */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex items-center gap-3"
      >
        <img src={logo} alt="Palm Charcoal" className="h-12 w-12 object-contain" />
        <div className="leading-tight">
          <div className="font-serif text-xl text-foreground">
            {isAr ? 'فحم النخلة' : 'Palm Charcoal'}
          </div>
          <div className="text-xs text-muted-foreground tracking-[0.3em] uppercase">
            {isAr ? 'تجربة فاخرة' : 'Luxury Experience'}
          </div>
        </div>
      </motion.div>

      {/* Center: editorial pitch */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="max-w-md space-y-4"
      >
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-primary">
          <span className="h-px w-8 bg-primary" />
          {isAr ? '٠١ — الدخول' : '01 — Access'}
        </span>
        <h2 className="font-serif text-4xl xl:text-5xl text-foreground leading-tight">
          {isAr ? (
            <>
              منصة <span className="text-primary">فحم النخلة</span>
              <br />
              للمحترفين والمشترين الدوليين
            </>
          ) : (
            <>
              The <span className="text-primary">Palm Charcoal</span>
              <br />
              private platform.
            </>
          )}
        </h2>
        <p className="text-muted-foreground text-base xl:text-lg leading-relaxed">
          {isAr
            ? 'وصول آمن إلى الطلبات، شهادات الجودة، وأسعار الجملة.'
            : 'Secure access to orders, quality reports, and wholesale pricing.'}
        </p>
      </motion.div>

      {/* Bottom: trust strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
        className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
      >
        <span>{isAr ? 'مشفّر TLS' : 'TLS encrypted'}</span>
        <span>{isAr ? 'متوافق مع WCAG' : 'WCAG AA'}</span>
        <span>{isAr ? 'الجودة 2026' : 'Edition 2026'}</span>
      </motion.div>
    </aside>
  );
}
