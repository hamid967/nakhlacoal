import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, MapPin, Sparkles } from 'lucide-react';

/**
 * Careers invitation panel — quiet, editorial. Not a full jobs board.
 * Encourages spontaneous applications by tone rather than by CTA volume.
 */
export function CareersInvite() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const roles = [
    {
      title: isAr ? 'مهندس عمليات إنتاج' : 'Production Operations Engineer',
      loc: isAr ? 'جدة · دوام كامل' : 'Jeddah · Full-time',
    },
    {
      title: isAr ? 'مدير حسابات التصدير' : 'Export Accounts Manager',
      loc: isAr ? 'الرياض · هجين' : 'Riyadh · Hybrid',
    },
    {
      title: isAr ? 'أخصائي جودة المنتج' : 'Product Quality Specialist',
      loc: isAr ? 'جدة · دوام كامل' : 'Jeddah · Full-time',
    },
    {
      title: isAr ? 'مصمّم علامة تجارية' : 'Brand Designer',
      loc: isAr ? 'عن بُعد' : 'Remote',
    },
  ];

  return (
    <section className="relative z-0 isolate py-24 md:py-32 bg-[#0B0B0B] overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          {/* Left: manifesto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4 font-arabic">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'انضم إلينا' : 'Join us'}
            </span>
            <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
              {isAr
                ? 'نبني حرفة، لا مجرّد منتج.'
                : 'We build a craft — not just a product.'}
            </h2>
            <p className={`mt-6 text-white/70 text-base md:text-lg leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
              {isAr
                ? 'إن كنت تعشق التفاصيل، وتؤمن أن الجودة تصنع فرقًا حقيقيًا — لنا فيك مكان.'
                : 'If you love details and believe quality changes everything — there is a seat here for you.'}
            </p>

            <a
              href="mailto:nakhlacoal@gmail.com?subject=Careers%20%E2%80%94%20Palm%20Charcoal"
              className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[hsl(var(--gold))]/50 text-[hsl(var(--gold-hi,46_95%_78%))] hover:bg-[hsl(var(--gold))]/10 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]/70"
            >
              {isAr ? 'أرسل سيرتك الذاتية' : 'Send your CV'} <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Right: role list */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[hsl(var(--gold))]/15 bg-white/[0.02] overflow-hidden">
              {roles.map((r, i) => (
                <motion.a
                  key={i}
                  href="mailto:nakhlacoal@gmail.com?subject=Application%20%E2%80%94%20Palm%20Charcoal"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                  className={`group flex items-center justify-between gap-6 p-5 md:p-7 ${
                    i > 0 ? 'border-t border-[hsl(var(--gold))]/10' : ''
                  } hover:bg-[hsl(var(--gold))]/[0.04] transition-colors focus-visible:outline-none focus-visible:bg-[hsl(var(--gold))]/[0.06]`}
                >
                  <div className="min-w-0">
                    <h3 className={`text-base md:text-xl text-white truncate ${isAr ? 'font-arabic' : 'font-display'}`}>
                      {r.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-white/50 text-xs md:text-sm font-arabic">
                      <MapPin className="w-3.5 h-3.5 text-[hsl(var(--gold))]/70" />
                      {r.loc}
                    </div>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full border border-[hsl(var(--gold))]/30 grid place-items-center text-[hsl(var(--gold-hi,46_95%_78%))] group-hover:border-[hsl(var(--gold))]/70 group-hover:bg-[hsl(var(--gold))]/10 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </motion.a>
              ))}
            </div>
            <p className="mt-4 text-[11px] tracking-[0.25em] uppercase text-white/40 font-arabic">
              {isAr ? '٤ أدوار مفتوحة · تُحدَّث شهريًا' : '4 open roles · updated monthly'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
