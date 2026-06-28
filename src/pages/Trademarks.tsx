import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, FileText, Shield, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { trademarks } from '@/data/trademarks';

export default function Trademarks() {
  const [active, setActive] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const current = active !== null ? trademarks[active] : null;

  const next = () => { if (active !== null) { setActive((active + 1) % trademarks.length); setZoom(1); } };
  const prev = () => { if (active !== null) { setActive((active - 1 + trademarks.length) % trademarks.length); setZoom(1); } };

  const indexItems = useMemo(() => trademarks.map((t, i) => ({ i, t })), []);

  return (
    <>
      <SEO
        title="العلامات التجارية المسجلة | فحم النخلة"
        description="سجل العلامات التجارية المسجلة لمؤسسة محمد عبدالله باعشن التجارية في المملكة العربية السعودية."
      />
      <PageHero
        eyebrowKey="quality.eyebrow"
        titleKey="quality.title"
        subtitleKey="quality.subtitle"
      />

      <section className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[260px,1fr] gap-10">
          {/* Index */}
          <aside className="lg:sticky lg:top-24 self-start">
            <h3 className="font-serif text-2xl text-emerald mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" /> الفهرس
            </h3>
            <ol className="space-y-2 text-sm">
              {indexItems.map(({ i, t }) => (
                <li key={t.id}>
                  <button
                    onClick={() => { setActive(i); setZoom(1); }}
                    className="w-full text-right px-3 py-2 rounded-lg border border-gold/20 hover:border-gold/60 hover:bg-gold/5 transition flex justify-between gap-2"
                  >
                    <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                    <span className="flex-1 text-foreground">{t.nameAr}</span>
                    <span className="text-xs text-gold tabular-nums">{t.registrationNo}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {trademarks.map((t, i) => (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl border border-gold/20 bg-white/60 backdrop-blur-md overflow-hidden hover:border-gold/60 hover:shadow-gold transition"
              >
                <button
                  onClick={() => { setActive(i); setZoom(1); }}
                  className="block w-full aspect-[4/3] bg-cream relative group"
                >
                  <img src={t.image} alt={t.nameAr} className="absolute inset-0 w-full h-full object-contain p-3" loading="lazy" />
                  <div className="absolute inset-0 bg-emerald/0 group-hover:bg-emerald/10 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-full bg-emerald text-cream text-xs flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5" /> تكبير
                    </span>
                  </div>
                </button>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-xl text-emerald">{t.nameAr}</h4>
                      <p className="text-xs text-muted-foreground">{t.nameEn}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-gold/15 text-gold whitespace-nowrap">
                      <Shield className="w-3 h-3" /> {t.niceClass}
                    </span>
                  </div>
                  <dl className="text-xs grid grid-cols-2 gap-y-1.5 gap-x-3">
                    <dt className="text-muted-foreground">رقم التسجيل</dt>
                    <dd className="font-mono text-gold">{t.registrationNo}</dd>
                    <dt className="text-muted-foreground">تاريخ الإيداع</dt>
                    <dd className="tabular-nums">{t.filedHijri}</dd>
                    <dt className="text-muted-foreground">انتهاء الحماية</dt>
                    <dd className="tabular-nums">{t.expiresHijri}</dd>
                  </dl>
                  <div className="flex gap-1.5 pt-1">
                    {t.colors.map((c) => (
                      <span key={c} title={c} className="w-5 h-5 rounded-full border border-black/10" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Zoom Dialog */}
      <Dialog open={active !== null} onOpenChange={(o) => { if (!o) { setActive(null); setZoom(1); } }}>
        <DialogContent className="max-w-5xl p-0 bg-rich-black border-gold/40 overflow-hidden">
          {current && (
            <div className="grid md:grid-cols-[1fr,300px]">
              {/* Viewer */}
              <div className="relative bg-cream min-h-[60vh] max-h-[80vh] overflow-auto flex items-center justify-center">
                <img
                  src={current.image}
                  alt={current.nameAr}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.25s' }}
                  className="max-w-full max-h-full object-contain select-none"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-2 rounded-full bg-rich-black/70 text-cream hover:bg-emerald"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={() => setZoom(1)} className="p-2 rounded-full bg-rich-black/70 text-cream hover:bg-emerald"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))} className="p-2 rounded-full bg-rich-black/70 text-cream hover:bg-emerald"><ZoomIn className="w-4 h-4" /></button>
                  <span className="px-3 py-1.5 rounded-full bg-rich-black/70 text-gold text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
                </div>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-rich-black/70 text-cream hover:bg-emerald"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-rich-black/70 text-cream hover:bg-emerald"><ChevronRight className="w-5 h-5" /></button>
              </div>
              {/* Meta */}
              <div className="p-6 bg-rich-black text-cream space-y-4 overflow-y-auto max-h-[80vh]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-gold">{current.nameAr}</h3>
                    <p className="text-xs text-cream/60">{current.nameEn}</p>
                  </div>
                  <button onClick={() => { setActive(null); setZoom(1); }} className="p-1.5 rounded-full hover:bg-cream/10"><X className="w-4 h-4" /></button>
                </div>
                <div className="text-xs space-y-2 border-y border-cream/10 py-3">
                  <Row k="رقم التسجيل" v={current.registrationNo} mono />
                  <Row k="الفئة" v={current.niceClass} />
                  <Row k="تاريخ الإيداع" v={current.filedHijri} />
                  <Row k="تاريخ التسجيل" v={current.registeredHijri} />
                  <Row k="انتهاء الحماية" v={current.expiresHijri} />
                  <Row k="المالك" v={current.ownerAr} />
                  <Row k="العنوان" v={current.addressAr} />
                  <Row k="الدولة" v={current.countryAr} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gold/80 mb-1">السلع والخدمات</p>
                  <p className="text-xs leading-relaxed">{current.goodsAr}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gold/80 mb-1">الوصف</p>
                  <p className="text-xs leading-relaxed">{current.descriptionAr}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  {current.colors.map((c) => (
                    <span key={c} className="w-6 h-6 rounded-full border border-cream/20" style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-cream/50">{k}</span>
      <span className={mono ? 'font-mono text-gold' : 'text-cream'}>{v}</span>
    </div>
  );
}
