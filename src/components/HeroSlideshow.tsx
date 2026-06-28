import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageWatermark } from './ImageWatermark';
import { Picture } from './Picture';
import slide1 from '@/assets/slide-coconut-trees.jpg?picture';
import slide2 from '@/assets/slide-coconut-factory.jpg?picture';
import slide3 from '@/assets/slide-coconut-charcoal.jpg?picture';

export function HeroSlideshow() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const slides = [
    { img: slide1, ar: 'مزارع جوز الهند — إندونيسيا', en: 'Coconut Plantations — Indonesia' },
    { img: slide2, ar: 'مصنع الفحم — أفران تقليدية', en: 'Charcoal Factory — Traditional Kilns' },
    { img: slide3, ar: 'فحم معسل جوز الهند الفاخر', en: 'Premium Coconut Hookah Charcoal' },
  ];

  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-[2rem] border-luxe shadow-luxe group">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-all duration-[2000ms] ease-out"
          style={{
            opacity: idx === i ? 1 : 0,
            transform: idx === i ? 'scale(1.05)' : 'scale(1.15)',
            transitionProperty: 'opacity, transform',
          }}
        >
          <Picture
            source={s.img}
            alt={isAr ? s.ar : s.en}
            eager={idx === 0}
            priority={idx === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="block w-full h-full"
            imgClassName="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/10 to-transparent" />
        </div>
      ))}

      <ImageWatermark variant="light" position="br" />


      {/* Caption */}
      <div className="absolute bottom-6 inset-x-6 text-background">
        <div
          key={i}
          className="text-sm md:text-base font-arabic font-medium animate-[fade-in_0.8s_ease-out]"
        >
          {isAr ? slides[i].ar : slides[i].en}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute top-5 inset-x-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === i ? 'w-8 bg-gold-hi' : 'w-4 bg-background/40 hover:bg-background/70'
            }`}
          />
        ))}
      </div>

      {/* Gold sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(115deg, transparent 40%, rgba(212,175,55,0.18) 50%, transparent 60%)',
        }}
      />
    </div>
  );
}
