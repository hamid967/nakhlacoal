import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import storyImg from '@/assets/product-lump.jpg';

/**
 * EditorialStory
 * Asymmetric cinematic storytelling section with scroll-triggered messages.
 * Locked palette: Emerald Prestige (#050b09 / #0d7a5f / #c9a84c / #f5f0e0).
 */
export function EditorialStory() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const rootRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 within section
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height + vh;
        const passed = vh - rect.top;
        const p = Math.max(0, Math.min(1, passed / total));
        setProgress(p);
        setActive(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const chapters = [
    {
      n: '01',
      k: isAr ? 'الجذر' : 'The Root',
      t: isAr ? 'من قلب النخيل السعودي' : 'From the heart of Saudi palms',
      b: isAr
        ? 'كل قطعة تبدأ من نخلةٍ عاشت تحت شمس الجزيرة، تحمل ذاكرة الأرض ورائحة التمر والرمل.'
        : 'Every ember begins with a palm that lived under Arabian sun — carrying the memory of land, dates, and desert wind.',
    },
    {
      n: '02',
      k: isAr ? 'النار' : 'The Fire',
      t: isAr ? 'كربنة على درجة الإتقان' : 'Carbonized to perfection',
      b: isAr
        ? 'أفران محكمة الحرارة تحوّل الليف إلى كربونٍ صافٍ، بلا دخانٍ ولا شوائب — فقط جوهر الحرارة.'
        : 'Sealed kilns transform fibre into pure carbon — no smoke, no residue, only the essence of heat.',
    },
    {
      n: '03',
      k: isAr ? 'الطقس' : 'The Ritual',
      t: isAr ? 'جمرةٌ تليق بالمائدة' : 'An ember worthy of the table',
      b: isAr
        ? 'من الفنادق العالمية إلى مجالس العائلة، فحم النخلة يُقدَّم كتجربة — لا كسلعة.'
        : 'From global hotels to family majlis, Palm Charcoal is served as an experience — never a commodity.',
    },
  ];

  // Parallax translate for the image column
  const py = -40 + progress * 80; // -40 → +40 px

  return (
    <section
      ref={rootRef}
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 80% at 80% 10%, rgba(13,122,95,0.10), transparent 60%), linear-gradient(180deg, #050b09 0%, #071310 100%)',
        color: '#f5f0e0',
      }}
      aria-label={isAr ? 'قصة فحم النخلة' : 'Palm Charcoal Story'}
    >
      {/* Oversized decorative wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 md:-top-10 inset-x-0 text-center select-none"
        style={{
          fontFamily: 'Syne, serif',
          fontSize: 'clamp(90px, 18vw, 260px)',
          lineHeight: 0.9,
          color: 'rgba(201,168,76,0.06)',
          letterSpacing: '-0.04em',
        }}
      >
        {isAr ? 'حكاية' : 'Story'}
      </div>

      <div className="container relative py-24 md:py-36 lg:py-44">
        {/* Asymmetric 12-col grid */}
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Left / image column — offset down, spans 5 */}
          <div className="col-span-12 md:col-span-5 md:mt-24">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 40px 120px -30px rgba(0,0,0,0.7)',
                transform: `translateY(${py.toFixed(1)}px)`,
                transition: 'transform 120ms linear',
              }}
            >
              <img
                src={storyImg}
                alt=""
                loading="lazy"
                className="w-full h-[420px] md:h-[560px] object-cover"
                style={{
                  filter: `grayscale(${(1 - progress).toFixed(2)}) contrast(1.05)`,
                  transition: 'filter 300ms ease',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(5,11,9,0.15) 0%, rgba(5,11,9,0.75) 100%)',
                }}
              />
              {/* Gold frame accent */}
              <div
                aria-hidden
                className="absolute -inset-px rounded-2xl pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.35)' }}
              />
              {/* Floating gold coin */}
              <div
                aria-hidden
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, #e8cf7e 0%, #c9a84c 40%, #7a6428 100%)',
                  boxShadow: '0 20px 60px -10px rgba(201,168,76,0.5)',
                }}
              />
            </div>

            {/* Caption strip */}
            <div className="mt-6 flex items-center gap-4">
              <span className="h-px flex-1" style={{ background: 'rgba(201,168,76,0.35)' }} />
              <span
                className="text-[10px] uppercase tracking-[0.35em]"
                style={{ color: '#c9a84c', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {isAr ? 'صنع في المملكة' : 'Made in KSA'}
              </span>
            </div>
          </div>

          {/* Right / text column — spans 7, higher */}
          <div className="col-span-12 md:col-span-7 md:pl-6 lg:pl-12">
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-[10px] uppercase tracking-[0.4em]"
                style={{ color: '#c9a84c', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {isAr ? 'فصولٌ من الجمر' : 'Chapters of Ember'}
              </span>
              <span className="h-px w-16" style={{ background: 'rgba(245,240,224,0.25)' }} />
            </div>

            <h2
              className="mb-10 md:mb-14"
              style={{
                fontFamily: isAr ? 'Amiri, serif' : 'Syne, serif',
                fontSize: 'clamp(36px, 5vw, 68px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {isAr ? (
                <>
                  ثلاثة فصول
                  <br />
                  <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>تُروى بالنار.</em>
                </>
              ) : (
                <>
                  Three chapters,
                  <br />
                  <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>told by fire.</em>
                </>
              )}
            </h2>

            {/* Scroll-triggered chapters */}
            <ol className="relative space-y-8 md:space-y-12">
              {/* Vertical rail */}
              <span
                aria-hidden
                className={`absolute top-0 bottom-0 ${isAr ? 'right-4' : 'left-4'} w-px`}
                style={{ background: 'rgba(245,240,224,0.12)' }}
              />
              <span
                aria-hidden
                className={`absolute top-0 ${isAr ? 'right-4' : 'left-4'} w-px`}
                style={{
                  height: `${(progress * 100).toFixed(1)}%`,
                  background: 'linear-gradient(180deg, #c9a84c, transparent)',
                  transition: 'height 120ms linear',
                }}
              />

              {chapters.map((c, i) => {
                const isActive = active === i;
                return (
                  <li
                    key={c.n}
                    className={`relative ${isAr ? 'pr-14' : 'pl-14'}`}
                    style={{
                      opacity: isActive ? 1 : 0.35,
                      transform: `translateY(${isActive ? 0 : 12}px)`,
                      transition: 'opacity 500ms ease, transform 500ms ease',
                    }}
                  >
                    <span
                      aria-hidden
                      className={`absolute top-2 ${isAr ? 'right-2' : 'left-2'} w-5 h-5 rounded-full`}
                      style={{
                        background: isActive
                          ? 'radial-gradient(circle, #e8cf7e 0%, #c9a84c 60%, transparent 70%)'
                          : 'rgba(245,240,224,0.15)',
                        boxShadow: isActive ? '0 0 24px rgba(201,168,76,0.7)' : 'none',
                        transition: 'all 400ms ease',
                      }}
                    />
                    <div className="flex items-baseline gap-4 mb-2">
                      <span
                        style={{
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          fontVariantNumeric: 'tabular-nums',
                          color: '#c9a84c',
                          fontSize: '12px',
                          letterSpacing: '0.3em',
                        }}
                      >
                        {c.n}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-[0.35em]"
                        style={{ color: 'rgba(245,240,224,0.6)' }}
                      >
                        {c.k}
                      </span>
                    </div>
                    <h3
                      className="mb-2"
                      style={{
                        fontFamily: isAr ? 'Amiri, serif' : 'Syne, serif',
                        fontSize: 'clamp(22px, 2.4vw, 32px)',
                        lineHeight: 1.15,
                      }}
                    >
                      {c.t}
                    </h3>
                    <p
                      className="max-w-xl"
                      style={{
                        fontFamily: isAr ? 'IBM Plex Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif',
                        color: 'rgba(245,240,224,0.75)',
                        fontSize: '16px',
                        lineHeight: 1.7,
                      }}
                    >
                      {c.b}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditorialStory;
