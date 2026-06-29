import { motion } from 'framer-motion';
import { Picture } from '@/components/Picture';
import { SectionHeader } from '@/components/ui-lux';
import emberImg from '@/assets/quality/ember-closeup.jpg?picture';
import labImg from '@/assets/quality/lab-measurement.jpg?picture';
import burnImg from '@/assets/quality/burn-test.jpg?picture';

export default function CinematicGallery() {
  const shots = [
    { src: emberImg, title: 'الجمر الحي', sub: 'حرارة موحدة 950°C', tag: 'EMBER', pos: '50% 45%' },
    { src: labImg, title: 'القياس الدقيق', sub: 'تفاوت أقل من ±0.3mm', tag: 'LAB', pos: '50% 35%' },
    { src: burnImg, title: 'اختبار الاحتراق', sub: 'ثبات 180 دقيقة', tag: 'BURN', pos: '50% 50%' },
  ];
  return (
    <section className="py-28 bg-dark">
      <div className="container">
        <SectionHeader eyebrow="معرض المختبر" title="لقطات حية من خط الجودة" />
        <div className="grid md:grid-cols-3 gap-6">
          {shots.map((s, i) => (
            <motion.figure
              key={s.tag}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              className="glass-card glass-dark group relative overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Picture
                  source={s.src as any}
                  alt={s.title}
                  sizes="(min-width: 1280px) 420px, (min-width: 768px) 33vw, 100vw"
                  imgClassName="absolute inset-0 w-full h-full object-cover transition-transform [transition-duration:1400ms] ease-out group-hover:scale-[1.06]"
                  imgStyle={{
                    objectFit: 'cover',
                    objectPosition: s.pos,
                    filter: 'contrast(1.08) saturate(1.05)',
                    transformOrigin: 'center center',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_45%,hsl(var(--gold-hi)/0.35)_50%,transparent_55%,transparent_100%)] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2.4s_linear_infinite] mix-blend-overlay" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")" }}
                />
                <span className="glass-strip glass-dark absolute top-4 left-4 text-[10px] tracking-[0.3em] px-2.5 py-1 rounded-full text-gold-hi">
                  {s.tag} · 0{i + 1}
                </span>
              </div>
              <figcaption className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/70 to-transparent">
                <div className="font-arabic text-xl text-background font-bold">{s.title}</div>
                <div className="font-arabic text-sm text-gold-hi/90 mt-1">{s.sub}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
