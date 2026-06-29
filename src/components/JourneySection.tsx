import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import s1 from '@/assets/journey/01-harvest.jpg';
import s2 from '@/assets/journey/02-sorting.jpg';
import s3 from '@/assets/journey/03-kiln.jpg';
import s4 from '@/assets/journey/04-embers.jpg';
import s5 from '@/assets/journey/05-lab.jpg';
import s6 from '@/assets/journey/06-export.jpg';

type Scene = { img: string; titleAr: string; titleEn: string; bodyAr: string; bodyEn: string };

const SCENES: Scene[] = [
  { img: s1, titleAr: 'الحصاد', titleEn: 'Harvest', bodyAr: 'من بساتين النخيل السعودية — جمع جذوع وسعف النخيل المُقلَّمة بأسلوب مستدام.', bodyEn: 'From Saudi palm groves — sustainably collected pruned palm wood.' },
  { img: s2, titleAr: 'الفرز', titleEn: 'Sorting', bodyAr: 'في ورشتنا بسوق الفحم بجدة، يُختار كل قطعة يدوياً.', bodyEn: 'Inside our Jeddah Souq workshop, every piece is hand-selected.' },
  { img: s3, titleAr: 'الكور', titleEn: 'The Kiln', bodyAr: 'حرق بطيء في أفران ترابية تقليدية يحافظ على الكثافة والنقاء.', bodyEn: 'Slow burn in earthen kilns preserves density and purity.' },
  { img: s4, titleAr: 'الجمر', titleEn: 'Embers', bodyAr: 'حرارة ثابتة، احتراق طويل، رماد منخفض — بدون روائح.', bodyEn: 'Steady heat, long burn, low ash — odor-free.' },
  { img: s5, titleAr: 'الفحص', titleEn: 'Lab Check', bodyAr: 'اختبارات دقيقة لكل دفعة قبل التعبئة.', bodyEn: 'Precision lab tests on every batch before packaging.' },
  { img: s6, titleAr: 'التصدير', titleEn: 'Export', bodyAr: 'من جدة إلى العالم — تغليف فاخر جاهز للشحن.', bodyEn: 'From Jeddah to the world — luxury packaging ready to ship.' },
];

export function JourneySection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          const next = new Set(prev);
          entries.forEach((e) => {
            const i = Number((e.target as HTMLElement).dataset.idx);
            if (e.isIntersecting) next.add(i); else next.delete(i);
          });
          return next;
        });
      },
      { threshold: 0.35 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative py-20 md:py-28 bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 mb-12 md:mb-16 text-center">
        <span className="eyebrow">{isAr ? 'رحلة الفحم' : 'The Journey'}</span>
        <h2 className={`text-3xl md:text-5xl mt-3 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
          {isAr ? 'رحلة فحم النخلة — مشهداً بمشهد' : 'Palm Charcoal Journey — Scene by Scene'}
        </h2>
      </div>

      <div className="container mx-auto px-4 space-y-10 md:space-y-16">
        {SCENES.map((sc, i) => {
          const isOn = visible.has(i);
          const flip = i % 2 === 1;
          return (
            <article
              key={i}
              data-idx={i}
              ref={(el) => (refs.current[i] = el)}
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center ${flip ? 'md:[direction:rtl]' : ''}`}
            >
              {/* Image with Ken Burns + reveal */}
              <div
                className={`relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-[16/10] border border-[hsl(var(--gold))]/30 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] [direction:ltr] transition-all duration-1000 ease-out ${
                  isOn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <img
                  src={sc.img}
                  alt={isAr ? sc.titleAr : sc.titleEn}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className={`absolute inset-0 w-full h-full object-cover will-change-transform transition-transform duration-[7000ms] ease-out ${
                    isOn ? 'scale-110' : 'scale-100'
                  }`}
                />
                {/* gradient veil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                {/* gold scan sweep */}
                <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
                  style={{
                    background: 'linear-gradient(115deg, transparent 42%, rgba(201,168,76,0.25) 50%, transparent 58%)',
                    animation: isOn ? 'journeySweep 4.5s ease-in-out infinite' : 'none',
                  }}
                />
                {/* scene number badge */}
                <div className="absolute top-4 start-4 px-3 py-1 rounded-full bg-black/55 backdrop-blur text-[hsl(var(--gold-hi))] text-[11px] tracking-[0.3em] font-mono [direction:ltr]">
                  SCENE · {String(i + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Copy */}
              <div className="[direction:ltr]" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
                <div className={`text-[11px] tracking-[0.4em] text-[hsl(var(--gold-hi))] mb-3 font-mono`}>
                  {String(i + 1).padStart(2, '0')} / {SCENES.length.toString().padStart(2, '0')}
                </div>
                <h3 className={`text-2xl md:text-4xl mb-4 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}
                    style={{ color: '#1A4A00' }}>
                  {isAr ? sc.titleAr : sc.titleEn}
                </h3>
                <p className={`text-base md:text-lg leading-loose text-foreground/75 ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? sc.bodyAr : sc.bodyEn}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="block h-px w-12 bg-gradient-to-r from-[hsl(var(--gold))] to-transparent" />
                  <span className="text-[hsl(var(--gold))] rotate-45 inline-block w-2 h-2 border border-[hsl(var(--gold))]" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        @keyframes journeySweep { 0%,100% { transform: translateX(-40%); } 50% { transform: translateX(40%); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="journeySweep"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
