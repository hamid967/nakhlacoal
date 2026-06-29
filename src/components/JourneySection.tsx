import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause } from 'lucide-react';
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

// 8 sprocket holes per frame visually
const PERFS = Array.from({ length: 56 });

export function JourneySection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const stripRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Auto-advance
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setActive((a) => (a + 1) % SCENES.length), 3800);
    return () => clearInterval(t);
  }, [playing]);

  // Scroll active frame into view
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const frame = strip.querySelector<HTMLElement>(`[data-frame="${active}"]`);
    if (frame) frame.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  const current = SCENES[active];

  return (
    <section className="relative py-20 md:py-28 bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 mb-10 md:mb-14 text-center">
        <span className="eyebrow">{isAr ? 'رحلة الفحم' : 'The Journey'}</span>
        <h2 className={`text-3xl md:text-5xl mt-3 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
          {isAr ? 'رحلة فحم النخلة — من الطبيعة إلى التميز' : 'Palm Charcoal Journey — Nature to Excellence'}
        </h2>
      </div>

      {/* FILMSTRIP */}
      <div className="relative">
        {/* Black film body */}
        <div className="relative bg-[#0a0a0a] py-4 md:py-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          {/* Sprocket perforations — top */}
          <div className="absolute inset-x-0 top-0 h-4 md:h-5 flex items-center justify-around px-2 overflow-hidden" aria-hidden>
            {PERFS.map((_, i) => (
              <span key={`t-${i}`} className="w-3 md:w-4 h-2 md:h-2.5 rounded-[2px] bg-[hsl(var(--background))] shrink-0" />
            ))}
          </div>
          {/* Sprocket perforations — bottom */}
          <div className="absolute inset-x-0 bottom-0 h-4 md:h-5 flex items-center justify-around px-2 overflow-hidden" aria-hidden>
            {PERFS.map((_, i) => (
              <span key={`b-${i}`} className="w-3 md:w-4 h-2 md:h-2.5 rounded-[2px] bg-[hsl(var(--background))] shrink-0" />
            ))}
          </div>

          {/* Frames scroller */}
          <div
            ref={stripRef}
            className="relative flex gap-2 md:gap-3 overflow-x-auto snap-x snap-mandatory px-6 md:px-10 py-5 md:py-7 scrollbar-none [direction:ltr]"
            style={{ scrollbarWidth: 'none' }}
            role="group"
            aria-label={isAr ? 'رحلة فحم النخلة' : 'Palm Charcoal Journey'}
          >
            {SCENES.map((sc, i) => (
              <button
                key={i}
                data-frame={i}
                onClick={() => { setActive(i); setPlaying(false); }}
                aria-label={isAr ? sc.titleAr : sc.titleEn}
                aria-current={active === i}
                className={`group relative shrink-0 snap-center w-[78vw] sm:w-[42vw] md:w-[32vw] lg:w-[22vw] aspect-[4/3] rounded-sm overflow-hidden border-2 transition-all duration-500 ${
                  active === i
                    ? 'border-[hsl(var(--gold))] scale-[1.02] shadow-[0_0_40px_-10px_hsl(var(--gold)/0.6)]'
                    : 'border-[#1a1a1a] opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={sc.img}
                  alt=""
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                    active === i ? 'scale-110' : 'scale-100 grayscale'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-black/70 text-[hsl(var(--gold-hi))] text-[9px] md:text-[10px] tracking-[0.25em] font-mono">
                  {String(i + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
                </div>
                <div className={`absolute bottom-2 left-2 right-2 text-white text-xs md:text-sm ${isAr ? 'font-arabic font-bold text-right' : 'font-display'}`}>
                  {isAr ? sc.titleAr : sc.titleEn}
                </div>
              </button>
            ))}
          </div>

          {/* Center gold play button */}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 grid place-items-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--gold))] text-black shadow-[0_0_0_6px_rgba(0,0,0,0.5),0_0_40px_hsl(var(--gold)/0.55)] hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="absolute inset-0 rounded-full ring-2 ring-[hsl(var(--gold-hi))]/60 animate-ping opacity-40" aria-hidden />
            {playing ? <Pause className="w-7 h-7 md:w-8 md:h-8" /> : <Play className="w-7 h-7 md:w-8 md:h-8 translate-x-0.5" />}
          </button>
        </div>

        {/* Active scene caption */}
        <div className="container mx-auto px-4 mt-8 md:mt-10 text-center max-w-2xl">
          <div className="text-[11px] tracking-[0.4em] text-[hsl(var(--gold-hi))] mb-2 font-mono">
            SCENE · {String(active + 1).padStart(2, '0')}
          </div>
          <h3 className={`text-2xl md:text-3xl mb-3 ${isAr ? 'font-arabic font-bold' : 'font-display'}`} style={{ color: 'hsl(var(--primary))' }}>
            {isAr ? current.titleAr : current.titleEn}
          </h3>
          <p className={`text-base md:text-lg leading-loose text-foreground/75 ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? current.bodyAr : current.bodyEn}
          </p>
          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setPlaying(false); }}
                aria-label={`Scene ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${active === i ? 'w-8 bg-[hsl(var(--gold))]' : 'w-2 bg-foreground/25 hover:bg-foreground/50'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .animate-ping { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
