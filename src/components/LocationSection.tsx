import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Phone, Navigation, Mail } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { LuxSection, SectionHeader, Eyebrow, useDir } from '@/components/ui-lux';
import { useTilt } from '@/hooks/useTilt';

const QUERY = 'سوق الفحم البلد جدة';
const MAPS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(QUERY)}`;
const EMBED = `https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&output=embed`;

export function LocationSection() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const { Arrow } = useDir();
  const tiltA = useTilt<HTMLDivElement>(4);
  const tiltB = useTilt<HTMLDivElement>(3);

  const rows = [
    { icon: MapPin, label: isAr ? 'العنوان' : 'Address', value: isAr ? 'سوق الفحم، البلد، جدة 21433' : 'Charcoal Souq, Al-Balad, Jeddah 21433' },
    { icon: Clock, label: isAr ? 'أوقات العمل' : 'Hours', value: isAr ? 'السبت – الخميس · 9 ص – 11 م' : 'Sat – Thu · 9 AM – 11 PM' },
    { icon: Phone, label: isAr ? 'واتساب' : 'WhatsApp', value: '+966 54 006 0095' },
    { icon: Mail, label: isAr ? 'البريد للطلبات' : 'Orders email', value: 'mab355@gmail.com' },
  ];

  return (
    <LuxSection tone="surface">
      <SectionHeader
        eyebrow={isAr ? 'زورونا' : 'Visit us'}
        title={isAr ? 'سوق الفحم في البلد، جدة' : 'Charcoal Souq, Al-Balad, Jeddah'}
        lead={isAr
          ? 'نرحب بزيارتكم في مقرنا الرئيسي في أعرق أسواق الفحم في المملكة — فريقنا جاهز لاستقبالكم ومساعدتكم.'
          : 'Visit our headquarters in the oldest charcoal market in the Kingdom — our team is ready to welcome you.'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch">
        <ScrollReveal className="lg:col-span-5">
          <div ref={tiltA.ref} onPointerMove={tiltA.onPointerMove} onPointerLeave={tiltA.onPointerLeave} className="clay-card h-full p-5 sm:p-8 md:p-10 flex flex-col">
            <Eyebrow>{isAr ? 'تفاصيل التواصل' : 'Contact details'}</Eyebrow>

            <ul className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 flex-1">
              {rows.map((r, i) => (
                <li key={i} className="flex items-start gap-3 sm:gap-4">
                  <span className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-jade/10 text-jade flex items-center justify-center shrink-0">
                    <r.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="absolute inset-0 rounded-full ring-1 ring-jade/20" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-foreground/55 font-arabic">{r.label}</div>
                    <div className="mt-1 text-sm sm:text-base font-medium font-arabic text-dark break-words">{r.value}</div>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-8 sm:mt-10 inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-dark text-background text-xs sm:text-sm font-bold hover:bg-jade transition-colors font-arabic"
            >
              <Navigation className="w-4 h-4" />
              {isAr ? 'افتح في خرائط جوجل' : 'Open in Google Maps'}
              <Arrow className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150} className="lg:col-span-7">
          <div ref={tiltB.ref} onPointerMove={tiltB.onPointerMove} onPointerLeave={tiltB.onPointerLeave} className="clay-card relative h-[300px] sm:h-[380px] lg:h-full lg:min-h-[420px] overflow-hidden p-0">
            <iframe
              title={isAr ? 'موقع فحم النخلة' : 'Palm Charcoal location'}
              src={EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, filter: 'saturate(0.9) contrast(0.95)' }}
            />
            {/* Decorative gold ring badge */}
            <div className="absolute top-3 sm:top-5 start-3 sm:start-5 flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/90 backdrop-blur-md border-luxe shadow-luxe">
              <span className="relative flex w-2 h-2 sm:w-2.5 sm:h-2.5">
                <span className="absolute inset-0 rounded-full bg-jade/50 animate-ping" />
                <span className="relative w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-jade" />
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-arabic text-dark">
                {isAr ? 'مفتوح الآن' : 'Open now'}
              </span>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </LuxSection>
  );
}
