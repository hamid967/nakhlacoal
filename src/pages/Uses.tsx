import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import productHookah from '@/assets/product-hookah.jpg';
import productBbq from '@/assets/product-bbq.jpg';
import productLump from '@/assets/product-lump.jpg';
import productCoconut from '@/assets/product-coconut.jpg';
import productBox from '@/assets/product-box.jpg';

const uses = [
  { titleAr: 'معسل وشيشة', titleEn: 'Hookah & Shisha', img: productHookah, descAr: 'احتراق ثابت ودخان نظيف لتجربة معسل راقية.' },
  { titleAr: 'بخور وعود', titleEn: 'Incense & Oud', img: productCoconut, descAr: 'توقد هادئ يحافظ على رائحة العود طوال الجلسة.' },
  { titleAr: 'شواء ومشاوي', titleEn: 'BBQ & Grilling', img: productBbq, descAr: 'حرارة عالية وثبات للحصول على نكهة شواء استثنائية.' },
  { titleAr: 'القهوة السعودية', titleEn: 'Saudi Coffee', img: productLump, descAr: 'مثالي لتحميص القهوة العربية على نار هادئة.' },
  { titleAr: 'الضيافة والمطاعم', titleEn: 'Hospitality & Restaurants', img: productBox, descAr: 'إمدادات بالجملة تناسب وتيرة المطابخ التجارية.' },
];

export default function Uses() {
  return (
    <>
      <SEO title="الاستخدامات | فحم النخلة" description="استخدامات فحم النخلة: معسل، بخور، شواء، قهوة، ضيافة." path="/uses" />
      <PageHero eyebrow="تجارب موثوقة" title="استخدامات فحم النخلة" subtitle="من جلسات المعسل إلى مطابخ المطاعم الفاخرة — جودة واحدة لكل احتراق." />
      <section className="container mx-auto px-6 section-tight">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uses.map((u, i) => (
            <motion.article
              key={u.titleEn}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-gold/20 bg-cream"
            >
              <img decoding="async" src={u.img} alt={u.titleAr} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-cream">
                <h3 className="font-serif text-2xl text-[hsl(var(--gold-ink))]">{u.titleAr}</h3>
                <p className="text-xs uppercase tracking-[0.25em] opacity-70 mt-0.5">{u.titleEn}</p>
                <p className="mt-2 text-sm opacity-90">{u.descAr}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
