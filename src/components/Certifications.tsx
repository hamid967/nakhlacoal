import { useTranslation } from 'react-i18next';
import { ShieldCheck, Award, BadgeCheck, Globe2, Leaf, Factory } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

/**
 * Trust/Certifications strip — surfaces compliance & quality marks
 * for B2B buyers (wholesale, hospitality, export). Pure presentation.
 */
export function Certifications() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const items = [
    { icon: BadgeCheck, ar: 'علامة تجارية مسجلة', en: 'Registered Trademark', sub: '143313025' },
    { icon: ShieldCheck, ar: 'مطابق لمواصفات SASO', en: 'SASO Compliant', sub: 'KSA' },
    { icon: Leaf, ar: 'طبيعي ١٠٠٪', en: '100% Natural', sub: isAr ? 'بدون كيماويات' : 'No Chemicals' },
    { icon: Award, ar: 'حلال معتمد', en: 'Halal Certified', sub: 'GCC' },
    { icon: Factory, ar: 'تصنيع وفق ISO', en: 'ISO-Aligned Manufacturing', sub: '9001' },
    { icon: Globe2, ar: 'جاهز للتصدير', en: 'Export Ready', sub: '12+ ' + (isAr ? 'دولة' : 'Countries') },
  ];

  return (
    <section className="py-12 md:py-16 border-y border-gold/15 bg-surface/50">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold-lo font-mono">
              {isAr ? 'موثوقون · معتمدون' : 'Trusted · Certified'}
            </div>
            <h2 className={`mt-3 text-xl md:text-2xl text-foreground/85 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>
              {isAr ? 'جودة موثّقة بمعايير عالمية' : 'Quality verified by international standards'}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {items.map((it, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-gold/20 bg-background/60 backdrop-blur-sm p-4 md:p-5 flex flex-col items-center text-center transition-all duration-500 hover:border-gold/50 hover:bg-background hover:-translate-y-0.5">
                <span className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gold/10 text-gold-hi flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110">
                  <it.icon className="w-5 h-5 md:w-6 md:h-6" />
                </span>
                <div className={`text-[12px] md:text-sm font-semibold text-foreground/90 leading-tight ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? it.ar : it.en}
                </div>
                <div className="text-[10px] md:text-[11px] text-foreground/55 mt-1 font-mono tracking-wider">
                  {it.sub}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
