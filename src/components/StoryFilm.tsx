import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import factory from '@/assets/palm-charcoal-factory.jpg';

export function StoryFilm() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="relative z-0 isolate py-24 md:py-32 bg-[#0B0B0B] overflow-hidden">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/80 mb-4 font-arabic">
            {isAr ? 'قصّتنا' : 'Our Story'}
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-white leading-tight">
            {isAr ? 'من نخيل المدينة إلى موائد العالم' : 'From Madinah palms to the world’s tables'}
          </h2>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-[hsl(var(--gold))]/20 shadow-[0_20px_80px_-40px_hsl(46_90%_50%/0.4)]">
          {/* Ken Burns still image */}
          <motion.img
            src={factory}
            alt={isAr ? 'مصنع فحم النخلة' : 'Palm Charcoal facility'}
            className="w-full h-[420px] md:h-[600px] object-cover"
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 12, ease: 'easeOut' }}
            loading="lazy"
            decoding="async"
          />

          {/* Cinematic vignettes */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.85))] pointer-events-none" />

          {/* Play badge (decorative) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-[hsl(var(--gold))]/50 backdrop-blur-sm bg-black/30 flex items-center justify-center"
              animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            >
              <Play className="w-8 h-8 text-[hsl(var(--gold-hi,46_95%_78%))] ms-1" fill="currentColor" />
            </motion.div>
          </div>

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p
              className={`max-w-2xl text-white/85 text-sm md:text-base leading-relaxed ${
                isAr ? 'font-arabic' : ''
              }`}
            >
              {isAr
                ? '«نصنع الفحم بصبر النخيل — بلا استعجال، بلا مساومة. كل حبّة تحمل حرارة الأرض التي رعتها.»'
                : '"We craft charcoal with the patience of palms — no rush, no compromise. Every ember carries the heat of the land that raised it."'}
            </p>
            <div className="mt-3 text-[10px] tracking-[0.35em] uppercase text-[hsl(var(--gold-hi,46_95%_78%))]">
              {isAr ? 'المؤسّس · فحم النخلة' : 'Founder · Palm Charcoal'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
