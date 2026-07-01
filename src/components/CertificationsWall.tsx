import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Award, Leaf, BadgeCheck, Globe2, Factory } from 'lucide-react';

export function CertificationsWall() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const certs = [
    { icon: ShieldCheck, code: 'SASO', ar: 'المواصفات السعودية', en: 'Saudi Standards', desc: isAr ? 'مطابقة الفحم للمواصفات المحلية' : 'Compliant with national specs' },
    { icon: BadgeCheck, code: 'ISO 9001', ar: 'إدارة الجودة', en: 'Quality Management', desc: isAr ? 'نظام موثّق لضبط الجودة' : 'Documented quality system' },
    { icon: Leaf, code: 'HALAL', ar: 'حلال', en: 'Halal Certified', desc: isAr ? 'خطوط إنتاج نظيفة ومعتمدة' : 'Clean, certified production lines' },
    { icon: Award, code: 'ZATCA', ar: 'فوترة إلكترونية', en: 'E-Invoicing', desc: isAr ? 'فواتير معتمدة ومطابقة للهيئة' : 'Fully compliant e-invoices' },
    { icon: Globe2, code: 'EXPORT', ar: 'ترخيص تصدير', en: 'Export License', desc: isAr ? 'تصدير إلى 12+ دولة' : 'Exporting to 12+ countries' },
    { icon: Factory, code: 'HACCP', ar: 'سلامة الإنتاج', en: 'Production Safety', desc: isAr ? 'ضوابط سلامة المصنع' : 'Facility safety controls' },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#0B0B0B]">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4">
            {isAr ? 'اعتمادات وشهادات' : 'Credentials'}
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
            {isAr ? 'ثقة موثّقة على الورق' : 'Trust, documented on paper'}
          </h2>
          <p className="mt-5 text-white/60 text-base md:text-lg font-arabic">
            {isAr
              ? 'اعتمادات محلية ودولية تؤكّد التزامنا بالمعايير الأعلى في الإنتاج والتوريد.'
              : 'National and international credentials attest to our commitment to the highest standards.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {certs.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group relative rounded-2xl border border-[hsl(var(--gold))]/15 bg-[#141414] p-6 md:p-8 hover:border-[hsl(var(--gold))]/50 transition-all hover:-translate-y-1"
              >
                {/* corner gold accent */}
                <div className="absolute top-0 end-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,hsl(46_72%_62%/0.25),transparent_70%)] rounded-tr-2xl pointer-events-none" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gold))]/10 ring-1 ring-[hsl(var(--gold))]/30 flex items-center justify-center text-[hsl(var(--gold))] group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] tracking-[0.3em] text-[hsl(var(--gold))]/70 font-mono">
                    {c.code}
                  </div>
                </div>

                <div className="text-white text-lg font-semibold font-arabic mb-2">
                  {isAr ? c.ar : c.en}
                </div>
                <div className="text-white/55 text-sm leading-relaxed font-arabic">
                  {c.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
