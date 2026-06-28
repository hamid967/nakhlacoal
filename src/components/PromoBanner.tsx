import { useTranslation } from 'react-i18next';
import { Flame, MapPin, ShieldCheck, Phone } from 'lucide-react';

export function PromoBanner() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const items = isAr
    ? [
        { icon: Flame, text: 'عروض الجملة متاحة — تواصل معنا الآن' },
        { icon: MapPin, text: 'سوق الفحم، البلد، جدة' },
        { icon: ShieldCheck, text: '٥ علامات تجارية مسجلة — وزارة التجارة السعودية' },
        { icon: Phone, text: '‎+966 50 123 4567' },
      ]
    : [
        { icon: Flame, text: 'Wholesale offers available — contact us now' },
        { icon: MapPin, text: 'Charcoal Souq, Al-Balad, Jeddah' },
        { icon: ShieldCheck, text: '5 registered trademarks — KSA Ministry of Commerce' },
        { icon: Phone, text: '+966 50 123 4567' },
      ];

  const Row = () => (
    <div className="flex items-center shrink-0">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2 px-8">
          <it.icon className="w-3.5 h-3.5 text-[hsl(var(--gold-hi))] shrink-0" />
          <span className="whitespace-nowrap">{it.text}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="fixed top-0 inset-x-0 z-[70] text-[hsl(var(--background))] text-[11px] md:text-xs border-b border-[hsl(var(--gold))]/20"
      style={{ background: 'hsl(var(--dark))' }}
    >
      <div className="relative overflow-hidden py-2">
        <div
          className="flex gap-0 w-max"
          style={{
            animation: `marquee-promo 38s linear infinite`,
            animationDirection: isAr ? 'reverse' : 'normal',
          }}
        >
          <Row />
          <Row />
        </div>
      </div>
      <style>{`@keyframes marquee-promo { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
