import { useTranslation } from 'react-i18next';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS_AR = [
  { name: 'محمد الغامدي', role: 'مالك مطعم — الرياض', body: 'أفضل فحم جربته لشوي اللحوم. حرارة ثابتة وبدون دخان يذكر.' },
  { name: 'سارة القحطاني', role: 'مقهى شيشة — جدة', body: 'زبائني لاحظوا الفرق من أول جلسة. الجمر ثابت وطعم نظيف.' },
  { name: 'Ahmad Yousef', role: 'Hotel F&B — Dubai', body: 'Consistent burn, clean ash, premium presentation. Our chefs love it.' },
  { name: 'خالد العتيبي', role: 'شركة تموين — الدمام', body: 'نطلب منتظم كل أسبوع. الجودة ثابتة والتسليم دقيق.' },
  { name: 'Fatima R.', role: 'Restaurant Group — Doha', body: 'The gold standard of natural charcoal. Zero compromises.' },
  { name: 'يوسف الحربي', role: 'محل شواء — مكة', body: 'الفحم مضبوط، الرماد قليل جدًا، والزبون راجع لي فقط بسببه.' },
];

const TESTIMONIALS_EN = [
  { name: 'Mohammed Al-Ghamdi', role: 'Restaurant Owner — Riyadh', body: 'The best charcoal I have used for grilling meat. Steady heat, minimal smoke.' },
  { name: 'Sarah Al-Qahtani', role: 'Shisha Café — Jeddah', body: 'My clients noticed the difference from the first session. Stable ember, clean taste.' },
  { name: 'Ahmad Yousef', role: 'Hotel F&B — Dubai', body: 'Consistent burn, clean ash, premium presentation. Our chefs love it.' },
  { name: 'Khaled Al-Otaibi', role: 'Catering — Dammam', body: 'We order weekly. Quality is consistent and delivery is on time.' },
  { name: 'Fatima R.', role: 'Restaurant Group — Doha', body: 'The gold standard of natural charcoal. Zero compromises.' },
  { name: 'Youssef Al-Harbi', role: 'BBQ Shop — Makkah', body: 'Perfectly tuned charcoal, low ash, and my customers keep returning.' },
];

export function TestimonialsMarquee() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const data = isAr ? TESTIMONIALS_AR : TESTIMONIALS_EN;
  const rowA = [...data, ...data];
  const rowB = [...data.slice().reverse(), ...data.slice().reverse()];

  return (
    <section className="relative py-24 md:py-32 bg-[#0B0B0B] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(46_72%_62%/0.08),transparent_60%)] pointer-events-none" />

      <div className="container relative mb-14 md:mb-20">
        <div className="text-center">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4">
            {isAr ? 'أصوات عملائنا' : 'Voices of trust'}
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
            {isAr ? 'ثقة من كل قارّة' : 'Trusted across continents'}
          </h2>
        </div>
      </div>

      {/* Edge fade masks */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 start-0 w-24 md:w-40 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-24 md:w-40 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10" />

        <MarqueeRow items={rowA} direction="left" duration={60} />
        <div className="h-6" />
        <MarqueeRow items={rowB} direction="right" duration={75} />
      </div>

      <style>{`
        @keyframes tm-scroll-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tm-scroll-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .tm-track { display: flex; gap: 1.25rem; width: max-content; will-change: transform; }
        .tm-track.left { animation: tm-scroll-left linear infinite; }
        .tm-track.right { animation: tm-scroll-right linear infinite; }
        .tm-wrap:hover .tm-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .tm-track { animation: none !important; } }
      `}</style>
    </section>
  );
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: Array<{ name: string; role: string; body: string }>;
  direction: 'left' | 'right';
  duration: number;
}) {
  return (
    <div className="tm-wrap overflow-hidden">
      <div className={`tm-track ${direction}`} style={{ animationDuration: `${duration}s` }}>
        {items.map((t, i) => (
          <article
            key={i}
            className="w-[320px] md:w-[380px] shrink-0 rounded-2xl border border-[hsl(var(--gold))]/20 bg-[#141414] p-6 hover:border-[hsl(var(--gold))]/50 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <Quote className="w-6 h-6 text-[hsl(var(--gold))]/70" aria-hidden />
              <div className="flex gap-0.5" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                ))}
              </div>
            </div>
            <p className="text-white/85 text-sm leading-relaxed font-arabic min-h-[5.5rem]">"{t.body}"</p>
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="text-white text-sm font-semibold">{t.name}</div>
              <div className="text-white/50 text-xs mt-0.5">{t.role}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
