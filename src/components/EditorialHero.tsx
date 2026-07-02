import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import heroCharcoal from '@/assets/hero-charcoal.jpg';

/**
 * EditorialHero — "Broken-Grid Fragment" direction.
 * Locked palette: Emerald Prestige (#064e3b / #0d7a5f / #c9a84c / #f5f0e0).
 * Locked typography: Syne × Plus Jakarta Sans (+ Amiri italic for Arabic display).
 * Structure mirrors the selected prototype: oversized decorative word, asymmetric
 * 7/5 grid, floating gold coin, framed image with hover reveal, numbered footer.
 */
export function EditorialHero() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const dir = isAr ? 'rtl' : 'ltr';

  return (
    <section
      dir={dir}
      className="relative w-full overflow-hidden bg-[#050b09] text-[#f5f0e0] font-sans selection:bg-[#c9a84c]/30"
      aria-label={isAr ? 'المقدمة التحريرية' : 'Editorial hero'}
    >
      {/* Ambient gold + emerald glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 end-0 h-[28rem] w-[28rem] rounded-full bg-[#c9a84c]/[0.07] blur-[130px]" />
        <div className="absolute bottom-1/4 start-0 h-[28rem] w-[28rem] rounded-full bg-[#0d7a5f]/[0.14] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32">
        {/* Background decorative wordmark */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 select-none font-amiri text-[16rem] font-black leading-none text-[#f5f0e0]/[0.035] md:text-[22rem]"
          style={{ [isAr ? 'right' : 'left']: '-2rem' } as React.CSSProperties}
        >
          {isAr ? 'نخلة' : 'PALM'}
        </div>

        <div className="grid grid-cols-12 items-center gap-8 relative z-10">
          {/* ─── Narrative column (7) ─── */}
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12 bg-[#c9a84c]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#c9a84c]">
                {isAr ? 'الإصدار المتميّز' : 'The Premium Edition'}
              </span>
            </div>

            <h1 className="mb-8 font-editorial leading-[0.85] tracking-tight">
              <span className="block text-6xl md:text-8xl lg:text-[9rem] text-[#f5f0e0]">
                {isAr ? 'فحم' : 'Palm'}
              </span>
              <span className="-mt-2 block font-amiri text-6xl italic text-[#c9a84c] md:text-8xl lg:text-[9rem]">
                {isAr ? 'النخلة' : 'Charcoal'}
              </span>
            </h1>

            <div className="flex flex-col items-start gap-8 md:flex-row">
              <p
                className={`max-w-md text-lg leading-relaxed text-[#f5f0e0]/70 md:text-xl ${
                  isAr ? 'border-e-4 pe-6' : 'border-s-4 ps-6'
                } border-[#c9a84c]`}
              >
                {isAr
                  ? 'تجربة فريدة من قلب الطبيعة، فحم مستدام بخصائص استثنائية لشواء يدوم طويلاً ونكهة لا تُنسى.'
                  : 'A singular experience from the heart of nature — sustainable charcoal engineered for a longer burn and an unforgettable flavour.'}
              </p>

              <Link
                to="/products"
                className="group relative inline-flex overflow-hidden px-8 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b09]"
              >
                <span className="absolute inset-0 bg-[#c9a84c] transition-transform duration-500 group-hover:translate-y-full" />
                <span className="absolute inset-0 -translate-y-full bg-[#f5f0e0] transition-transform duration-500 group-hover:translate-y-0" />
                <span className="relative font-sans text-sm font-bold uppercase tracking-widest text-[#064e3b] transition-colors duration-500 group-hover:text-[#064e3b]">
                  {isAr ? 'اكتشف المجموعة' : 'Explore the Collection'}
                </span>
              </Link>
            </div>
          </div>

          {/* ─── Visual column (5) ─── */}
          <div className="col-span-12 relative mt-12 lg:col-span-5 lg:mt-0">
            {/* Floating gold coin */}
            <div
              className="absolute z-20 flex h-48 w-48 rotate-12 flex-col items-center justify-center rounded-full border border-[#c9a84c]/30 bg-[#f5f0e0]/[0.04] p-4 text-center backdrop-blur-3xl"
              style={{ top: '-3rem', [isAr ? 'right' : 'left']: '-3rem' } as React.CSSProperties}
            >
              <span className="font-editorial text-4xl text-[#c9a84c]">100%</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#f5f0e0]/80">
                {isAr ? 'طبيعي بالكامل' : 'Fully Natural'}
              </span>
            </div>

            {/* Framed image */}
            <div className="group relative">
              <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 border-2 border-[#c9a84c]/30 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6" />
              <img
                src={heroCharcoal}
                alt={isAr ? 'فحم النخلة الفاخر متوهج بجمر ذهبي' : 'Premium palm charcoal glowing with amber embers'}
                loading="eager"
                {...({ fetchpriority: 'high' } as any)}
                decoding="async"
                className="aspect-[4/5] w-full bg-[#0a1815] object-cover shadow-2xl grayscale transition-all duration-1000 group-hover:grayscale-0"
              />

              {/* Floating spec card */}
              <div
                className="absolute max-w-[240px] border border-[#0d7a5f]/40 bg-[#050b09]/85 p-6 backdrop-blur-md"
                style={{ bottom: '2rem', [isAr ? 'left' : 'right']: '2rem' } as React.CSSProperties}
              >
                <div className="mb-2 text-[11px] font-bold uppercase tracking-tight text-[#c9a84c]">
                  {isAr ? 'المواصفات' : 'Specifications'}
                </div>
                <p className="text-xs leading-relaxed text-[#f5f0e0]/80">
                  {isAr
                    ? 'نقاء فائق، خالٍ من الإضافات الكيميائية، ويمنحك حرارة متساوية لمدة تصل إلى ٥ ساعات متواصلة.'
                    : 'Ultra-pure, free of chemical additives — a steady, even heat that lasts up to five continuous hours.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Numbered footer strip ─── */}
        <div className="mt-24 grid grid-cols-1 gap-12 border-t border-[#f5f0e0]/[0.08] pt-12 md:grid-cols-3">
          {[
            {
              n: '01',
              t: isAr ? 'استدامة كاملة' : 'True Sustainability',
              b: isAr
                ? 'نستخدم مخلّفات النخيل البيئية لتقليل البصمة الكربونية.'
                : 'We upcycle date-palm byproducts to shrink our carbon footprint.',
            },
            {
              n: '02',
              t: isAr ? 'بلا أدخنة' : 'Smoke-Free',
              b: isAr
                ? 'تقنية تجفيف فريدة تضمن احتراقاً نظيفاً بدون روائح مزعجة.'
                : 'A proprietary drying process delivers a clean, odorless burn.',
            },
            {
              n: '03',
              t: isAr ? 'حرارة مركّزة' : 'Focused Heat',
              b: isAr
                ? 'كثافة عالية جداً تضمن طهي اللحوم بمثالية تامّة.'
                : 'Exceptional density guarantees perfect sear on every cut.',
            },
          ].map((s) => (
            <div key={s.n} className="flex flex-col gap-2">
              <span className="font-editorial text-4xl text-[#f5f0e0]/25">{s.n}</span>
              <h3 className="font-editorial text-xl text-[#f5f0e0]">{s.t}</h3>
              <p className="text-sm text-[#f5f0e0]/55">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EditorialHero;
