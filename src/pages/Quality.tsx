import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Award, ShieldCheck, Globe, FileText, Download, Cpu, FlaskConical,
  Trees, Flame, Snowflake, Filter, Package, ClipboardCheck, Ship,
  Sparkles, Thermometer, Droplets, Wind, Mountain, Zap,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { SectionHeader, Stat } from '@/components/ui-lux';
import { SectionSkeleton } from '@/components/SectionSkeleton';
import { trademarks } from '@/data/trademarks';
import { useLiveLabReport } from '@/hooks/useLiveLabReport';

const CinematicGallery = lazy(() => import('./quality/CinematicGallery'));
const QualityCharts = lazy(() => import('./quality/QualityCharts'));
const InspectionCube = lazy(() => import('./quality/InspectionCube'));

/* ---------------- Animated Counter ---------------- */
function Counter({ to, suffix = '', duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString('ar-EG'));
  useEffect(() => {
    if (inView) animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
  }, [inView, to, duration, mv]);
  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      {suffix && <span className="ms-1 text-gold-hi">{suffix}</span>}
    </span>
  );
}

/* ---------------- Radial Gauge ---------------- */
function Gauge({
  label, value, suffix, max = 100, tip, icon: Icon,
}: { label: string; value: number; suffix: string; max?: number; tip: string; icon: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-80px' });
  const [progress, setProgress] = useState(0);
  const prevValue = useRef(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(prevValue.current, value, {
      duration: 1.2, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setProgress(v),
      onComplete: () => { prevValue.current = value; },
    });
    return controls.stop;
  }, [inView, value]);

  const pct = (progress / max) * 100;
  const circ = 2 * Math.PI * 64;
  const offset = circ - (pct / 100) * circ;

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-gold/20 hover:border-gold/60 hover:shadow-gold transition-all"
    >
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90">
          <circle cx="88" cy="88" r="64" stroke="hsl(var(--gold) / 0.10)" strokeWidth="3" fill="none" />
          <circle
            cx="88" cy="88" r="64" stroke="url(#gaugeGrad)" strokeWidth="3" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--gold) / 0.5))' }}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--gold-hi))" />
              <stop offset="100%" stopColor="hsl(var(--jade))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 text-gold-hi/70 mb-1" />
          <span className="text-3xl font-display text-foreground">
            {progress.toFixed(progress < 10 ? 1 : 0)}
            <span className="text-base text-foreground/60 ms-0.5">{suffix}</span>
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm font-arabic font-bold">{label}</p>
      <div className="absolute inset-x-4 -bottom-2 translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-2 transition-all duration-300 pointer-events-none z-10">
        <div className="rounded-xl bg-foreground text-background text-xs leading-relaxed p-3 shadow-luxe font-arabic">
          {tip}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Ember Particles ---------------- */
