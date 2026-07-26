import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

export function CinematicCTA() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="relative z-0 isolate pt-32 pb-40 md:py-40 bg-[#0B0B0B] overflow-hidden">
      {/* Cinematic background layers */}
      <div className="absolute inset-0">
        {/* base radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(46_72%_62%/0.18),transparent_65%)]" />
        {/* animated gold sweep */}
        <motion.div
          className="absolute -inset-x-1/2 top-1/2 -translate-y-1/2 h-[60%] bg-[linear-gradient(90deg,transparent,hsl(46_72%_62%/0.18),transparent)] blur-3xl"
          animate={{ x: ['0%', '25%', '0%'] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* film grain via SVG noise */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        {/* horizontal scan line */}
        <motion.div
          className="absolute inset-x-0 h-px bg-[linear-gradient(90deg,transparent,hsl(46_95%_78%/0.6),transparent)]"
          initial={{ top: '20%' }}
          animate={{ top: ['20%', '80%', '20%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85))]" />
      </div>

      <div className="container relative z-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-block text-[11px] tracking-[0.5em] uppercase text-[hsl(var(--gold))] mb-6"
        >
          {isAr ? 'الخطوة التالية' : 'Next Step'}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display text-white leading-[1.05] max-w-4xl mx-auto"
        >
          {isAr ? (
            <>
              اطلب الفحم الفاخر <br />
              <span className="bg-gradient-to-r from-[hsl(46_95%_78%)] via-[hsl(46_72%_62%)] to-[hsl(46_55%_45%)] bg-clip-text text-transparent">
                من فحم النخلة
              </span>
            </>
          ) : (
            <>
              Order premium charcoal <br />
              <span className="bg-gradient-to-r from-[hsl(46_95%_78%)] via-[hsl(46_72%_62%)] to-[hsl(46_55%_45%)] bg-clip-text text-transparent">
                from Palm Charcoal
              </span>
            </>
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-white/65 text-lg md:text-xl font-arabic max-w-2xl mx-auto"
        >
          {isAr
            ? 'شحن سريع، جودة موثّقة، وخدمة شخصية على مدار الساعة.'
            : 'Fast shipping, certified quality, and personalized 24/7 service.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/quote"
            className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--gold))] text-black px-8 py-4 text-sm font-semibold hover:brightness-110 transition shadow-[0_0_40px_-8px_hsl(46_90%_60%/0.6)]"
          >
            {isAr ? 'اطلب عرض سعر' : 'Request a quote'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
          </Link>
          <a
            href={waLink('quote')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold))]/40 text-white px-8 py-4 text-sm font-semibold hover:bg-white/5 transition"
          >
            <MessageCircle className="w-4 h-4" />
            {isAr ? 'تحدّث معنا واتساب' : 'Chat on WhatsApp'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
