import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import bbq from '@/assets/product-bbq.jpg';
import hookah from '@/assets/product-hookah.jpg';
import coconut from '@/assets/product-coconut.jpg';
import lump from '@/assets/product-lump.jpg';

type Case = {
  id: string;
  client: string;
  sector: string;
  year: string;
  title: { ar: string; en: string };
  metric: string;
  metricLabel: { ar: string; en: string };
  img: string;
  body: { ar: string; en: string };
};

const CASES: Case[] = [
  {
    id: 'ritz',
    client: 'The Grand Continental',
    sector: 'Hospitality · Dubai',
    year: '2024',
    title: { ar: 'حرارةٌ ثابتة لمطبخ عالميّ', en: 'Constant heat for a world kitchen' },
    metric: '−38%',
    metricLabel: { ar: 'زمن التحضير' , en: 'prep time' },
    img: bbq,
    body: {
      ar: 'زوّدنا مطاعم فندق قاري بفحم النخلة الفاخر — احتراقٌ نظيف بلا شرارٍ ولا رائحة، مع ثباتٍ حراريٍّ يمتد لأربع ساعات دون تدخّل الطاهي.',
      en: 'We supplied the hotel’s signature grills with palm charcoal — clean burn, no odor, four-hour stable heat with zero chef intervention.',
    },
  },
  {
    id: 'majlis',
    client: 'Majlis Al Layl',
    sector: 'Hookah Lounge · Riyadh',
    year: '2024',
    title: { ar: 'جلسةٌ بلا دخان', en: 'A session without smoke' },
    metric: '×2.4',
    metricLabel: { ar: 'مدة الجلسة', en: 'session duration' },
    img: hookah,
    body: {
      ar: 'استبدلنا الفحم التقليدي بفحم نخيل مضغوط — جمرةٌ حمراءُ ثابتة، بلا رمادٍ متطاير، ورائحةٌ خشبيةٌ ناعمة تليق بأمسيات الرياض.',
      en: 'We replaced traditional charcoal with pressed palm briquettes — steady red ember, no flying ash, and a soft woody scent worthy of Riyadh nights.',
    },
  },
  {
    id: 'export',
    client: 'Nordic Grill Co.',
    sector: 'Retail Export · Oslo',
    year: '2023',
    title: { ar: 'تصديرٌ يحمل هويّة', en: 'Export with a signature' },
    metric: '12',
    metricLabel: { ar: 'دولة تصدير', en: 'export countries' },
    img: coconut,
    body: {
      ar: 'صمّمنا سلسلة تعبئةٍ فاخرة موجّهة للسوق الاسكندنافي، مع شهاداتٍ أوروبية للجودة والانبعاثات — لتصل الجمرة بذات النقاء الذي غادرت به الميناء.',
      en: 'We built a premium packaging line for the Scandinavian market with EU quality & emission certificates — the ember arrives with the same purity it left port.',
    },
  },
  {
    id: 'chef',
    client: 'Chef Table Series',
    sector: 'Fine Dining · Jeddah',
    year: '2025',
    title: { ar: 'مائدةٌ يشعلها الطاهي', en: 'A table lit by the chef' },
    metric: '9/10',
    metricLabel: { ar: 'تقييم النقّاد', en: 'critic rating' },
    img: lump,
    body: {
      ar: 'دخل فحم النخلة في تجربة «طاولة الطاهي» كعنصرٍ مقدَّمٍ للضيف — قطعٌ كبيرة يدوية، وحرارةٌ عاليةٌ تُبرز نكهة اللحوم المعتّقة.',
      en: 'Palm charcoal entered the Chef’s Table experience as a hero ingredient — large hand-cut pieces and searing heat that unlocks aged-meat flavor.',
    },
  },
];

