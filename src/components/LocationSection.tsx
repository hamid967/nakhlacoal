import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { LuxSection, SectionHeader, Eyebrow, useDir } from '@/components/ui-lux';

const QUERY = 'سوق الفحم البلد جدة';
const MAPS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(QUERY)}`;
const EMBED = `https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&output=embed`;

export function LocationSection() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const { Arrow } = useDir();

  const rows = [
    { icon: MapPin, label: isAr ? 'العنوان' : 'Address', value: isAr ? 'سوق الفحم، البلد، جدة 21433' : 'Charcoal Souq, Al-Balad, Jeddah 21433' },
    { icon: Clock, label: isAr ? 'أوقات العمل' : 'Hours', value: isAr ? 'السبت – الخميس · 9 ص – 11 م' : 'Sat – Thu · 9 AM – 11 PM' },
    { icon: Phone, label: isAr ? 'هاتف' : 'Phone', value: '+966 50 123 4567' },
  ];

  return (
    <LuxSection tone="surface" id="location">
      <SectionHeader
        eyebrow={isAr ? 'زورونا' : 'Visit us'}
        title={isAr ? 'سوق الفحم في البلد، جدة' : 'Charcoal Souq, Al-Balad, Jeddah'}
        lead={isAr
          ? 'نرحب بزيارتكم في مقرنا الرئيسي في أعرق أسواق الفحم في المملكة — فريقنا جاهز لاستقبالكم ومساعدتكم.'
          : 'Visit our headquarters in the oldest charcoal market in the Kingdom — our team is ready to welcome you.'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        <ScrollReveal className="lg:col-span-5">
          <div className="h-full rounded-3xl border-luxe bg-background p-8 md:p-10 flex flex-col">
            <Eyebrow>{isAr ? 'تفاصيل التواصل' : 'Contact details'}</Eyebrow>

            <ul className="mt-8 space-y-6 flex-1">
              {rows.map((r, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="relative w-12 h-12 rounded-full bg-jade/10 text-jade flex items-center justify-center shrink-0">
                    <r.icon className="w-5 h-5" />
                    <span className="absolute inset-0 rounded-full ring-1 ring-jade/20" />
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-foreground/55 font-arabic">{r.label}</div>
                    <div className="mt-1 text-base font-medium font-arabic text-dark">{r.value}</div>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-dark text-background text-sm font-bold hover:bg-jade transition-colors font-arabic"
            >
              <Navigation className="w-4 h-4" />
              {isAr ? 'افتح في خرائط جوجل' : 'Open in Google Maps'}
              <Arrow className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150} className="lg:col-span-7">
          <div className="relative h-[420px] lg:h-full min-h-[420px] rounded-3xl overflow-hidden border-luxe shadow-luxe">
            <iframe
              title={isAr ? 'موقع فحم النخلة' : 'Palm Charcoal location'}
              src={EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, filter: 'saturate(0.9) contrast(0.95)' }}
            />
            {/* Decorative gold ring badge */}
            <div className="absolute top-5 start-5 flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-md border-luxe shadow-luxe">
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inset-0 rounded-full bg-jade/50 animate-ping" />
                <span className="relative w-2.5 h-2.5 rounded-full bg-jade" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.25em] font-arabic text-dark">
                {isAr ? 'مفتوح الآن' : 'Open now'}
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </LuxSection>
  );
}
