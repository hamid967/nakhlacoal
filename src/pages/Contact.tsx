import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { PageHero } from '@/components/PageHero';
import { ScrollReveal } from '@/components/ScrollReveal';

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(2000),
});

export default function Contact() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isAr = i18n.language?.startsWith('ar');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', country: '', message: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast({ title: 'Please complete required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast({ title: t('contact.sent'), description: t('contact.sentDesc') });
      setForm({ name: '', email: '', phone: '', company: '', country: '', message: '' });
      setSubmitting(false);
    }, 800);
  };

  return (
    <>
      <SEO
        title={isAr ? 'تواصل معنا — فحم النخلة' : 'Contact — Palm Charcoal'}
        description={t('contact.subtitle')}
        path="/contact"
      />
      <PageHero number={15} eyebrow={t("contact.eyebrow")} title={t("contact.title")} subtitle={t("contact.subtitle")} />

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info column */}
          <div className="lg:col-span-4 space-y-8">
            <ScrollReveal>
              <InfoBlock icon={MapPin} label={t('contact.addressLabel')} value={t('contact.address')} />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <InfoBlock icon={Phone} label={t('contact.phoneLabel')} value={t('contact.phoneValue')} />
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <InfoBlock icon={Mail} label={t('contact.emailLabel')} value={t('contact.emailValue')} />
            </ScrollReveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <ScrollReveal delay={100}>
              <form
                onSubmit={onSubmit}
                className="rounded-3xl border-luxe glass-luxe p-8 md:p-12 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field id="name" label={t('contact.name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <Field id="email" type="email" label={t('contact.email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <Field id="phone" label={t('contact.phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field id="company" label={t('contact.company')} value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                  <div className="md:col-span-2">
                    <Field id="country" label={t('contact.country')} value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-[0.2em] text-foreground/50 mb-2">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    maxLength={2000}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t('contact.messagePlaceholder')}
                    className="w-full bg-surface-3 border-luxe rounded-2xl px-5 py-4 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-gold/50 resize-none"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-gold w-full md:w-auto !px-10">
                  <Send className="w-4 h-4" />
                  {submitting ? '…' : t('contact.send')}
                </button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-surface border-luxe">
      <div className="flex items-center gap-4">
        <span className="w-11 h-11 rounded-full border-luxe-strong flex items-center justify-center bg-gold/5">
          <Icon className="w-4 h-4 text-gold-hi" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/40 mb-1">{label}</p>
          <p className="text-sm text-foreground/85">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  id, label, value, onChange, type = 'text', required,
}: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.2em] text-foreground/50 mb-2">{label}</label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        maxLength={255}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-3 border-luxe rounded-full px-5 py-3 text-sm placeholder:text-foreground/40 focus:outline-none focus:border-gold/50"
      />
    </div>
  );
}
