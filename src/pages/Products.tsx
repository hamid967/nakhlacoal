import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Download, FileText, ShoppingBag } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PageHero } from '@/components/PageHero';

const slugs = ['bbq', 'coconut', 'hookah', 'compressed', 'restaurant', 'hotel', 'wholesale'] as const;

const specs: Record<string, { burn: string; ash: string; carbon: string; moisture: string; packaging: string }> = {
  bbq: { burn: '3+ hrs', ash: '<3%', carbon: '85%', moisture: '<6%', packaging: '5 / 10 / 15 kg' },
  coconut: { burn: '2+ hrs', ash: '<2%', carbon: '88%', moisture: '<5%', packaging: '1 / 5 / 10 kg' },
  hookah: { burn: '90 min', ash: '<1.5%', carbon: '90%', moisture: '<4%', packaging: '1 kg cubes' },
  compressed: { burn: '4+ hrs', ash: '<3%', carbon: '86%', moisture: '<6%', packaging: '10 kg blocks' },
  restaurant: { burn: '3+ hrs', ash: '<3%', carbon: '85%', moisture: '<6%', packaging: 'Pallet 1000 kg' },
  hotel: { burn: '3+ hrs', ash: '<2.5%', carbon: '87%', moisture: '<5%', packaging: 'Private label box' },
  wholesale: { burn: 'Mixed', ash: 'Mixed', carbon: 'Mixed', moisture: 'Mixed', packaging: '20 / 40 ft container' },
};

export default function Products() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <>
      <SEO
        title={isAr ? 'المنتجات — فحم النخلة' : 'Products — Palm Charcoal'}
        description={isAr ? 'سبع عائلات من فحم النخيل السعودي الفاخر.' : 'Seven premium families of Saudi date-palm charcoal.'}
        path="/products"
      />
      <PageHero eyebrow={t('products.subtitle')} title={t('products.title')} />

      <section className="py-24">
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slugs.map((slug, i) => {
            const item: any = t(`products.items.${slug}`, { returnObjects: true });
            const s = specs[slug];
            return (
              <ScrollReveal key={slug} delay={i * 60}>
                <article className="shimmer-card relative h-full p-8 rounded-2xl bg-surface border-luxe hover:border-luxe-strong transition-all duration-700 flex flex-col">
                  <div className="aspect-[5/3] mb-6 -mx-2 rounded-xl bg-gradient-to-br from-surface-2 to-background border-luxe relative overflow-hidden">
                    <div className="absolute inset-0 ember-glow opacity-50" />
                    <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-gold">
                      0{i + 1} / 0{slugs.length}
                    </div>
                  </div>
                  <h3 className={`text-2xl mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{item.name}</h3>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">{item.desc}</p>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-6 mt-auto">
                    <Spec label={t('products.burn')} value={s.burn} />
                    <Spec label={t('products.ash')} value={s.ash} />
                    <Spec label={t('products.carbon')} value={s.carbon} />
                    <Spec label={t('products.moisture')} value={s.moisture} />
                    <div className="col-span-2">
                      <Spec label={t('products.packaging')} value={s.packaging} />
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2 pt-6 border-t border-gold/10">
                    <Link to="/contact" className="btn-gold !px-4 !py-2.5 text-xs flex-1">
                      <ShoppingBag className="w-3.5 h-3.5" /> {t('products.addCart')}
                    </Link>
                    <Link to="/contact" className="btn-ghost-gold !px-4 !py-2.5 text-xs">
                      <FileText className="w-3.5 h-3.5" />
                    </Link>
                    <button className="btn-ghost-gold !px-4 !py-2.5 text-xs" title={t('products.datasheet')}>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">{label}</dt>
      <dd className="text-foreground/90 font-medium">{value}</dd>
    </div>
  );
}
