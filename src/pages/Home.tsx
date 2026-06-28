import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { ScrollReveal } from '@/components/ScrollReveal';
import { WhatsAppFab } from '@/components/WhatsAppFab';
import heroCharcoal from '@/assets/hero-charcoal.jpg';
import productBbq from '@/assets/product-bbq.jpg';
import productBox from '@/assets/product-box.jpg';

export default function Home() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;

  return (
    <>
      <SEO
        title="فحم النخلة | الفحم السعودي الفاخر"
        description="فحم نخيل سعودي طبيعي للشواء والشيشة والضيافة الفاخرة. زمن احتراق أطول وحرارة أعلى ورماد أقل."
        path="/"
      />

      {/* ============= EDITORIAL HERO ============= */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[88vh] border-b border-foreground/10 pt-20">
        {/* Image — 7 cols */}
        <ScrollReveal className="md:col-span-7 relative overflow-hidden bg-foreground/5">
          <img
            src={heroCharcoal}
            alt={isAr ? 'فحم النخلة' : 'Palm Charcoal'}
            className="w-full h-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
          <div className="absolute bottom-8 start-8 text-background/80 text-[10px] uppercase tracking-[0.4em]">
            {isAr ? 'الإصدار التحريري ٠١' : 'Editorial edition 01'}
          </div>
        </ScrollReveal>

        {/* Copy — 5 cols */}
        <ScrollReveal
          delay={150}
          className="md:col-span-5 flex flex-col justify-center p-8 md:p-16 lg:p-20 border-s border-foreground/10 bg-surface/50"
        >
          <span className="text-gold-lo font-semibold mb-6 tracking-[0.4em] uppercase text-xs">
            {isAr ? 'مجلة فحم النخلة • العدد ٠١' : 'Palm Charcoal Journal • No. 01'}
          </span>
          <h1
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] mb-8 ${
              isAr ? 'font-arabic font-bold' : 'font-display font-bold'
            }`}
          >
            {isAr ? (
              <>
                جوهر
                <br />
                <span className="italic font-light text-jade">الأصالة</span>
              </>
            ) : (
              <>
                The Essence
                <br />
                <span className="italic font-light text-jade">of Tradition</span>
              </>
            )}
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-foreground/80 mb-10 max-w-sm">
            {isAr
              ? 'فحم النخيل الفاخر المصمم خصيصاً لجلساتكم الراقية. جودة لا تضاهى، واحتراق يدوم طويلاً بلمسة من الفخامة السعودية.'
              : 'Premium palm charcoal crafted for refined gatherings. Unmatched quality and a long, even burn with a touch of Saudi luxury.'}
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <Link to="/products" className="btn-gold">
              {isAr ? 'اكتشف التشكيلة' : 'Explore the collection'}
            </Link>
            <Link
              to="/about"
              className="text-gold-lo border-b border-gold/60 hover:border-gold pb-1 font-medium tracking-wide uppercase text-sm"
            >
              {isAr ? 'قصتنا' : 'The Story'}
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ============= ASYMMETRIC MAGAZINE GRID ============= */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
          {/* Vertical narrative */}
          <ScrollReveal className="md:row-span-2 flex flex-col">
            <div className="aspect-[3/4] bg-foreground mb-8 relative overflow-hidden">
              <img
                src={productBbq}
                alt={isAr ? 'مجموعة الصفوة' : 'Elite Selection'}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 start-6">
                <span className="px-4 py-1.5 bg-gold text-foreground text-[10px] tracking-[0.2em] uppercase font-bold">
                  {isAr ? 'درجة فاخرة' : 'Premium Grade'}
                </span>
              </div>
            </div>
            <h3 className={`text-3xl font-bold mb-2 ${isAr ? 'font-arabic' : 'font-display'}`}>
              {isAr ? 'مجموعة الصفوة' : 'The Elite Selection'}
            </h3>
            <p className="text-xs text-gold-lo italic mb-5 uppercase tracking-[0.25em]">
              {isAr ? 'The Elite Selection' : 'منتقى يدوياً'}
            </p>
            <p className="text-base leading-relaxed text-foreground/75">
              {isAr
                ? 'فحم منتقى بعناية من أجود بساتين النخيل، يعالج يدوياً ليمنحكم تجربة احتراق نقية وخالية من الشوائب.'
                : 'Charcoal carefully selected from the finest palm groves, hand-processed for a pure, clean-burning experience.'}
            </p>
          </ScrollReveal>

          {/* Two feature columns */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            {[
              {
                num: isAr ? '٠١ / المنهج' : '01 / Process',
                title: isAr ? 'استدامة من قلب الصحراء' : 'Sustainability from the desert',
                body: isAr
                  ? 'نلتزم بأعلى معايير الحفاظ على البيئة في إنتاج فحمنا، معتمدين على مخلفات النخيل الطبيعية.'
                  : 'We hold ourselves to the highest environmental standards, relying entirely on natural palm by-products.',
              },
              {
                num: isAr ? '٠٢ / الأداء' : '02 / Performance',
                title: isAr ? 'حرارة تدوم لساعات' : 'Heat that lasts for hours',
                body: isAr
                  ? 'تقنية كبس متطورة تضمن اشتعالاً ثابتاً لفترات طويلة مع أدنى مستوى من الرماد والدخان.'
                  : 'Advanced compression ensures a steady, lasting burn with minimal ash and smoke.',
              },
            ].map((f, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="border-t-2 border-gold pt-8 h-full">
                  <span className="text-[10px] font-bold text-gold-lo mb-4 block uppercase tracking-[0.3em]">
                    {f.num}
                  </span>
                  <h4 className={`text-2xl font-bold mb-4 ${isAr ? 'font-arabic' : 'font-display'}`}>
                    {f.title}
                  </h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{f.body}</p>
                </div>
              </ScrollReveal>
            ))}

            {/* Highlighted dark editorial card */}
            <ScrollReveal delay={200} className="md:col-span-2">
              <div className="flex bg-foreground text-background items-stretch overflow-hidden min-h-[260px]">
                <div className="p-10 md:p-14 flex-1 flex flex-col justify-center">
                  <h3 className={`text-4xl md:text-5xl font-bold mb-5 ${isAr ? 'font-arabic' : 'font-display'}`}>
                    {isAr ? 'العلبة الذهبية' : 'The Gold Box'}
                  </h3>
                  <p className="opacity-75 mb-8 leading-relaxed max-w-sm text-sm md:text-base">
                    {isAr
                      ? 'إصدار محدود مصمم للهدايا الفاخرة، يجسد كرم الضيافة العربية في أبهى صورها.'
                      : 'A limited edition crafted for luxury gifting — Arabian hospitality at its finest.'}
                  </p>
                  <div>
                    <Link
                      to="/products/export"
                      className="inline-flex px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-foreground transition-all font-medium uppercase text-xs tracking-[0.25em]"
                    >
                      {isAr ? 'تسوق الآن' : 'Shop now'}
                    </Link>
                  </div>
                </div>
                <div className="w-2/5 relative hidden md:block">
                  <img
                    src={productBox}
                    alt={isAr ? 'العلبة الذهبية' : 'Gold Box'}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============= EDITORIAL QUOTE ============= */}
      <section className="py-24 md:py-32 px-8 text-center bg-surface/60 border-t border-foreground/10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-px bg-gold mx-auto mb-12" />
            <blockquote
              className={`text-3xl md:text-4xl lg:text-5xl italic leading-tight text-foreground ${
                isAr ? 'font-arabic font-bold' : 'font-display font-normal'
              }`}
            >
              {isAr
                ? '«لا تكتمل الجلسة إلا برائحة الأصالة ونقاء الفحم الذي يحفظ للقهوة هيبتها وللمجلس وقاره.»'
                : '“No gathering is complete without the scent of authenticity and the purity of charcoal that gives coffee its dignity and the majlis its grace.”'}
            </blockquote>
            <p className="mt-10 text-gold-lo tracking-[0.5em] uppercase text-[10px] font-bold">
              {isAr ? 'صناعة سعودية خالصة' : 'Pure Saudi Craftsmanship'}
            </p>
          </div>
        </ScrollReveal>
      </section>

      <WhatsAppFab />
    </>
  );
}