export function CasesShowcase() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [active, setActive] = useState<Case | null>(null);

  return (
    <section
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative py-24 md:py-36 overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 60% at 20% 0%, rgba(13,122,95,0.12), transparent 60%), linear-gradient(180deg, #071310 0%, #050b09 100%)',
        color: '#f5f0e0',
      }}
      aria-label={isAr ? 'الأعمال المختارة' : 'Selected Cases'}
    >
      {/* Oversized wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-4 md:-top-8 inset-x-0 text-center select-none"
        style={{
          fontFamily: 'Syne, serif',
          fontSize: 'clamp(80px, 16vw, 220px)',
          lineHeight: 0.9,
          color: 'rgba(201,168,76,0.05)',
          letterSpacing: '-0.04em',
        }}
      >
        {isAr ? 'أعمال' : 'Cases'}
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: 'rgba(201,168,76,0.5)' }} />
              <span
                className="text-[10px] uppercase tracking-[0.4em]"
                style={{ color: '#c9a84c', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {isAr ? 'الأعمال المختارة · ٢٠٢٣–٢٠٢٥' : 'Selected work · 2023–2025'}
              </span>
            </div>
            <h2
              style={{
                fontFamily: isAr ? 'Amiri, serif' : 'Syne, serif',
                fontSize: 'clamp(36px, 5vw, 68px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                maxWidth: 720,
              }}
            >
              {isAr ? (
                <>
                  حالاتٌ يشعلها <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>الجمر.</em>
                </>
              ) : (
                <>
                  Cases lit by <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>the ember.</em>
                </>
              )}
            </h2>
          </div>
          <p
            className="max-w-sm text-sm md:text-base"
            style={{
              color: 'rgba(245,240,224,0.7)',
              fontFamily: isAr ? 'IBM Plex Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif',
              lineHeight: 1.7,
            }}
          >
            {isAr
              ? 'أربع تجاربٍ حقيقية — من الفنادق الفاخرة إلى مطاعم الطاهي وأسواق التصدير — وثّقناها لتقرأ الأثر بالأرقام.'
              : 'Four real experiences — from luxury hotels to chef tables and export markets — documented so the impact reads in numbers.'}
          </p>
        </div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-12 gap-5 md:gap-7">
          {CASES.map((c, i) => {
            // Alternating spans: 7/5, 5/7, ...
            const span = i % 2 === 0 ? 'md:col-span-7' : 'md:col-span-5';
            const height = i % 2 === 0 ? 'h-[420px] md:h-[520px]' : 'h-[420px] md:h-[440px]';
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => setActive(c)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className={`group relative col-span-12 ${span} ${height} text-start rounded-3xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]`}
                style={{
                  background: 'rgba(245,240,224,0.04)',
                  boxShadow: '0 40px 100px -40px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(245,240,224,0.08)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
                aria-label={isAr ? `افتح ${c.client}` : `Open ${c.client}`}
              >
                {/* Framed image */}
                <div className="absolute inset-4 md:inset-6 rounded-2xl overflow-hidden">
                  <img
                    src={c.img}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform [transition-duration:1200ms] ease-out group-hover:scale-105"
                    style={{ filter: 'grayscale(0.35) contrast(1.05)' }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(5,11,9,0.15) 0%, rgba(5,11,9,0.85) 100%)',
                    }}
                  />
                  {/* Gold inner frame */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.3)' }}
                  />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className="text-[10px] uppercase tracking-[0.35em] mb-2"
                        style={{ color: 'rgba(245,240,224,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      >
                        {c.sector} · {c.year}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          fontVariantNumeric: 'tabular-nums',
                          color: '#f5f0e0',
                          fontSize: '14px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {c.client}
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-full transition-transform duration-500 group-hover:rotate-45"
                      style={{
                        background: 'rgba(201,168,76,0.15)',
                        boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.5)',
                        color: '#c9a84c',
                      }}
                      aria-hidden
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between gap-6">
                    <h3
                      className="max-w-md"
                      style={{
                        fontFamily: isAr ? 'Amiri, serif' : 'Syne, serif',
                        fontSize: 'clamp(22px, 2.4vw, 34px)',
                        lineHeight: 1.15,
                        color: '#f5f0e0',
                      }}
                    >
                      {isAr ? c.title.ar : c.title.en}
                    </h3>
                    <div className="text-end shrink-0">
                      <div
                        style={{
                          fontFamily: 'Syne, serif',
                          fontSize: 'clamp(28px, 3vw, 44px)',
                          lineHeight: 1,
                          color: '#c9a84c',
                        }}
                      >
                        {c.metric}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-[0.3em] mt-1"
                        style={{ color: 'rgba(245,240,224,0.6)' }}
                      >
                        {isAr ? c.metricLabel.ar : c.metricLabel.en}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Interactive viewer */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-10"
            style={{ background: 'rgba(5,11,9,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.client}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
              style={{
                background: 'rgba(245,240,224,0.05)',
                boxShadow: '0 60px 140px -30px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(201,168,76,0.25)',
                backdropFilter: 'blur(24px)',
              }}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                className="absolute top-4 end-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(5,11,9,0.6)',
                  color: '#f5f0e0',
                  boxShadow: 'inset 0 0 0 1px rgba(245,240,224,0.2)',
                }}
              >
                <X size={18} />
              </button>

              {/* Framed image */}
              <div className="relative h-[280px] md:h-auto md:min-h-[520px] p-4 md:p-6">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <img src={active.img} alt="" className="w-full h-full object-cover" />
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.4)' }}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div
                  className="text-[10px] uppercase tracking-[0.4em] mb-4"
                  style={{ color: '#c9a84c', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {active.sector} · {active.year}
                </div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: '#f5f0e0',
                    fontSize: '14px',
                    letterSpacing: '0.06em',
                  }}
                >
                  {active.client}
                </h3>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: isAr ? 'Amiri, serif' : 'Syne, serif',
                    fontSize: 'clamp(28px, 3.4vw, 44px)',
                    lineHeight: 1.1,
                    color: '#f5f0e0',
                  }}
                >
                  {isAr ? active.title.ar : active.title.en}
                </h2>
                <p
                  className="mb-8"
                  style={{
                    fontFamily: isAr ? 'IBM Plex Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif',
                    color: 'rgba(245,240,224,0.8)',
                    fontSize: '16px',
                    lineHeight: 1.8,
                  }}
                >
                  {isAr ? active.body.ar : active.body.en}
                </p>

                <div className="flex items-center gap-6 pt-6" style={{ borderTop: '1px solid rgba(245,240,224,0.12)' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Syne, serif',
                        fontSize: '40px',
                        lineHeight: 1,
                        color: '#c9a84c',
                      }}
                    >
                      {active.metric}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.3em] mt-1"
                      style={{ color: 'rgba(245,240,224,0.6)' }}
                    >
                      {isAr ? active.metricLabel.ar : active.metricLabel.en}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default CasesShowcase;
