import { Link } from 'react-router-dom';
import { User, Building2, Globe2, MessageCircle, ShoppingBag, FileText, Ship } from 'lucide-react';
import { useDir, LuxSection, SectionHeader } from '@/components/ui-lux';
import { ScrollReveal } from '@/components/ScrollReveal';
import { SectionNumber } from '@/components/SectionNumber';
import { trackConversion } from '@/lib/track';
import { brand } from '@/lib/brand';

export function AudienceTracks() {
  const { isAr, Arrow } = useDir();

  const waLink = (msg: string) =>
    `${brand.footer.whatsapp}?text=${encodeURIComponent(msg)}`;

  const tracks = [
    {
      id: 'retail',
      icon: User,
      title: isAr ? 'أفراد' : 'Individuals',
      lead: isAr ? 'لجلسات الشواء والمعسل والبخور في المنزل.' : 'For home BBQ, hookah, and incense sessions.',
      bullets: isAr
        ? ['أكياس صغيرة وكراتين', 'توصيل داخل المدن السعودية', 'دعم سريع عبر واتساب']
        : ['Small bags & cartons', 'Delivery across KSA', 'Fast WhatsApp support'],
      primary: {
        icon: ShoppingBag,
        label: isAr ? 'تسوّق الآن' : 'Shop now',
        to: '/products',
      },
      secondary: {
        icon: MessageCircle,
        label: isAr ? 'اطلب عبر واتساب' : 'Order via WhatsApp',
        href: waLink(isAr ? 'مرحبًا، أرغب بطلب فحم للاستخدام المنزلي.' : 'Hi, I would like to order charcoal for home use.'),
      },
      note: isAr ? 'توصيل سريع · دفع عند الاستلام' : 'Fast delivery · Cash on delivery',
    },
    {
      id: 'wholesale',
      icon: Building2,
      title: isAr ? 'جملة ومطاعم' : 'Wholesale & HoReCa',
      lead: isAr ? 'مطاعم، مقاهي شيشة، فعاليات، وموزّعون محليون.' : 'Restaurants, hookah lounges, events, and local distributors.',
      bullets: isAr
        ? ['أسعار طبقية حسب الكمية', 'تعبئة بالكرتون والطن', 'عقود توريد شهرية']
        : ['Tiered pricing by volume', 'Carton & ton packaging', 'Monthly supply contracts'],
      primary: {
        icon: FileText,
        label: isAr ? 'اطلب عرض سعر' : 'Get a quote',
        to: '/wholesale',
      },
      secondary: {
        icon: MessageCircle,
        label: isAr ? 'تحدّث مع المبيعات' : 'Talk to sales',
        href: waLink(isAr ? 'مرحبًا، أحتاج عرض سعر جملة لمطعم/مقهى.' : 'Hi, I need a wholesale quote for a restaurant/lounge.'),
      },
      note: isAr ? 'رد خلال ساعة عمل · خصومات تصاعدية' : 'Reply within 1 business hr · Volume discounts',
    },
    {
      id: 'export',
      icon: Globe2,
      title: isAr ? 'تصدير' : 'Export',
      lead: isAr ? 'مستوردون وموزّعون دوليون بشروط FOB/CIF كاملة.' : 'International importers & distributors — FOB/CIF terms.',
      bullets: isAr
        ? ['حاويات 20/40 قدم', 'وثائق منشأ وشهادات', 'تعبئة خاصة بعلامتك']
        : ['20/40 ft containers', 'CoO & lab certificates', 'Private label packaging'],
      primary: {
        icon: Ship,
        label: isAr ? 'طلب عرض تصدير' : 'Request export quote',
        to: '/export',
      },
      secondary: {
        icon: MessageCircle,
        label: isAr ? 'تواصل مع فريق التصدير' : 'Contact export team',
        href: waLink(isAr ? 'Hello, I am an importer interested in container orders (FOB/CIF).' : 'Hello, I am an importer interested in container orders (FOB/CIF).'),
      },
      note: isAr ? 'شحن عالمي · مستندات كاملة' : 'Worldwide shipping · Full documentation',
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
              <ul className="space-y-2 mb-6 text-sm text-foreground/80 font-arabic">
                {t.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-2.5">
                <Link
                  to={t.primary.to}
                  onClick={() => trackConversion('audience_track_click', { track: t.id, cta: 'primary' })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--gold))] text-[hsl(var(--background))] hover:bg-[hsl(var(--gold-hi))] transition-colors text-sm font-arabic font-bold shadow-[0_8px_24px_-12px_hsl(var(--gold)/0.6)]"
                >
                  <t.primary.icon className="w-4 h-4" />
                  <span>{t.primary.label}</span>
                  <Arrow className="w-4 h-4" />
                </Link>
                <a
                  href={t.secondary.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackConversion('audience_track_click', { track: t.id, cta: 'whatsapp' })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold-hi))] hover:bg-[hsl(var(--gold))]/10 transition-colors text-sm font-arabic"
                >
                  <t.secondary.icon className="w-4 h-4" />
                  <span>{t.secondary.label}</span>
                </a>
                <p className="text-[11px] text-foreground/55 font-arabic text-center pt-1">{t.note}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </LuxSection>
  );
}

