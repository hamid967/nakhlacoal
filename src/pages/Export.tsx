import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Ship, MapPin, Package, Box, FileText, CreditCard, Clock, Award, Send } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';
import { toast } from '@/hooks/use-toast';

const countries = [
  { flag: '🇸🇦', name: 'Saudi Arabia' }, { flag: '🇦🇪', name: 'UAE' },
  { flag: '🇰🇼', name: 'Kuwait' },       { flag: '🇶🇦', name: 'Qatar' },
  { flag: '🇧🇭', name: 'Bahrain' },      { flag: '🇴🇲', name: 'Oman' },
  { flag: '🇪🇬', name: 'Egypt' },        { flag: '🇯🇴', name: 'Jordan' },
  { flag: '🇩🇪', name: 'Germany' },      { flag: '🇬🇧', name: 'UK' },
  { flag: '🇫🇷', name: 'France' },       { flag: '🇪🇸', name: 'Spain' },
  { flag: '🇮🇹', name: 'Italy' },        { flag: '🇳🇱', name: 'Netherlands' },
  { flag: '🇯🇵', name: 'Japan' },        { flag: '🇰🇷', name: 'South Korea' },
  { flag: '🇸🇬', name: 'Singapore' },    { flag: '🇭🇰', name: 'Hong Kong' },
  { flag: '🇺🇸', name: 'USA' },          { flag: '🇨🇦', name: 'Canada' },
];

const tradeTerms = [
  { icon: Package,    label: 'MOQ',           value: '500 KG' },
  { icon: Clock,      label: 'Lead time',     value: '7–14 days' },
  { icon: Box,        label: 'Packaging',     value: 'Custom OEM ✓' },
  { icon: Award,      label: 'Certifications',value: 'ISO 9001 · SASO' },
  { icon: CreditCard, label: 'Payment',       value: 'T/T · L/C' },
  { icon: Ship,       label: 'Shipping',      value: 'FOB Jeddah' },
];

