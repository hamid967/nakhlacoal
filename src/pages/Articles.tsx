import { motion } from 'framer-motion';
import { Calendar, ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';

const articles = [
  {
    id: 'why-natural-charcoal',
    titleAr: 'لماذا الفحم الطبيعي أفضل؟',
    excerptAr: 'الفحم الطبيعي يحترق أطول، حرارته أعلى، ولا يحتوي على مواد كيميائية — اكتشف الفرق التقني.',
    date: '2025-01-12', readMin: 5, category: 'الجودة',
  },
  {
    id: 'shisha-charcoal-guide',
    titleAr: 'دليلك الكامل لاختيار فحم المعسل',
    excerptAr: 'المقاسات، زمن الإشعال، الرائحة، ونصائح للحصول على أفضل تجربة جلسة.',
    date: '2025-02-04', readMin: 6, category: 'المعسل',
  },
  {
    id: 'bbq-tips',
    titleAr: 'أسرار الشواء الاحترافي بفحم النخلة',
    excerptAr: 'من توزيع الجمر إلى ضبط الحرارة — نصائح يستخدمها أمهر الطباخين.',
    date: '2025-03-21', readMin: 7, category: 'الشواء',
  },
  {
    id: 'export-quality',
    titleAr: 'كيف نضمن الجودة في كل شحنة تصدير؟',
    excerptAr: 'نظرة داخل عمليات ضبط الجودة لدينا قبل خروج كل حاوية للأسواق الدولية.',
    date: '2025-04-08', readMin: 4, category: 'التصدير',
  },
  {
    id: 'oud-incense',
    titleAr: 'فن استخدام الفحم مع العود والبخور',
    excerptAr: 'الفحم المناسب يبرز رائحة العود ويطيل أمد الجلسة. تعرف كيف.',
    date: '2025-05-15', readMin: 5, category: 'البخور',
  },
  {
    id: 'storage',
    titleAr: 'تخزين الفحم: نصائح لإطالة العمر والجودة',
    excerptAr: 'الرطوبة عدو الفحم. كيف تحافظ على جودة كل قطعة من وقت الشراء حتى الاحتراق.',
    date: '2025-06-02', readMin: 4, category: 'إرشادات',
  },
];

export default function Articles() {
  return (
    <>
      <SEO title="مقالات | فحم النخلة" description="مقالات ودلائل عن الفحم الطبيعي، المعسل، الشواء، والبخور من فحم النخلة." path="/articles" />
      <PageHero eyebrow="معرفة وخبرة" title="مقالات فحم النخلة" subtitle="نصائح، دلائل، ومعرفة فنية عن صناعة الفحم واستخداماته." />
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-gold/20 bg-white/60 backdrop-blur-md p-6 hover:border-gold/60 hover:shadow-gold transition"
            >
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]">{a.category}</span>
                <span className="flex items-center gap-1 tabular-nums"><Calendar className="w-3 h-3" /> {a.date}</span>
              </div>
              <h3 className="font-serif text-xl text-emerald leading-snug">{a.titleAr}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.excerptAr}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{a.readMin} د قراءة</span>
                <button className="inline-flex items-center gap-1 text-[hsl(var(--gold))] hover:underline">
                  اقرأ المقال <ArrowLeft className="w-3 h-3" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
