import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, ShieldCheck, Globe } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

function Dial({ label, value, suffix, max = 100, delay = 0 }: { label: string; value: number; suffix: string; max?: number; delay?: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setProgress(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  const pct = (progress / max) * 100;
  const circ = 2 * Math.PI * 56;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="56" stroke="hsl(var(--gold) / 0.12)" strokeWidth="2" fill="none" />
          <circle
            cx="80"
            cy="80"
            r="56"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }}
          />
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(44 80% 62%)" />
              <stop offset="100%" stopColor="hsl(44 60% 32%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display text-gold-hi">
            {progress}
            <span className="text-base text-foreground/50 ms-0.5">{suffix}</span>
          </span>
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-foreground/60">{label}</p>
    </div>
  );
}

export default function Quality() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const certs = [
    { icon: Award, name: t('quality.iso'), code: 'CERT-ISO-9001-2015' },
    { icon: ShieldCheck, name: t('quality.saso'), code: 'SASO-SA-2026-001' },
    { icon: Globe, name: t('quality.export'), code: 'EU-GCC-EXP-2026' },
  ];

  return (
    <>
      <SEO
        title={isAr ? 'الجودة — فحم النخلة' : 'Quality — Palm Charcoal'}
        description={t('quality.subtitle')}
        path="/quality"
      />
      <PageHero eyebrow={t('quality.eyebrow')} title={t('quality.title')} subtitle={t('quality.subtitle')} />

      <section className="py-32">
        <div className="container">
          <ScrollReveal>
            <div className="rounded-3xl border-luxe glass-luxe p-12 md:p-16">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
                <Dial label={t('quality.carbon')} value={85} suffix="%" delay={100} />
                <Dial label={t('quality.ash')} value={3} suffix="%" max={10} delay={200} />
                <Dial label={t('quality.moisture')} value={6} suffix="%" max={20} delay={300} />
                <Dial label={t('quality.burn')} value={185} suffix="m" max={240} delay={400} />
                <Dial label={t('quality.heat')} value={75} suffix="" max={100} delay={500} />
                <Dial label={t('quality.volatile')} value={6} suffix="%" max={15} delay={600} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-32 bg-surface border-y border-gold/10">
        <div className="container">
          <ScrollReveal>
            <h2 className={`text-4xl md:text-5xl mb-16 text-center ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
              {t('quality.certs')}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certs.map((c, i) => (
              <ScrollReveal key={c.code} delay={i * 100}>
                <div className="p-10 rounded-2xl bg-background border-luxe text-center hover:border-luxe-strong transition-all duration-700">
                  <c.icon className="w-10 h-10 text-gold-hi mx-auto mb-6" />
                  <h3 className={`text-xl mb-2 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{c.name}</h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-foreground/40 font-mono">{c.code}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
