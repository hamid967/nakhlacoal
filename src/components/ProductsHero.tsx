import { useDir, LuxButton } from '@/components/ui-lux';
import { ScrollReveal } from '@/components/ScrollReveal';
import productBbq from '@/assets/product-bbq.jpg';
import productHookah from '@/assets/product-hookah.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productLump from '@/assets/product-lump.jpg';
import palmBg from '@/assets/intro-palm-bg.jpg';

/**
 * Editorial product hero — 4 charcoal boxes on a podium (left),
 * stacked vertical headline "نقاء. استدامة. تميز." (right).
 * Mirrors the reference mockup.
 */
export function ProductsHero() {
  const { isAr } = useDir();

  const words = isAr
    ? ['نقاء.', 'استدامة.', 'تميز.']
    : ['Purity.', 'Sustainability.', 'Excellence.'];

  const boxes = [
    { img: productLump, h: 'h-44 md:h-56', delay: 80 },
    { img: productHookah, h: 'h-56 md:h-72', delay: 160 },
    { img: productBbq, h: 'h-64 md:h-80', delay: 0 }, // tallest center-left
    { img: productCoconut, h: 'h-48 md:h-60', delay: 240 },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Soft palm backdrop */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.06] bg-cover bg-center"
        style={{ backgroundImage: `url(${palmBg})` }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/80 to-background" aria-hidden />

      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center py-10 md:py-16">
        {/* Products (left in LTR, right in RTL via flow) */}
        <ScrollReveal className="lg:col-span-7 order-2 lg:order-1">
          <div className="relative">
            {/* Podium */}
            <div className="absolute bottom-0 inset-x-4 h-6 md:h-8 rounded-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent blur-sm" aria-hidden />
            <div className="relative grid grid-cols-4 gap-3 md:gap-4 items-end">
              {boxes.map((b, i) => (
                <div
                  key={i}
                  className={`group relative ${b.h} rounded-xl overflow-hidden ring-1 ring-gold/20 shadow-[0_20px_50px_-20px_hsl(var(--foreground)/0.45)] hover:-translate-y-1 transition-transform duration-500`}
                  style={{ animation: `floatY 6s ease-in-out ${b.delay}ms infinite alternate` }}
                >
                  <img
                    src={b.img}
                    alt=""
                    loading={i === 2 ? 'eager' : 'lazy'}
                    fetchPriority={i === 2 ? 'high' : 'auto'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>
              ))}
            </div>
            {/* Floor */}
            <div className="mt-3 h-3 md:h-4 rounded-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" aria-hidden />
          </div>
        </ScrollReveal>

        {/* Headline */}
        <div className="lg:col-span-5 order-1 lg:order-2 text-center lg:text-start">
          <ScrollReveal>
            <h1
              className={`${
                isAr ? 'font-arabic' : 'font-display'
              } font-bold leading-[1.05] text-5xl md:text-7xl lg:text-8xl tracking-tight`}
            >
              {words.map((w, i) => (
                <span
                  key={i}
                  className="block opacity-0 animate-[fadeUp_0.8s_ease-out_forwards]"
                  style={{ animationDelay: `${150 + i * 180}ms` }}
                >
                  {w}
                </span>
              ))}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={650}>
            <p className="mt-6 md:mt-8 text-base md:text-lg text-foreground/70 font-arabic max-w-md mx-auto lg:mx-0 leading-relaxed">
              {isAr
                ? 'فحم طبيعي ١٠٠٪ من أفضل أنواع قشور النخيل السعودي.'
                : '100% natural charcoal from the finest Saudi palm husks.'}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={800}>
            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <LuxButton to="/products" variant="gold" withArrow>
                {isAr ? 'استكشف المنتجات' : 'Explore products'}
              </LuxButton>
              <LuxButton to="/contact" variant="ghost">
                {isAr ? 'تواصل معنا' : 'Contact us'}
              </LuxButton>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          from { transform: translateY(0); }
          to   { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="floatY"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

export default ProductsHero;
