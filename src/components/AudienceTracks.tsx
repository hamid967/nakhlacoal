import { Link } from 'react-router-dom';
import { User, Building2, Globe2 } from 'lucide-react';
import { useDir, LuxSection, SectionHeader, Eyebrow } from '@/components/ui-lux';
import { ScrollReveal } from '@/components/ScrollReveal';
import { SectionNumber } from '@/components/SectionNumber';
import { trackConversion } from '@/lib/track';

export function AudienceTracks() {
  const { isAr, Arrow } = useDir();

  const tracks = [
    {
      id: 'retail',
      icon: User,
      title: isAr ? 'أفراد' : 'Individuals',
      lead: isAr ? 'لجلسات الشواء والمعسل والبخور في المنزل.' : 'For home BBQ, hookah, and incense sessions.',
      bullets: isAr
        ? ['أكياس صغيرة وكراتين', 'توصيل داخل المدن السعودية', 'دعم سريع عبر واتساب']
        : ['Small bags & cartons', 'Delivery across KSA', 'Fast WhatsApp support'],
      cta: isAr ? 'تسوّق المنتجات' : 'Shop products',
      to: '/products',
    },
    {
      id: 'wholesale',
      icon: Building2,
      title: isAr ? 'جملة ومطاعم' : 'Wholesale & HoReCa',
      lead: isAr ? 'مطاعم، مقاهي شيشة، فعاليات، وموزّعون محليون.' : 'Restaurants, hookah lounges, events, and local distributors.',
      bullets: isAr
        ? ['أسعار طبقية حسب الكمية', 'تعبئة بالكرتون والطن', 'عقود توريد شهرية']
        : ['Tiered pricing by volume', 'Carton & ton packaging', 'Monthly supply contracts'],
      cta: isAr ? 'طلب عرض جملة' : 'Request wholesale quote',
      to: '/wholesale',
    },
    {
      id: 'export',
      icon: Globe2,
      title: isAr ? 'تصدير' : 'Export',
      lead: isAr ? 'مستوردون وموزّعون دوليون بشروط FOB/CIF كاملة.' : 'International importers & distributors — FOB/CIF terms.',
      bullets: isAr
        ? ['حاويات 20/40 قدم', 'وثائق منشأ وشهادات', 'تعبئة خاصة بعلامتك']
        : ['20/40 ft containers', 'CoO & lab certificates', 'Private label packaging'],
      cta: isAr ? 'طلب عرض تصدير' : 'Request export quote',
      to: '/export',
    },
  ];

  return (
    <LuxSection tone="surface" className="section">
      <div className="container"><SectionNumber index={2} /></div>
      <SectionHeader
        eyebrow={isAr ? 'اختر مسارك' : 'Choose your path'}
        title={isAr ? 'حلول مفصّلة لكل عميل' : 'Tailored solutions for every buyer'}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {tracks.map((t, i) => (
          <ScrollReveal key={t.id} delay={i * 120}>
            <div className="clay-card rounded-3xl p-7 md:p-8 h-full flex flex-col group hover:translate-y-[-4px] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold-hi mb-5">
                <t.icon className="w-6 h-6" />
              </div>
              <h3 className={`text-2xl mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display font-bold'}`}>{t.title}</h3>
              <p className="text-foreground/70 mb-5 font-arabic leading-relaxed">{t.lead}</p>
              <ul className="space-y-2 mb-7 text-sm text-foreground/80 font-arabic">
                {t.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={t.to}
                onClick={() => trackConversion('audience_track_click', { track: t.id })}
                className="mt-auto inline-flex items-center gap-2 text-gold-hi border-b border-gold/40 hover:border-gold pb-1 text-sm font-arabic self-start"
              >
                {t.cta} <Arrow className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </LuxSection>
  );
}
