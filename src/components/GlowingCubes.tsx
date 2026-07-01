import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Leaf, ShieldCheck, Award } from 'lucide-react';

/**
 * Glowing Charcoal Cubes — Noir + Gold cinematic grid.
 * Four faceted "charcoal blocks" that softly breathe with a warm gold
 * inner rim + floor shadow. GPU-only transforms → smooth on all devices.
 */
export function GlowingCubes() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const cubes = isAr
    ? [
        { i: Flame, t: 'حرارة 750°C', s: 'اشتعال سريع، ثبات طويل' },
        { i: Leaf, t: '١٠٠٪ طبيعي', s: 'خشب مختار بلا إضافات' },
        { i: ShieldCheck, t: 'رماد 3%', s: 'احتراق نظيف وأنيق' },
        { i: Award, t: 'جودة موثّقة', s: 'اختبارات مختبرية' },
      ]
    : [
        { i: Flame, t: '750°C Heat', s: 'Instant light · long hold' },
        { i: Leaf, t: '100% Natural', s: 'Hand-picked hardwood' },
        { i: ShieldCheck, t: 'Only 3% Ash', s: 'Clean, elegant burn' },
        { i: Award, t: 'Lab Certified', s: 'Independently tested' },
      ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[hsl(var(--dark))]">
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(700px 380px at 50% 40%, hsl(46 72% 62% / 0.10), transparent 70%)',
        }}
      />

      <div className="container relative">
        <div className="text-center mb-14 md:mb-20">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi))] font-arabic">
            {isAr ? '— جوهر الفحم —' : '— The Essence —'}
          </span>
          <h2
            className={`mt-4 text-3xl md:text-5xl text-[hsl(var(--foreground))] ${
              isAr ? 'font-arabic font-bold' : 'font-display font-bold'
            }`}
          >
            {isAr ? 'كتلٌ من الفخامة الخالصة' : 'Blocks of pure luxury'}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {cubes.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Floor shadow */}
              <div
                aria-hidden
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-[50%] blur-md opacity-70"
                style={{ background: 'radial-gradient(ellipse, hsl(46 72% 62% / 0.35), transparent 70%)' }}
              />

              {/* The cube */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-square rounded-2xl border border-[hsl(var(--gold))]/25 overflow-hidden"
                style={{
                  background:
                    'linear-gradient(145deg, hsl(0 0% 11%) 0%, hsl(0 0% 6%) 55%, hsl(0 0% 4%) 100%)',
                  boxShadow:
                    'inset 0 1px 0 hsl(46 72% 62% / 0.18), 0 30px 60px -20px hsl(0 0% 0% / 0.8), 0 0 0 1px hsl(0 0% 0% / 0.4)',
                }}
              >
                {/* Top gold rim highlight */}
                <div
                  aria-hidden
                  className="absolute inset-x-6 top-0 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, hsl(46 72% 62% / 0.7), transparent)',
                  }}
                />
                {/* Breathing gold glow */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0"
                  animate={{ opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background:
                      'radial-gradient(circle at 50% 65%, hsl(46 72% 62% / 0.28), transparent 60%)',
                  }}
                />
                {/* Facet lines */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 48%, hsl(0 0% 100% / 0.05) 50%, transparent 52%)',
                  }}
                />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-center p-5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-[hsl(var(--gold))]/40 bg-black/50 shadow-[0_0_20px_hsl(46_72%_62%/0.35)]">
                    <c.i className="w-6 h-6 text-[hsl(var(--gold-hi))]" />
                  </div>
                  <div
                    className={`text-lg md:text-xl text-[hsl(var(--foreground))] ${
                      isAr ? 'font-arabic font-bold' : 'font-display font-semibold'
                    }`}
                  >
                    {c.t}
                  </div>
                  <div className={`mt-2 text-xs md:text-sm text-[hsl(var(--foreground))]/60 ${isAr ? 'font-arabic' : ''}`}>
                    {c.s}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
