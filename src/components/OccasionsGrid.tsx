import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, Tent, Flame, Coffee, Beef, Ship } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { LuxSection, SectionHeader } from '@/components/ui-lux';
import restaurants from '@/assets/occasions/restaurants.jpg';
import camping from '@/assets/occasions/camping.jpg';
import fireplaces from '@/assets/occasions/fireplaces.jpg';
import hospitality from '@/assets/occasions/hospitality.jpg';
import bbq from '@/assets/product-bbq.jpg';
import exportImg from '@/assets/journey/06-export.jpg';

type Occasion = {
  icon: typeof Flame;
  titleAr: string; titleEn: string;
  bodyAr: string;  bodyEn: string;
  img: string;
};

const ITEMS: Occasion[] = [
  { icon: UtensilsCrossed, titleAr: 'المطاعم', titleEn: 'Restaurants', bodyAr: 'جودة ثابتة تلبّي احتياجات المطابخ.', bodyEn: 'Consistent quality for professional kitchens.', img: restaurants },
  { icon: Tent,            titleAr: 'التخييم',  titleEn: 'Camping',     bodyAr: 'رفيقك المثالي في الرحلات والبر.',    bodyEn: 'Your ideal companion in the wild.',       img: camping },
  { icon: Flame,           titleAr: 'المدافئ',  titleEn: 'Fireplaces',  bodyAr: 'دفء بنوم في أجواء البرودة.',          bodyEn: 'Cozy warmth on cold nights.',             img: fireplaces },
  { icon: Coffee,          titleAr: 'الضيافة',  titleEn: 'Hospitality', bodyAr: 'لضيافة عربية أصيلة.',                bodyEn: 'For authentic Arabian hospitality.',      img: hospitality },
  { icon: Beef,            titleAr: 'الشواء',   titleEn: 'BBQ',         bodyAr: 'نكهة لا تُقاوم لكل مرة.',             bodyEn: 'Irresistible flavor, every time.',        img: bbq },
  { icon: Ship,            titleAr: 'التصدير',  titleEn: 'Export',      bodyAr: 'نصل العالم بجودة سعودية.',            bodyEn: 'Saudi quality reaching the world.',       img: exportImg },
];

export function OccasionsGrid() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <LuxSection className="py-20 md:py-28 relative overflow-hidden">
      {/* Cinematic ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 motion-reduce:hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-[hsl(var(--gold))]/[0.05] blur-3xl" />
      </div>

      <ScrollReveal>
        <SectionHeader
          eyebrow={isAr ? 'المناسبات' : 'Occasions'}
          title={isAr ? 'فحم النخلة… مناسب لكل لحظة' : 'Palm Charcoal — for every moment'}
          lead={
            isAr
              ? 'من مطابخ المطاعم الراقية إلى ليالي التخييم ودفء المدافئ وأصالة الضيافة العربية، يرافقك فحم النخلة في كل مناسبة بجودة ثابتة ورائحة نقيّة وأداء يدوم.'
              : 'From fine-dining kitchens and desert campfires to cozy fireplaces, authentic Arabian hospitality, premium BBQ, and global export — Palm Charcoal delivers consistent quality, pure aroma, and long-lasting performance for every occasion.'
          }
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {ITEMS.map((it, i) => {
          const Icon = it.icon;
          return (
            <ScrollReveal key={i} delay={120 + i * 110}>
              <article
                className="group relative flex items-stretch gap-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--gold))]/20 p-3 md:p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] hover:border-[hsl(var(--gold))]/50 transition-[border-color,box-shadow] duration-500 overflow-hidden motion-safe:hover:shadow-[0_20px_50px_-15px_hsl(var(--gold)/0.35)] motion-safe:hover:-translate-y-1 motion-safe:transition-all"
              >
                {/* Cinematic shimmer sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/10 to-transparent motion-reduce:hidden"
                />

                {/* Icon — start side */}
                <div className="shrink-0 grid place-items-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[hsl(var(--gold))]/15 to-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/30 text-[hsl(var(--gold))] motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-3 transition-transform duration-500">
                  <Icon className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.6} />
                </div>

                {/* Text — middle */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className={`text-lg md:text-xl text-foreground ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                    {isAr ? it.titleAr : it.titleEn}
                  </h3>
                  <p className={`text-xs md:text-sm text-foreground/65 mt-1 leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? it.bodyAr : it.bodyEn}
                  </p>
                </div>

                {/* Image — end side */}
                <div className="shrink-0 w-20 md:w-24 h-20 md:h-24 rounded-xl overflow-hidden ring-1 ring-[hsl(var(--gold))]/20">
                  <img
                    src={it.img}
                    alt={isAr ? it.titleAr : it.titleEn}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover motion-safe:group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </LuxSection>
  );
}

export default OccasionsGrid;
