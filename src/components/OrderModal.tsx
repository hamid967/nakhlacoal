import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { products } from '@/data/products';
import { MessageCircle, ArrowRight, ArrowLeft, Check, User, Building2, Store, Globe2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WHATSAPP_NUMBER = '966540060095';

type CustomerType = 'individual' | 'restaurant' | 'distributor' | 'exporter';
type LineItem = { slug: string; qty: number };

const customerTypes: { id: CustomerType; ar: string; en: string; icon: typeof User }[] = [
  { id: 'individual', ar: 'عميل فردي', en: 'Individual', icon: User },
  { id: 'restaurant', ar: 'مطعم / مقهى', en: 'Restaurant / Café', icon: Store },
  { id: 'distributor', ar: 'موزّع جملة', en: 'Distributor', icon: Building2 },
  { id: 'exporter', ar: 'مستورد دولي', en: 'International importer', icon: Globe2 },
];

const contactSchema = z.object({
  name: z.string().trim().min(2).max(60).regex(/^[\p{L}\s'-]+$/u),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,16}$/),
  city: z.string().trim().min(2).max(60),
  notes: z.string().trim().max(500).optional(),
});

export function OrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerType>('individual');
  const [items, setItems] = useState<LineItem[]>([{ slug: products[0]?.slug ?? '', qty: 10 }]);
  const [contact, setContact] = useState({ name: '', phone: '', city: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep(1); setCustomer('individual');
    setItems([{ slug: products[0]?.slug ?? '', qty: 10 }]);
    setContact({ name: '', phone: '', city: '', notes: '' });
    setErrors({});
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) setTimeout(reset, 300);
    onOpenChange(v);
  };

  const addItem = () => setItems([...items, { slug: products[0]?.slug ?? '', qty: 5 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<LineItem>) => {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const totalKg = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);

  const canNext1 = !!customer;
  const canNext2 = items.length > 0 && items.every((it) => it.slug && it.qty > 0);

  const validateContact = () => {
    const r = contactSchema.safeParse(contact);
    if (!r.success) {
      const e: Record<string, boolean> = {};
      r.error.issues.forEach((i) => { e[i.path[0] as string] = true; });
      setErrors(e);
      return false;
    }
    setErrors({});
    return true;
  };

  const buildSummary = () => {
    const lines = items
      .map((it, idx) => {
        const p = products.find((x) => x.slug === it.slug);
        return `${idx + 1}. ${isAr ? p?.nameAr : p?.nameEn} — ${it.qty} ${isAr ? 'كجم' : 'kg'}`;
      })
      .join('\n');
    const cust = customerTypes.find((c) => c.id === customer);
    return isAr
      ? `🌴 *طلب جديد — فحم النخلة*\n\n👤 نوع العميل: ${cust?.ar}\n\n📦 المنتجات:\n${lines}\n\n📊 الإجمالي: ${totalKg} كجم\n\n☎️ بيانات التواصل:\n• الاسم: ${contact.name}\n• الجوال: ${contact.phone}\n• المدينة: ${contact.city}\n${contact.notes ? `\n📝 ملاحظات: ${contact.notes}` : ''}`
      : `🌴 *New Order — Palm Charcoal*\n\n👤 Customer: ${cust?.en}\n\n📦 Items:\n${lines}\n\n📊 Total: ${totalKg} kg\n\n☎️ Contact:\n• Name: ${contact.name}\n• Phone: ${contact.phone}\n• City: ${contact.city}\n${contact.notes ? `\nNotes: ${contact.notes}` : ''}`;
  };

  const submit = () => {
    if (!validateContact()) return;
    setSubmitting(true);
    const summary = buildSummary();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;

    // 1) Open WhatsApp SYNCHRONOUSLY inside the click gesture (avoids popup blockers).
    const win = window.open(url, '_blank');
    // Fallback for blockers / in-app browsers: same-tab navigation.
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }

    // 2) Fire-and-forget backend save — never blocks the user.
    supabase.functions
      .invoke('submit-order', {
        body: {
          customer_type: customer,
          items,
          total_kg: totalKg,
          name: contact.name,
          phone: contact.phone,
          city: contact.city,
          notes: contact.notes || null,
          source: 'wizard',
        },
      })
      .catch((e) => console.warn('submit-order failed (non-blocking):', e));

    setSubmitting(false);
    handleOpenChange(false);
  };

  const inputCls = (err?: boolean) =>
    `w-full px-3 py-2 rounded-lg border bg-background text-sm ${err ? 'border-destructive' : 'border-input'}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl glass-card !border-gold/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{isAr ? 'اطلب الآن' : 'Place an Order'}</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition ${
                step === s ? 'bg-[hsl(var(--gold))] text-white' : step > s ? 'bg-emerald text-white' : 'bg-muted text-muted-foreground'
              }`}>{step > s ? <Check className="w-3.5 h-3.5" /> : s}</div>
              {s < 4 && <div className={`flex-1 h-px ${step > s ? 'bg-emerald' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — customer type */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{isAr ? 'اختر نوع العميل لتخصيص العرض:' : 'Pick customer type so we tailor the offer:'}</p>
            <div className="grid grid-cols-2 gap-3">
              {customerTypes.map((c) => {
                const Icon = c.icon;
                const active = customer === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCustomer(c.id)}
                    className={`p-4 rounded-xl border text-start transition ${
                      active ? 'border-[hsl(var(--gold))] bg-[hsl(var(--gold))]/10' : 'border-input hover:border-gold/40'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[hsl(var(--gold))] mb-2" />
                    <div className="font-medium text-sm">{isAr ? c.ar : c.en}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — products & quantities */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{isAr ? 'أضف المنتجات والكميات (كجم):' : 'Add products and quantities (kg):'}</p>
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground mb-1">{isAr ? 'المنتج' : 'Product'}</label>
                  <select value={it.slug} onChange={(e) => updateItem(idx, { slug: e.target.value })} className={inputCls()}>
                    {products.map((p) => <option key={p.slug} value={p.slug}>{isAr ? p.nameAr : p.nameEn}</option>)}
                  </select>
                </div>
                <div className="w-28">
                  <label className="block text-xs text-muted-foreground mb-1">{isAr ? 'كجم' : 'kg'}</label>
                  <input type="number" min={1} max={100000} value={it.qty} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })} className={inputCls()} />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="px-2 h-9 text-xs text-destructive hover:underline">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-xs text-[hsl(var(--gold))] hover:underline">
              + {isAr ? 'إضافة منتج آخر' : 'Add another product'}
            </button>
            <div className="text-end text-sm font-medium text-emerald pt-2 border-t border-gold/10">
              {isAr ? 'الإجمالي:' : 'Total:'} {totalKg} {isAr ? 'كجم' : 'kg'}
            </div>
          </div>
        )}

        {/* Step 3 — contact */}
        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block mb-1 text-muted-foreground">{isAr ? 'الاسم الكامل' : 'Full name'}</label>
              <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} maxLength={60} className={inputCls(errors.name)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-muted-foreground">{isAr ? 'الجوال' : 'Phone'}</label>
                <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+9665XXXXXXXX" maxLength={16} className={inputCls(errors.phone)} />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">{isAr ? 'المدينة' : 'City'}</label>
                <input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} maxLength={60} className={inputCls(errors.city)} />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-muted-foreground">{isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</label>
              <textarea value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} rows={3} maxLength={500} className={inputCls()} />
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-xs text-destructive">{isAr ? 'يرجى تعبئة الحقول المطلوبة بشكل صحيح.' : 'Please fill required fields correctly.'}</p>
            )}
          </div>
        )}

        {/* Step 4 — confirm */}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-gold/20 bg-[hsl(var(--gold))]/5 p-4 whitespace-pre-line text-[13px] leading-relaxed">
              {buildSummary()}
            </div>
            <p className="text-xs text-muted-foreground">{isAr ? 'سيتم فتح واتساب لإرسال الطلب مباشرة لفريقنا.' : 'WhatsApp will open to send the order directly to our team.'}</p>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gold/10">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="text-sm text-muted-foreground disabled:opacity-30 hover:text-foreground inline-flex items-center gap-1"
          >
            {isAr ? <>السابق <ArrowLeft className="w-3.5 h-3.5" /></> : <><ArrowLeft className="w-3.5 h-3.5" /> Back</>}
          </button>
          {step < 4 ? (
            <button
              type="button"
              disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
              onClick={() => {
                if (step === 3 && !validateContact()) return;
                setStep(step + 1);
              }}
              className="btn-gold !px-5 !py-2 text-sm inline-flex items-center gap-2 disabled:opacity-40"
            >
              {isAr ? <>التالي <ArrowRight className="w-4 h-4" /></> : <>Next <ArrowRight className="w-4 h-4" /></>}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="py-2.5 px-5 rounded-full bg-[#25D366] text-white font-medium inline-flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              {submitting ? (isAr ? 'جارٍ الإرسال…' : 'Sending…') : (isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp')}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