export default function ExportPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  const stats = [
    { icon: MapPin, label: t('exportPage.countries'), value: '32' },
    { icon: Ship,   label: t('exportPage.ports'),     value: '8' },
    { icon: Box,    label: t('exportPage.containers'),value: "20' / 40'" },
    { icon: Package,label: t('exportPage.packaging'), value: '12+' },
  ];

  const [form, setForm] = useState({ company: '', country: '', product: 'Hookah Charcoal', qty: '', email: '', notes: '' });
  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.country || !form.qty || !form.email) {
      toast({ title: isAr ? 'الرجاء تعبئة الحقول المطلوبة' : 'Please complete required fields', variant: 'destructive' });
      return;
    }
    const subject = encodeURIComponent(`B2B Inquiry — ${form.product} — ${form.company}`);
    const body = encodeURIComponent(
      `Company: ${form.company}\nCountry: ${form.country}\nProduct: ${form.product}\nQuantity (KG): ${form.qty}\nEmail: ${form.email}\n\nNotes:\n${form.notes}\n`,
    );
    const wa = encodeURIComponent(
      `Hello Palm Charcoal — B2B export inquiry:\n• Company: ${form.company}\n• Country: ${form.country}\n• Product: ${form.product}\n• Quantity: ${form.qty} KG\n• Email: ${form.email}\n• Notes: ${form.notes || '—'}`,
    );
    window.open(`mailto:mab355@gmail.com?subject=${subject}&body=${body}`, '_blank');
    setTimeout(() => window.open(`https://wa.me/966540060095?text=${wa}`, '_blank'), 250);
    toast({ title: isAr ? 'تم تجهيز الطلب — افتح البريد والواتساب لإرساله' : 'Inquiry ready — email & WhatsApp opened' });
  };

  return (
    <>
      <SEO
        title={isAr ? 'التصدير | فحم النخلة' : 'Export | Palm Charcoal'}
        description={isAr ? t('exportPage.subtitle') : 'Supplying premium Saudi charcoal worldwide — MOQ 500 KG, FOB Jeddah, ISO 9001 / SASO certified.'}
        path="/export"
      />
      <PageHero number={7}
        eyebrow={isAr ? t('exportPage.eyebrow') : 'Global Export'}
        title={isAr ? t('exportPage.title') : 'Supplying Premium Saudi Charcoal to 20+ Countries'}
        subtitle={isAr ? t('exportPage.subtitle') : 'Weekly shipments, full customs clearance, OEM packaging. We ship from Jeddah to the Gulf, Europe, Asia and beyond.'}
      />

      {/* Topline stats */}
      <section className="section-tight">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 80}>
              <div className="p-7 rounded-2xl bg-surface border-luxe text-center hover:border-luxe-strong transition-all duration-700">
                <s.icon className="w-7 h-7 text-gold-hi mx-auto mb-3" />
                <div className={`text-3xl text-gold-hi mb-1.5 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>{s.value}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Trade terms */}
      <section className="section-tight section-dark border-y border-gold/10">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="eyebrow mb-3">{isAr ? 'شروط التجارة الدولية' : 'Trade Terms'}</span>
              <h2 className={`text-3xl md:text-5xl mt-3 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                <span className="text-gold-metal">{isAr ? 'بيانات للمستورد' : 'B2B Importer Sheet'}</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {tradeTerms.map((tt, i) => (
              <ScrollReveal key={tt.label} delay={i * 60}>
                <div className="glass-card p-5 rounded-2xl text-center h-full">
                  <tt.icon className="w-5 h-5 text-gold-hi mx-auto mb-2.5" />
                  <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1">{tt.label}</div>
                  <div className="text-sm font-bold text-gold-hi">{tt.value}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="section bg-surface border-y border-gold/10">
        <div className="container">
          <ScrollReveal>
            <h2 className={`text-3xl md:text-5xl text-center mb-12 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
              {isAr ? 'الدول التي نُصدّر إليها' : 'Countries We Export To'}
            </h2>
          </ScrollReveal>
          <div className="flex flex-wrap gap-2.5 justify-center max-w-4xl mx-auto">
            {countries.map((c, i) => (
              <ScrollReveal key={c.name} delay={i * 20}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-luxe text-sm text-foreground/75 hover:border-luxe-strong hover:text-gold-hi transition-all duration-500">
                  <span className="text-base leading-none">{c.flag}</span> {c.name}
                </span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Inquiry form */}
      <section className="section">
        <div className="container max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="eyebrow mb-3">{isAr ? 'طلب عرض سعر دولي' : 'B2B Inquiry'}</span>
              <h2 className={`text-3xl md:text-5xl mt-3 ${isAr ? 'font-arabic font-bold' : 'font-display'}`}>
                <span className="text-gold-metal">{isAr ? 'احصل على عرض سعر تصدير' : 'Request an Export Quote'}</span>
              </h2>
              <p className="mt-4 text-sm text-foreground/65">
                {isAr ? 'يتم الرد خلال 24 ساعة عمل — بالعربية أو الإنجليزية.' : 'Response within 1 business day — Arabic or English.'}
              </p>
            </div>
          </ScrollReveal>

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 md:p-8 rounded-3xl bg-surface border-luxe">
            <Field label={isAr ? 'اسم الشركة *' : 'Company name *'}>
              <input required value={form.company} onChange={onChange('company')} className="lux-input" />
            </Field>
            <Field label={isAr ? 'الدولة *' : 'Country *'}>
              <input required value={form.country} onChange={onChange('country')} className="lux-input" />
            </Field>
            <Field label={isAr ? 'نوع المنتج *' : 'Product *'}>
              <select value={form.product} onChange={onChange('product')} className="lux-input">
                <option>Hookah Charcoal — Coconut</option>
                <option>Incense Charcoal — Quick-Light</option>
                <option>BBQ Charcoal</option>
                <option>Compressed Charcoal</option>
                <option>Custom / Mixed Container</option>
              </select>
            </Field>
            <Field label={isAr ? 'الكمية (كجم) *' : 'Quantity (KG) *'}>
              <input required type="number" min={500} value={form.qty} onChange={onChange('qty')} className="lux-input" />
            </Field>
            <Field label={isAr ? 'البريد الإلكتروني *' : 'Business email *'} className="md:col-span-2">
              <input required type="email" value={form.email} onChange={onChange('email')} className="lux-input" />
            </Field>
            <Field label={isAr ? 'ملاحظات' : 'Notes'} className="md:col-span-2">
              <textarea rows={4} value={form.notes} onChange={onChange('notes')} className="lux-input resize-none" />
            </Field>
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-foreground/50 inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> {isAr ? 'سيتم فتح البريد والواتساب جاهزَين بالطلب.' : 'Email & WhatsApp open pre-filled with your inquiry.'}
              </p>
              <button type="submit" className="btn-gold">
                <Send className="w-4 h-4" /> {isAr ? 'إرسال الطلب' : 'Send inquiry'}
              </button>
            </div>
          </form>

          <div className="text-center mt-10 space-y-3">
            <Link to="/export/guide" className="block text-xs uppercase tracking-[0.22em] text-gold-hi hover:text-gold transition">
              {isAr ? 'دليل التصدير الكامل (Incoterms · Packaging · HS) →' : 'Full Export Protocol (Incoterms · Packaging · HS) →'}
            </Link>
            <Link to="/contact" className="block text-xs uppercase tracking-[0.22em] text-foreground/55 hover:text-gold-hi transition">
              {isAr ? 'أو تواصل معنا مباشرة →' : 'Or contact us directly →'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-[0.18em] text-foreground/60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
