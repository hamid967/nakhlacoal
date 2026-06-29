import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Award, ShieldCheck, Globe, FileText, Download, Cpu, FlaskConical,
  Trees, Flame, Snowflake, Filter, Package, ClipboardCheck, Ship,
  Sparkles, Thermometer, Droplets, Wind, Mountain, Zap,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { SectionHeader, Stat } from '@/components/ui-lux';
import { trademarks } from '@/data/trademarks';
import emberImg from '@/assets/quality/ember-closeup.jpg';
import labImg from '@/assets/quality/lab-measurement.jpg';
import burnImg from '@/assets/quality/burn-test.jpg';

/* ---------------- Cinematic Gallery ---------------- */
function CinematicGallery() {
  const shots = [
    { src: emberImg, title: 'الجمر الحي', sub: 'حرارة موحدة 950°C', tag: 'EMBER' },
    { src: labImg, title: 'القياس الدقيق', sub: 'تفاوت أقل من ±0.3mm', tag: 'LAB' },
    { src: burnImg, title: 'اختبار الاحتراق', sub: 'ثبات 180 دقيقة', tag: 'BURN' },
  ];
  return (
    <section className="py-28 bg-[#0c1410]">
      <div className="container">
        <SectionTitle eyebrow="معرض المختبر" title="لقطات حية من خط الجودة" />
        <div className="grid md:grid-cols-3 gap-6">
          {shots.map((s, i) => (
            <motion.figure
              key={s.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-2xl border border-gold/20 hover:border-gold/60 shadow-luxe"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={s.src}
                  alt={s.title}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-[1400ms] ease-out group-hover:scale-110 group-hover:rotate-1"
                  style={{ filter: 'contrast(1.08) saturate(1.05)' }}
                />
                {/* gold scan line */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_45%,hsl(var(--gold-hi)/0.35)_50%,transparent_55%,transparent_100%)] opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2.4s_linear_infinite] mix-blend-overlay" />
                {/* vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
                {/* grain */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")" }}
                />
                {/* tag */}
                <span className="absolute top-4 left-4 text-[10px] tracking-[0.3em] px-2 py-1 rounded bg-black/50 backdrop-blur text-gold-hi border border-gold/30">
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
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setProgress(v),
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

const trend = [
  { batch: '١', q: 92 }, { batch: '٢', q: 94 }, { batch: '٣', q: 93 },
  { batch: '٤', q: 96 }, { batch: '٥', q: 97 }, { batch: '٦', q: 98 },
  { batch: '٧', q: 97 }, { batch: '٨', q: 99 },
];

const comparison = [
  { metric: 'الكربون', palm: 85, market: 68 },
  { metric: 'الاحتراق', palm: 185, market: 110 },
  { metric: 'الحرارة', palm: 95, market: 70 },
  { metric: 'الرماد', palm: 97, market: 78 },
  { metric: 'النقاء', palm: 99, market: 75 },
];

const radar = [
  { k: 'الاحتراق', palm: 95, market: 65 },
  { k: 'الحرارة', palm: 92, market: 70 },
  { k: 'الرماد', palm: 97, market: 60 },
  { k: 'الدخان', palm: 96, market: 55 },
  { k: 'الرائحة', palm: 98, market: 62 },
  { k: 'الكربون', palm: 94, market: 68 },
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

type Face = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom';
const inspectionSpots: { face: Face; x: number; y: number; label: string; value: string; desc: string }[] = [
  { face: 'front',  x: 30, y: 35, label: 'نسبة الكربون',    value: '٨٥٪',   desc: 'كربون ثابت عالي يمنح احتراقاً نظيفاً وطويلاً.' },
  { face: 'front',  x: 70, y: 65, label: 'الكثافة',         value: '١٫١ غ/سم³', desc: 'بنية مضغوطة تضمن ثبات الجمرة وعدم التفتت.' },
  { face: 'right',  x: 50, y: 40, label: 'السطح',           value: 'مصقول', desc: 'سطح ناعم مغلق يقلل الرماد المتطاير.' },
  { face: 'top',    x: 55, y: 55, label: 'مقاومة الضغط',    value: '٤٢ MPa', desc: 'يتحمل الشحن والتكديس دون كسر.' },
  { face: 'back',   x: 45, y: 50, label: 'المقاومة الحرارية', value: '٧٥٠°م', desc: 'يحافظ على الحرارة القصوى طوال جلسة الشواء.' },
  { face: 'left',   x: 50, y: 50, label: 'الرماد',          value: '٣٪',    desc: 'رماد منخفض يعني نظافة أعلى وقيمة أكبر لكل كجم.' },
];


/* ---------------- Section primitives (unified via ui-lux) ---------------- */
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <SectionHeader eyebrow={eyebrow} title={title} />;
}

/* ---------------- 3D Inspection Cube ---------------- */
const FACE_TRANSFORMS: Record<Face, string> = {
  front:  'translateZ(120px)',
  back:   'rotateY(180deg) translateZ(120px)',
  right:  'rotateY(90deg) translateZ(120px)',
  left:   'rotateY(-90deg) translateZ(120px)',
  top:    'rotateX(90deg) translateZ(120px)',
  bottom: 'rotateX(-90deg) translateZ(120px)',
};
const FACE_LABEL: Record<Face, string> = {
  front: 'الأمام', back: 'الخلف', right: 'اليمين', left: 'اليسار', top: 'الأعلى', bottom: 'الأسفل',
};
const FACE_VIEW: Record<Face, { x: number; y: number }> = {
  front: { x: 0, y: 0 }, back: { x: 0, y: 180 },
  right: { x: 0, y: -90 }, left: { x: 0, y: 90 },
  top: { x: -90, y: 0 }, bottom: { x: 90, y: 0 },
};

function InspectionCube() {
  const [rot, setRot] = useState({ x: -18, y: 28, z: 0 });
  const [auto, setAuto] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; angle: number } | null>(null);

  // Auto-rotate
  useEffect(() => {
    if (!auto || active !== null) return;
    let raf = 0;
    const tick = () => { setRot((r) => ({ ...r, y: r.y + 0.25 })); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, active]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = {
        dist: Math.hypot(b.x - a.x, b.y - a.y),
        angle: Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI),
      };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const angle = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
      const dz = angle - pinch.current.angle;
      pinch.current.angle = angle;
      setRot((r) => ({ ...r, z: r.z + dz }));
    } else if (pointers.current.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      setRot((r) => ({ ...r, x: r.x - dy * 0.5, y: r.y + dx * 0.5 }));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const focusSpot = (i: number) => {
    setActive(i);
    setAuto(false);
    const v = FACE_VIEW[inspectionSpots[i].face];
    setRot({ x: v.x, y: v.y, z: 0 });
  };
  const reset = () => { setRot({ x: -18, y: 28, z: 0 }); setActive(null); setAuto(true); };

  return (
    <div className="grid lg:grid-cols-[1fr,1.1fr] gap-12 items-center">
      <div className="relative">
        <div
          className="relative h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
          style={{ perspective: '1400px' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onMouseEnter={() => setAuto(false)}
          onMouseLeave={() => active === null && setAuto(true)}
        >
          <div
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
              width: 240, height: 240, position: 'relative',
              transition: pointers.current.size ? 'none' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {(Object.keys(FACE_TRANSFORMS) as Face[]).map((face) => (
              <div key={face}
                className="absolute inset-0 border border-gold/40"
                style={{
                  transform: FACE_TRANSFORMS[face],
                  background: 'linear-gradient(135deg, #1a1410 0%, #0a0806 100%)',
                  boxShadow: 'inset 0 0 40px hsl(var(--gold) / 0.15), 0 0 30px hsl(var(--gold) / 0.2)',
                }}
              >
                <div className="absolute inset-2 opacity-40"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, hsl(var(--gold-hi) / 0.4), transparent 50%), radial-gradient(circle at 70% 70%, hsl(var(--jade) / 0.3), transparent 50%)' }} />
                <span className="absolute top-1 left-2 text-[10px] font-mono uppercase tracking-widest text-gold-hi/40">
                  {FACE_LABEL[face]}
                </span>
                {inspectionSpots.map((s, i) => s.face === face && (
                  <button key={i}
                    onClick={(e) => { e.stopPropagation(); focusSpot(i); }}
                    onMouseEnter={() => setActive(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  >
                    <span className={`block w-3 h-3 rounded-full transition-all ${active === i ? 'bg-gold-hi scale-150' : 'bg-gold-hi/80'}`}
                      style={{ boxShadow: '0 0 12px hsl(var(--gold-hi))' }} />
                    <span className={`absolute inset-0 rounded-full bg-gold-hi/40 ${active === i ? 'animate-ping' : ''}`} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-arabic text-sm">
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-foreground text-background hover:bg-jade transition">إعادة ضبط</button>
          <button onClick={() => setAuto((a) => !a)} className="px-4 py-2 rounded-lg border border-gold/40 hover:bg-gold/10 transition">
            {auto ? 'إيقاف الدوران' : 'تشغيل الدوران'}
          </button>
          {(Object.keys(FACE_VIEW) as Face[]).map((f) => (
            <button key={f} onClick={() => { setAuto(false); setRot({ ...FACE_VIEW[f], z: 0 }); }}
              className="px-3 py-2 rounded-lg border border-gold/20 hover:border-gold/60 transition text-xs">
              {FACE_LABEL[f]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-foreground/50 font-arabic">
          اسحب لتدوير المكعب • إصبعان للتدوير المحوري • انقر النقاط للتركيز
        </p>

        {/* Debug Panel */}
        <details className="mt-4 mx-auto max-w-md rounded-xl border border-gold/30 bg-rich-black/90 text-cream font-mono text-[11px] overflow-hidden">
          <summary className="cursor-pointer select-none px-3 py-2 bg-gold/10 text-gold-hi flex justify-between items-center">
            <span>🛠 Debug · InspectionCube</span>
            <span className="text-cream/50">state monitor</span>
          </summary>
          <div className="p-3 space-y-1 leading-relaxed">
            <div className="flex justify-between"><span className="text-cream/50">rot.x</span><span className="text-gold-hi tabular-nums">{rot.x.toFixed(2)}°</span></div>
            <div className="flex justify-between"><span className="text-cream/50">rot.y</span><span className="text-gold-hi tabular-nums">{rot.y.toFixed(2)}°</span></div>
            <div className="flex justify-between"><span className="text-cream/50">rot.z</span><span className="text-gold-hi tabular-nums">{rot.z.toFixed(2)}°</span></div>
            <div className="flex justify-between"><span className="text-cream/50">auto-rotate</span><span className={auto ? 'text-jade' : 'text-ember-orange'}>{String(auto)}</span></div>
            <div className="flex justify-between"><span className="text-cream/50">active hotspot</span><span className="text-gold-hi">{active === null ? 'null' : `#${active + 1} · ${inspectionSpots[active]?.label}`}</span></div>
            <div className="flex justify-between"><span className="text-cream/50">dragRef pointers</span><span className="text-gold-hi tabular-nums">{pointers.current.size}</span></div>
            <div className="flex justify-between"><span className="text-cream/50">pinch active</span><span className={pinch.current ? 'text-jade' : 'text-cream/40'}>{pinch.current ? `${pinch.current.angle.toFixed(1)}°` : 'idle'}</span></div>
          </div>
        </details>
      </div>

      {/* Hotspots panel */}
      <ul className="space-y-3 font-arabic">
        {inspectionSpots.map((s, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => focusSpot(i)}
            className={`group cursor-pointer p-5 rounded-2xl border backdrop-blur transition-all ${
              active === i
                ? 'bg-foreground text-background border-gold shadow-gold scale-[1.02]'
                : 'glass-card hover:border-gold/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`w-11 h-11 rounded-full flex items-center justify-center font-bold transition-colors ${
                active === i ? 'bg-gold-hi text-foreground' : 'bg-gold/15 text-gold-hi'
              }`}>{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="font-bold">{s.label}</h4>
                  <span className={`text-lg ${active === i ? 'text-gold-hi' : 'text-jade'}`}>{s.value}</span>
                </div>
                <p className={`text-sm leading-relaxed mt-1 ${active === i ? 'text-background/70' : 'text-foreground/60'}`}>
                  {s.desc}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function Quality() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [openCert, setOpenCert] = useState<number | null>(null);


  return (
    <>
      <SEO
        title={isAr ? 'الجودة — فحم النخلة' : 'Quality — Palm Charcoal'}
        description="كل دفعة من فحم النخلة مقيسة ومعتمدة. مختبر متكامل، تحليلات حية، وشهادات دولية."
        path="/quality"
      />

      {/* Cinematic Hero */}
      <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-b from-[#0c1410] via-[#0f1a14] to-background">
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

      {/* Lab Dashboard */}
      <section className="py-28">
        <div className="container">
          <SectionTitle eyebrow="لوحة المختبر الحية" title="مؤشرات الجودة في الزمن الحقيقي" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {gauges.map((g) => <Gauge key={g.label} {...g} />)}
          </div>
        </div>
      </section>

      {/* Live Analytics */}
      <section className="py-28 bg-surface-2/40 border-y border-gold/10">
        <div className="container">
          <SectionTitle eyebrow="تحليلات حية" title="بيانات الجودة عبر دفعات الإنتاج" />
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="glass-card rounded-2xl p-6 shadow-luxe"
            >
              <h3 className="font-arabic font-bold mb-4">اتجاه الجودة عبر الدفعات</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend}>
                  <CartesianGrid stroke="hsl(var(--gold) / 0.1)" strokeDasharray="3 3" />
                  <XAxis dataKey="batch" stroke="hsl(var(--foreground))" />
                  <YAxis domain={[80, 100]} stroke="hsl(var(--foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--dark))', border: 'none', color: 'hsl(var(--background))' }} />
                  <Line type="monotone" dataKey="q" stroke="hsl(var(--gold-hi))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--jade))' }} animationDuration={1800} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
              className="glass-card rounded-2xl p-6 shadow-luxe"
            >
              <h3 className="font-arabic font-bold mb-4">فحم النخلة مقابل متوسط السوق</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={comparison}>
                  <CartesianGrid stroke="hsl(var(--gold) / 0.1)" strokeDasharray="3 3" />
                  <XAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--dark))', border: 'none', color: 'hsl(var(--background))' }} />
                  <Legend />
                  <Bar dataKey="palm" name="فحم النخلة" fill="hsl(var(--gold-hi))" radius={[6, 6, 0, 0]} animationDuration={1500} />
                  <Bar dataKey="market" name="السوق" fill="hsl(var(--jade))" radius={[6, 6, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-luxe"
            >
              <h3 className="font-arabic font-bold mb-4">مقارنة الأداء متعدد المحاور</h3>
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radar}>
                  <PolarGrid stroke="hsl(var(--gold) / 0.2)" />
                  <PolarAngleAxis dataKey="k" stroke="hsl(var(--foreground))" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--foreground) / 0.4)" />
                  <Radar name="فحم النخلة" dataKey="palm" stroke="hsl(var(--gold-hi))" fill="hsl(var(--gold-hi))" fillOpacity={0.5} animationDuration={1800} />
                  <Radar name="السوق" dataKey="market" stroke="hsl(var(--jade))" fill="hsl(var(--jade))" fillOpacity={0.3} animationDuration={1800} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Digital Laboratory */}
      <section className="py-28">
        <div className="container">
          <SectionTitle eyebrow="المختبر الرقمي" title="تحت العدسة — لحظات من داخل المعمل" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'مختبر حديث',
              'اختبار حرارة الفحم',
              'تحليل الكربون',
              'اختبار الرطوبة',
              'الفحص الصناعي',
              'مراقبة الجودة',
            ].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a2520] via-[#0f1814] to-black border border-gold/20"
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
      <section className="py-28 bg-gradient-to-b from-background via-surface-2/50 to-background">
        <div className="container">
          <SectionTitle eyebrow="فحص المنتج ثلاثي الأبعاد" title="اسحب لتدوير المكعب وفحص النقاط" />
          <InspectionCube />
        </div>
      </section>

      {/* Registered Trademarks Showcase */}
      <section className="py-28 bg-gradient-to-b from-background to-surface-2/30 border-y border-gold/10">
        <div className="container">
          <SectionTitle eyebrow="ملكية فكرية موثقة" title="علامات تجارية مسجلة رسمياً" />
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {trademarks.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group rounded-2xl glass-card p-4 hover:shadow-gold transition"
              >
                <div className="aspect-square bg-cream rounded-lg overflow-hidden mb-3">
                  <img src={t.image} alt={t.nameAr} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" loading="lazy" />
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
      <section className="py-28">
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
      <section className="py-28 bg-surface-2/40 border-y border-gold/10">
        <div className="container">
          <SectionTitle eyebrow="الشهادات والاعتمادات" title="جودة موثقة عالمياً" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((c, i) => (
              <motion.button
                key={c.code} onClick={() => setOpenCert(i)}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="glass-card text-start p-8 rounded-2xl hover:border-gold/60 hover:shadow-gold transition-all"
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
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#1a1410] to-black flex flex-col items-center justify-center text-background border border-gold/30">
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
      <section className="py-28">
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
      <section className="py-28 bg-foreground text-background relative overflow-hidden">
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
      <section className="py-28">
        <div className="container">
          <SectionTitle eyebrow="مركز التنزيل" title="ملفات الجودة والمواصفات" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((f, i) => (
              <motion.a
                key={f.t} href="#"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card group p-7 rounded-2xl hover:border-gold/60 hover:shadow-gold transition-all flex items-start gap-4"
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
