import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Face = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom';
const inspectionSpots: { face: Face; x: number; y: number; label: string; value: string; desc: string }[] = [
  { face: 'front',  x: 30, y: 35, label: 'نسبة الكربون',    value: '٨٥٪',   desc: 'كربون ثابت عالي يمنح احتراقاً نظيفاً وطويلاً.' },
  { face: 'front',  x: 70, y: 65, label: 'الكثافة',         value: '١٫١ غ/سم³', desc: 'بنية مضغوطة تضمن ثبات الجمرة وعدم التفتت.' },
  { face: 'right',  x: 50, y: 40, label: 'السطح',           value: 'مصقول', desc: 'سطح ناعم مغلق يقلل الرماد المتطاير.' },
  { face: 'top',    x: 55, y: 55, label: 'مقاومة الضغط',    value: '٤٢ MPa', desc: 'يتحمل الشحن والتكديس دون كسر.' },
  { face: 'back',   x: 45, y: 50, label: 'المقاومة الحرارية', value: '٧٥٠°م', desc: 'يحافظ على الحرارة القصوى طوال جلسة الشواء.' },
  { face: 'left',   x: 50, y: 50, label: 'الرماد',          value: '٣٪',    desc: 'رماد منخفض يعني نظافة أعلى وقيمة أكبر لكل كجم.' },
];
const FACE_TRANSFORMS: Record<Face, string> = {
  front: 'translateZ(120px)', back: 'rotateY(180deg) translateZ(120px)',
  right: 'rotateY(90deg) translateZ(120px)', left: 'rotateY(-90deg) translateZ(120px)',
  top: 'rotateX(90deg) translateZ(120px)', bottom: 'rotateX(-90deg) translateZ(120px)',
};
const FACE_LABEL: Record<Face, string> = {
  front: 'الأمام', back: 'الخلف', right: 'اليمين', left: 'اليسار', top: 'الأعلى', bottom: 'الأسفل',
};
const FACE_VIEW: Record<Face, { x: number; y: number }> = {
  front: { x: 0, y: 0 }, back: { x: 0, y: 180 },
  right: { x: 0, y: -90 }, left: { x: 0, y: 90 },
  top: { x: -90, y: 0 }, bottom: { x: 90, y: 0 },
};

export default function InspectionCube() {
  const [rot, setRot] = useState({ x: -18, y: 28, z: 0 });
  const [auto, setAuto] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; angle: number } | null>(null);

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
      pinch.current = { dist: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI) };
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
    setActive(i); setAuto(false);
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
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onMouseEnter={() => setAuto(false)}
          onMouseLeave={() => active === null && setAuto(true)}
        >
          <div style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
            width: 240, height: 240, position: 'relative',
            transition: pointers.current.size ? 'none' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {(Object.keys(FACE_TRANSFORMS) as Face[]).map((face) => (
              <div key={face} className="absolute inset-0 border-2 border-gold"
                style={{
                  transform: FACE_TRANSFORMS[face],
                  background: 'linear-gradient(135deg, hsl(var(--jade)) 0%, hsl(var(--dark)) 100%)',
                  boxShadow: 'inset 0 0 40px hsl(var(--gold-hi) / 0.35), 0 0 40px hsl(var(--gold) / 0.4)',
                }}>
                <div className="absolute inset-2 opacity-60"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, hsl(var(--gold-hi) / 0.55), transparent 55%), radial-gradient(circle at 70% 70%, hsl(var(--gold) / 0.35), transparent 55%)' }} />
                <span className="absolute top-1.5 left-2 text-[11px] font-mono uppercase tracking-widest text-gold-hi font-bold drop-shadow">{FACE_LABEL[face]}</span>
                {inspectionSpots.map((s, i) => s.face === face && (
                  <button key={i} onClick={(e) => { e.stopPropagation(); focusSpot(i); }}
                    onMouseEnter={() => setActive(i)}
                    aria-label={s.label}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                    <span className={`block rounded-full transition-all ${active === i ? 'w-5 h-5 bg-gold-hi scale-125' : 'w-4 h-4 bg-gold-hi'}`}
                      style={{ boxShadow: '0 0 18px hsl(var(--gold-hi)), 0 0 4px #fff inset' }} />
                    <span className={`absolute inset-0 rounded-full bg-gold-hi/60 ${active === i ? 'animate-ping' : ''}`} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

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
      </div>

      <ul className="space-y-3 font-arabic">
        {inspectionSpots.map((s, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
            onClick={() => focusSpot(i)}
            className={`group cursor-pointer p-5 rounded-2xl border backdrop-blur transition-all ${
              active === i ? 'bg-foreground text-background border-gold shadow-gold scale-[1.02]' : 'glass-card hover:border-gold/50'
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
                <p className={`text-sm leading-relaxed mt-1 ${active === i ? 'text-background/70' : 'text-foreground/60'}`}>{s.desc}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
