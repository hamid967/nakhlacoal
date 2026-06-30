import { Link } from 'react-router-dom';
import {
  Ship, Package, FileText, Globe2, Anchor, Container, ShieldCheck,
  CreditCard, AlertTriangle, ScrollText, Box, Truck,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

/**
 * English-first export protocol page targeting international importers.
 * Covers Incoterms, packaging, container loads, HS codes, certificates and docs.
 * Route: /export/guide
 */
export default function ExportGuide() {
  const incoterms = [
    {
      icon: Anchor,
      code: 'FOB Jeddah',
      title: 'Free On Board — Jeddah Islamic Port',
      detail:
        'We deliver the goods on board the vessel at Jeddah Islamic Port. Risk transfers to you once cargo crosses the ship\'s rail. You handle ocean freight, insurance, destination customs and last-mile.',
      bestFor: 'Importers with their own forwarder or favorable freight rates.',
    },
    {
      icon: Ship,
      code: 'CIF (destination port)',
      title: 'Cost, Insurance & Freight',
      detail:
        'We cover product cost + main carriage to your nominated destination port + minimum cargo insurance. You take over at the destination port for customs clearance and inland transport.',
      bestFor: 'First-time importers who want a single landed quote to destination port.',
    },
    {
      icon: Package,
      code: 'EXW Jeddah Factory',
      title: 'Ex-Works — Our Factory Gate',
      detail:
        'Cheapest line-item price. You collect from our Jeddah warehouse and handle export clearance, all freight, and import. Suitable for buyers with Saudi consolidators.',
      bestFor: 'Consolidators with Saudi presence shipping LCL groupage.',
    },
    {
      icon: Globe2,
      code: 'CFR / DAP / DDP',
      title: 'Other terms on request',
      detail:
        'We can quote CFR (cost + freight, no insurance), DAP (delivered at place), or DDP (delivered duty paid) for select destinations. DDP requires your local importer-of-record.',
      bestFor: 'Established trade lanes (UAE, Kuwait, Qatar, Germany, UK).',
    },
  ];

  const packaging = [
    { name: '1 kg inner box', detail: '72 cubes × 25 mm — printed kraft, polybag liner' },
    { name: '10 kg master carton', detail: '10 × 1 kg boxes — 5-ply corrugated, double-strap' },
    { name: '20 kg master carton', detail: '2 × 10 kg or 20 × 1 kg — export-grade, ISTA-3A tested' },
    { name: 'Pallet (1.2 × 1.0 m)', detail: 'ISPM-15 heat-treated wood, shrink-wrapped, corner-protected' },
    { name: 'OEM / Private label', detail: 'Your design, barcodes, local-language print — MOQ 1,000 kg' },
    { name: 'Inner protection', detail: 'Foam corners + desiccant sachet on humid-climate routes' },
  ];

  const containers = [
    { type: "20' Standard", payload: '18–20 t net', cartons: '~2,000 × 10 kg', notes: 'Pallets optional; floor-stacked maximizes volume.' },
    { type: "40' High Cube", payload: '24–26 t net', cartons: '~2,600 × 10 kg', notes: 'Recommended for full OEM runs and multi-SKU orders.' },
    { type: 'LCL (groupage)', payload: '500–5,000 kg', cartons: 'Per CBM', notes: 'Available via partner consolidators in Jeddah.' },
  ];

  const docs = [
    'Commercial Invoice (in importer\'s name, full HS + Incoterm)',
    'Packing List (carton count, gross & net weight, cube)',
    'Bill of Lading (sea) or Air Waybill (air)',
    'Certificate of Origin — Saudi Chamber of Commerce attested',
    'SASO / SABER conformity (Gulf), CE (EU), FDA notice (US) as applicable',
    'Third-party Lab Certificate per export lot (moisture, ash, calorific value, heavy metals)',
    'Fumigation Certificate (when destination requires ISPM-15 wood)',
    'Insurance Certificate (CIF / CIP shipments)',
  ];

  const hsCodes = [
    { code: '4402.90.00', label: 'Wood / coconut shell charcoal — no accelerant' },
    { code: '3602.00.00', label: 'Quick-light charcoal with chemical accelerant' },
    { code: '4402.10.00', label: 'Bamboo-based charcoal (specific markets)' },
  ];

  const payment = [
    { label: '30% TT advance + 70% against B/L copy', best: 'Standard for first 1–2 orders' },
    { label: 'Irrevocable L/C at sight via Tier-1 bank', best: 'Containers ≥ $25,000' },
    { label: 'NET-30 against invoice', best: 'After 3 successful shipments + trade reference' },
  ];

  return (
    <>
      <SEO
        title="Export Protocol — FOB Jeddah, CIF, Packaging & HS Codes | Palm Charcoal"
        description="Complete export protocol for international importers: Incoterms (FOB/CIF/EXW), packaging, container loads, HS codes, certificates, and payment terms. Premium Saudi charcoal shipped worldwide."
        path="/export/guide"
      />

      <PageHero
        number={8}
        eyebrow="Export Protocol"
        title="Importer Handbook — From Jeddah to Your Port"
        subtitle="Everything an international buyer needs: Incoterms, packaging, container loads, HS codes, certifications and documents. Built for B2B procurement teams."
      />

      {/* Incoterms */}
      <section className="py-20">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="eyebrow mb-3">Incoterms 2020</span>
              <h2 className="mt-3 font-display">
                <span className="text-gold-metal">Trade Terms We Quote</span>
              </h2>
              <p className="mt-4 text-sm text-foreground/65 max-w-2xl mx-auto">
                Pick the term that matches your import experience and freight relationships.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-5">
            {incoterms.map((it, i) => (
              <ScrollReveal key={it.code} delay={i * 80}>
                <article className="p-7 rounded-2xl bg-surface border-luxe h-full hover:border-luxe-strong transition-all duration-700">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                      <it.icon className="w-5 h-5 text-gold-hi" />
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-foreground/55 mb-1">{it.code}</div>
                      <h3 className="font-display text-xl text-gold-hi">{it.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/75 leading-relaxed mb-3">{it.detail}</p>
                  <p className="text-xs text-foreground/55"><span className="text-gold-hi/80">Best for:</span> {it.bestFor}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Packaging */}
      <section className="py-20 section-dark border-y border-gold/10">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="eyebrow mb-3">Packaging</span>
              <h2 className="mt-3 font-display">
                <span className="text-gold-metal">From Inner Box to Pallet</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {packaging.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 60}>
                <div className="glass-card p-6 rounded-2xl h-full">
                  <Box className="w-5 h-5 text-gold-hi mb-3" />
                  <h3 className="font-display text-lg text-gold-hi mb-1.5">{p.name}</h3>
                  <p className="text-sm text-foreground/70">{p.detail}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Container loads */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="eyebrow mb-3">Container Loads</span>
              <h2 className="mt-3 font-display">
                <span className="text-gold-metal">Ocean Freight Capacity</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="overflow-hidden rounded-2xl border-luxe">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-foreground/75 text-left">
                <tr>
                  <th className="px-5 py-4 font-display text-gold-hi">Container</th>
                  <th className="px-5 py-4 font-display text-gold-hi">Net payload</th>
                  <th className="px-5 py-4 font-display text-gold-hi">Cartons (10 kg)</th>
                  <th className="px-5 py-4 font-display text-gold-hi">Notes</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c) => (
                  <tr key={c.type} className="border-t border-gold/10 hover:bg-surface-2/40 transition">
                    <td className="px-5 py-4 inline-flex items-center gap-2 text-foreground"><Container className="w-4 h-4 text-gold-hi" /> {c.type}</td>
                    <td className="px-5 py-4 text-foreground/80">{c.payload}</td>
                    <td className="px-5 py-4 text-foreground/80">{c.cartons}</td>
                    <td className="px-5 py-4 text-foreground/65">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HS codes */}
      <section className="py-20 section-dark border-y border-gold/10">
        <div className="container max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="eyebrow mb-3">Customs Codes</span>
              <h2 className="mt-3 font-display">
                <span className="text-gold-metal">HS Tariff Reference</span>
              </h2>
              <p className="mt-4 text-sm text-foreground/65">
                Confirm with your customs broker — duty rates vary by destination.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {hsCodes.map((h, i) => (
              <ScrollReveal key={h.code} delay={i * 80}>
                <div className="p-6 rounded-2xl bg-surface border-luxe text-center h-full">
                  <ScrollText className="w-5 h-5 text-gold-hi mx-auto mb-3" />
                  <div className="font-display text-2xl text-gold-hi mb-2">{h.code}</div>
                  <p className="text-xs text-foreground/70 leading-relaxed">{h.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="eyebrow mb-3">Documentation</span>
              <h2 className="mt-3 font-display">
                <span className="text-gold-metal">Shipping Documents We Issue</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-3">
            {docs.map((d, i) => (
              <ScrollReveal key={d} delay={i * 40}>
                <div className="flex items-start gap-3 p-5 rounded-xl bg-surface border-luxe">
                  <FileText className="w-4 h-4 text-gold-hi shrink-0 mt-1" />
                  <p className="text-sm text-foreground/80 leading-relaxed">{d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Payment */}
      <section className="py-20 section-dark border-y border-gold/10">
        <div className="container max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="eyebrow mb-3">Payment Terms</span>
              <h2 className="mt-3 font-display">
                <span className="text-gold-metal">How We Get Paid</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4">
            {payment.map((p, i) => (
              <ScrollReveal key={p.label} delay={i * 80}>
                <div className="glass-card p-6 rounded-2xl h-full">
                  <CreditCard className="w-5 h-5 text-gold-hi mb-3" />
                  <p className="text-sm text-foreground/85 mb-3 leading-relaxed">{p.label}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/55">{p.best}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quality + lead time strip */}
      <section className="py-16">
        <div className="container max-w-5xl grid md:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, t: 'Quality guarantee', d: 'Third-party lab certificate per export lot. 7-day right of rejection on arrival.' },
            { icon: Truck,       t: 'Lead time',         d: '7–14 days from confirmed PO for stock SKUs. 21 days for full OEM runs.' },
            { icon: AlertTriangle, t: 'Compliance',      d: 'REACH (EU), FDA (US food-contact class), JAS (Japan), SASO (Gulf).' },
          ].map((b, i) => (
            <ScrollReveal key={b.t} delay={i * 80}>
              <div className="p-6 rounded-2xl bg-surface border-luxe h-full">
                <b.icon className="w-5 h-5 text-gold-hi mb-3" />
                <h3 className="font-display text-lg text-gold-hi mb-1.5">{b.t}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{b.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              <span className="text-gold-metal">Ready to request a quote?</span>
            </h2>
            <p className="text-foreground/70 mb-8">
              Send us your destination port, target volume, and preferred Incoterm. We respond within one business day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/export" className="btn-gold">Request export quote</Link>
              <Link to="/quality" className="btn-ghost">View QC protocol</Link>
              <Link to="/catalog" className="btn-ghost">Download catalog</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