function Embers() {
  const particles = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const dur = 6 + Math.random() * 8;
        const size = 2 + Math.random() * 4;
        return (
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '-20%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              left: `${left}%`, width: size, height: size,
              background: 'radial-gradient(circle, hsl(var(--gold-hi)) 0%, transparent 70%)',
              boxShadow: '0 0 8px hsl(var(--gold-hi))',
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- Data ---------------- */
const gauges = [
  { label: 'نسبة الكربون', value: 85, suffix: '%', tip: 'كلما ارتفعت نسبة الكربون الثابت، زادت كفاءة الاحتراق ومدته.', icon: Flame },
  { label: 'نسبة الرماد', value: 3, suffix: '%', max: 10, tip: 'رماد منخفض = نظافة أعلى وقيمة حرارية أكبر لكل كيلوغرام.', icon: Mountain },
  { label: 'الرطوبة', value: 6, suffix: '%', max: 20, tip: 'الرطوبة المنخفضة تضمن إشعالاً سريعاً ودخاناً أقل.', icon: Droplets },
  { label: 'زمن الاحتراق', value: 185, suffix: 'د', max: 240, tip: 'متوسط زمن احتراق قطعة واحدة في ظروف مشواة قياسية.', icon: Thermometer },
  { label: 'الأداء الحراري', value: 750, suffix: '°C', max: 900, tip: 'أقصى درجة حرارة سطحية مقاسة في غرفة الاحتراق.', icon: Zap },
  { label: 'المواد المتطايرة', value: 6, suffix: '%', max: 15, tip: 'مواد متطايرة منخفضة تعني دخاناً أقل ورائحة محايدة.', icon: Wind },
];

const timeline = [
  { icon: Trees, t: 'اختيار الخشب', d: 'انتقاء سعف وجذوع النخيل من مزارع مستدامة معتمدة.' },
  { icon: Flame, t: 'الكربنة', d: 'فرن مغلق بدرجات حرارة مضبوطة للحصول على كربون نقي.' },
  { icon: Snowflake, t: 'التبريد', d: 'تبريد بطيء لتثبيت البنية الكربونية ومنع التشقق.' },
  { icon: Filter, t: 'الفرز', d: 'فرز يدوي وآلي حسب الكثافة والمقاس.' },
  { icon: FlaskConical, t: 'الاختبار المخبري', d: 'تحليل كامل: كربون، رماد، رطوبة، احتراق.' },
  { icon: Package, t: 'التغليف', d: 'تغليف فاخر مقاوم للرطوبة بمعايير التصدير.' },
  { icon: ClipboardCheck, t: 'الفحص النهائي', d: 'مراجعة جودة شاملة قبل الشحن.' },
  { icon: Ship, t: 'الموافقة على التصدير', d: 'إصدار شهادات المنشأ والفحص الجمركي.' },
];

const certificates = [
  { name: 'ISO 9001', code: 'CERT-ISO-9001-2015', desc: 'نظام إدارة الجودة العالمي يضمن تكرار الأداء وضبط العمليات في كل دفعة إنتاج.', icon: Award },
  { name: 'SASO', code: 'SASO-SA-2026-001', desc: 'مطابقة المواصفات السعودية للوقود الصلب والفحم الطبيعي.', icon: ShieldCheck },
  { name: 'شهادة التصدير', code: 'EU-GCC-EXP-2026', desc: 'اعتماد التصدير إلى دول الخليج والاتحاد الأوروبي ودول مجلس التعاون.', icon: Globe },
  { name: 'تقرير فحص الجودة', code: 'QC-RPT-2026-Q2', desc: 'تقرير مخبري دوري لكل دفعة إنتاج موقع من المختبر المعتمد.', icon: FileText },
  { name: 'سلامة التلامس الغذائي', code: 'FOOD-SAFE-EU-10', desc: 'مطابقة معايير التلامس الغذائي الأوروبية EU 10/2011.', icon: ShieldCheck },
];

const counters = [
  { v: 10, s: '+', l: 'دولة تصدير' },
  { v: 5000, s: '+', l: 'عميل حول العالم' },
  { v: 99, s: '٫٨٪', l: 'رضا العملاء' },
  { v: 100, s: '٪', l: 'فحص جودة' },
  { v: 50, s: '+', l: 'اختبار جودة' },
];

const downloads = [
  { t: 'تقرير الجودة', d: 'تقرير PDF شامل لنتائج آخر دفعة إنتاج.', icon: FileText },
  { t: 'البطاقة الفنية', d: 'مواصفات تقنية كاملة للمنتج.', icon: ClipboardCheck },
  { t: 'التحليل المخبري', d: 'تحاليل مفصلة للكربون والرطوبة والرماد.', icon: FlaskConical },
  { t: 'مواصفات التصدير', d: 'دليل التغليف والشحن الدولي.', icon: Ship },
  { t: 'دليل التغليف', d: 'تعليمات التخزين وحفظ الجودة.', icon: Package },
];

const aiSteps = [
  { t: 'بيانات الإنتاج', i: Cpu },
  { t: 'تحليل الذكاء الاصطناعي', i: Sparkles },
  { t: 'تحقق المختبر', i: FlaskConical },
  { t: 'اعتماد الجودة', i: ShieldCheck },
];

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <SectionHeader eyebrow={eyebrow} title={title} />;
}

/* ---------------- Page ---------------- */
export default function Quality() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [openCert, setOpenCert] = useState<number | null>(null);
  const { latest, updatedAt } = useLiveLabReport();

  const liveGauges = latest
    ? [
        { ...gauges[0], value: Number(latest.carbon_pct) },
        { ...gauges[1], value: Number(latest.ash_pct) },
        { ...gauges[2], value: Number(latest.moisture_pct) },
        { ...gauges[3], value: Number(latest.burn_time_min) },
        { ...gauges[4], value: Number(latest.max_temp_c) },
        { ...gauges[5], value: Number(latest.volatile_pct) },
      ]
    : gauges;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: isAr ? 'الجودة — فحم النخلة' : 'Quality — Palm Charcoal',
    url: 'https://alnakhlacoal.com/quality',
    inLanguage: isAr ? 'ar' : 'en',
    about: {
      '@type': 'Product',
      name: 'Palm Charcoal',
      brand: { '@type': 'Brand', name: 'فحم النخلة' },
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Fixed Carbon', value: '85%' },
        { '@type': 'PropertyValue', name: 'Ash', value: '3%' },
        { '@type': 'PropertyValue', name: 'Moisture', value: '6%' },
        { '@type': 'PropertyValue', name: 'Burn Time', value: '185 min' },
        { '@type': 'PropertyValue', name: 'Max Temperature', value: '750°C' },
      ],
    },
    hasCredential: certificates.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      identifier: c.code,
      description: c.desc,
    })),
  };

  return (
    <>
      <SEO
        title={isAr ? 'الجودة — فحم النخلة' : 'Quality — Palm Charcoal'}
        description="كل دفعة من فحم النخلة مقيسة ومعتمدة. مختبر متكامل، تحليلات حية، وشهادات دولية."
        path="/quality"
        jsonLd={jsonLd}
      />

      {/* Cinematic Hero */}
      <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-b from-dark via-dark-2 to-background">
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, hsl(var(--gold) / 0.18), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--jade) / 0.25), transparent 50%)' }}
        />
        <Embers />
        <div className="container relative">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="eyebrow mb-8 text-gold-hi"
          >
            مختبر الجودة
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-arabic font-bold leading-[1.1] text-background max-w-5xl"
          >
            كل دفعة... <span className="text-gold-hi">مقيسة</span> ومعتمدة.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-lg md:text-xl text-background/70 max-w-2xl mt-8 font-arabic leading-loose"
          >
            كل شحنة من فحم النخلة تمر عبر سلسلة من اختبارات الجودة الدقيقة لضمان أعلى مستويات الأداء والاحتراق والثبات.
          </motion.p>
        </div>
      </section>

      <Suspense fallback={<SectionSkeleton variant="grid" label="جارٍ تحميل معرض المختبر" />}>
        <CinematicGallery />
      </Suspense>

      {/* Lab Dashboard */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="لوحة المختبر الحية" title="مؤشرات الجودة في الزمن الحقيقي" />
          <div
            aria-live="polite"
            className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm font-arabic"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade/70 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jade" />
            </span>
            <span className="text-foreground/70">
              {latest ? (
                <>دفعة <span className="text-gold-hi font-semibold">{latest.batch_code}</span> — تم التحديث {new Date(updatedAt).toLocaleTimeString('ar-EG')}</>
              ) : (
                <>جارٍ الاتصال بالمختبر…</>
              )}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {liveGauges.map((g) => <Gauge key={g.label} {...g} />)}
          </div>
        </div>
      </section>

      {/* Live Analytics */}
      <section className="section bg-surface-2/40 border-y border-gold/10">
        <div className="container">
          <SectionTitle eyebrow="تحليلات حية" title="بيانات الجودة عبر دفعات الإنتاج" />
          <Suspense fallback={<SectionSkeleton variant="grid" label="جارٍ تحميل التحليلات" />}>
            <QualityCharts />
          </Suspense>
        </div>
      </section>

      {/* Digital Laboratory */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="المختبر الرقمي" title="تحت العدسة — لحظات من داخل المعمل" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'مختبر حديث', 'اختبار حرارة الفحم', 'تحليل الكربون',
              'اختبار الرطوبة', 'الفحص الصناعي', 'مراقبة الجودة',
            ].map((label, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-dark via-dark-2 to-dark border border-gold/20"
              >
                <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ backgroundImage: `radial-gradient(circle at ${30 + i * 8}% ${40 + i * 5}%, hsl(var(--gold-hi) / 0.5), transparent 60%)` }} />
                <div className="absolute inset-0 flex flex-col items-end justify-end p-5 text-background">
                  <FlaskConical className="w-8 h-8 text-gold-hi mb-3 opacity-70" />
                  <span className="font-arabic font-bold text-lg">{label}</span>
                </div>
                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-gold-hi/60">
                  LAB · 0{i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Inspection */}
      <section className="section bg-gradient-to-b from-background via-surface-2/50 to-background">
        <div className="container">
          <SectionTitle eyebrow="فحص المنتج ثلاثي الأبعاد" title="اسحب لتدوير المكعب وفحص النقاط" />
          <Suspense fallback={<SectionSkeleton variant="timeline" label="جارٍ تحميل المكعب التفاعلي" />}>
            <InspectionCube />
          </Suspense>
        </div>
      </section>

      {/* Registered Trademarks Showcase */}
      <section className="section bg-gradient-to-b from-background to-surface-2/30 border-y border-gold/10">
        <div className="container">
          <SectionTitle eyebrow="ملكية فكرية موثقة" title="علامات تجارية مسجلة رسمياً" />
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {trademarks.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group rounded-2xl clay-card p-4 hover:shadow-gold transition"
              >
                <div className="aspect-square bg-cream rounded-lg overflow-hidden mb-3">
                  <img src={t.image} alt={t.nameAr} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" loading="lazy" decoding="async" />
                </div>
                <h4 className="font-arabic font-bold text-sm text-foreground">{t.nameAr}</h4>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">رقم {t.registrationNo}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/trademarks" className="inline-block px-6 py-3 rounded-lg bg-emerald text-cream hover:bg-jade transition font-arabic text-sm">
              عرض التقرير التفاعلي الكامل
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="رحلة الجودة" title="من النخلة إلى منصة التصدير" />
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute right-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            <div className="space-y-12">
              {timeline.map((step, i) => (
                <motion.div key={step.t}
                  initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="flex-1 text-end font-arabic">
                    {i % 2 === 0 && (<><h4 className="font-bold text-xl mb-2">{step.t}</h4><p className="text-foreground/70 leading-relaxed">{step.d}</p></>)}
                  </div>
                  <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-gold-hi to-jade text-background flex items-center justify-center shadow-gold">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 font-arabic">
                    {i % 2 !== 0 && (<><h4 className="font-bold text-xl mb-2">{step.t}</h4><p className="text-foreground/70 leading-relaxed">{step.d}</p></>)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="section bg-surface-2/40 border-y border-gold/10">
        <div className="container">
          <SectionTitle eyebrow="الشهادات والاعتمادات" title="جودة موثقة عالمياً" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((c, i) => (
              <motion.button
                key={c.code} onClick={() => setOpenCert(i)}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="clay-card text-start p-8 rounded-2xl hover:border-gold/60 hover:shadow-gold transition-all"
              >
                <c.icon className="w-10 h-10 text-gold-hi mb-5" />
                <h3 className="font-arabic font-bold text-xl mb-2">{c.name}</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-foreground/40 font-mono mb-4">{c.code}</p>
                <p className="text-sm text-foreground/70 font-arabic leading-relaxed line-clamp-3">{c.desc}</p>
                <span className="inline-block mt-5 text-xs font-arabic text-jade">اضغط للعرض ←</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={openCert !== null} onOpenChange={() => setOpenCert(null)}>
        <DialogContent className="max-w-2xl">
          {openCert !== null && (
            <>
              <DialogHeader>
                <DialogTitle className="font-arabic text-2xl">{certificates[openCert].name}</DialogTitle>
              </DialogHeader>
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-dark to-dark-2 flex flex-col items-center justify-center text-background border border-gold/30">
                {(() => { const I = certificates[openCert].icon; return <I className="w-20 h-20 text-gold-hi mb-4" />; })()}
                <p className="font-arabic text-lg">{certificates[openCert].name}</p>
                <p className="text-xs font-mono text-gold-hi/70 mt-2">{certificates[openCert].code}</p>
              </div>
              <p className="font-arabic text-foreground/70 leading-loose mt-4">{certificates[openCert].desc}</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Verification */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="الذكاء الاصطناعي" title="ذكاء اصطناعي لضمان الجودة" />
          <p className="text-center text-foreground/70 font-arabic max-w-2xl mx-auto leading-loose -mt-8 mb-16">
            يقوم النظام بتحليل بيانات الإنتاج ومقارنة نتائج المختبر تلقائياً لاكتشاف أي اختلافات قبل خروج المنتج من المصنع.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {aiSteps.map((s, i) => (
              <div key={s.t} className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="w-32 h-32 rounded-2xl bg-gradient-to-br from-foreground to-jade text-background flex flex-col items-center justify-center p-3 text-center shadow-luxe"
                >
                  <s.i className="w-7 h-7 text-gold-hi mb-2" />
                  <span className="font-arabic text-sm font-bold leading-tight">{s.t}</span>
                </motion.div>
                {i < aiSteps.length - 1 && (
                  <motion.div
                    initial={{ width: 0 }} whileInView={{ width: 40 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.2 }}
                    className="h-px bg-gradient-to-r from-gold-hi to-jade"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confidence Counters */}
      <section className="section bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(var(--gold) / 0.6), transparent 50%)' }} />
        <div className="container relative">
          <SectionTitle eyebrow="ثقة العملاء" title="أرقام تتحدث عن نفسها" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {counters.map((c, i) => (
              <motion.div key={c.l}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <Stat
                  size="lg"
                  value={<Counter to={c.v} suffix={c.s} />}
                  label={<span className="text-background/70">{c.l}</span>}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Center */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="مركز التنزيل" title="ملفات الجودة والمواصفات" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((f, i) => (
              <motion.a
                key={f.t} href="#"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="clay-card group p-7 rounded-2xl hover:border-gold/60 hover:shadow-gold transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-hi flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 font-arabic">
                  <h4 className="font-bold mb-1">{f.t}</h4>
                  <p className="text-sm text-foreground/60 leading-relaxed">{f.d}</p>
                </div>
                <Download className="w-5 h-5 text-foreground/40 group-hover:text-gold-hi transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
