import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SeoHead } from '@/components/SeoHead';
import { toast } from 'sonner';

const Schema = z.object({
  contact_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal('')),
  company_name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(300),
  notes: z.string().trim().max(500).optional(),
  payment_method: z.enum(['moyasar', 'bank_transfer', 'cash_on_delivery']),
});

export default function Checkout() {
  const { items, subtotal, vat, total, clear } = useCart();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [form, setForm] = useState({
    contact_name: '', phone: '', email: user?.email ?? '',
    company_name: '', city: '', address: '', notes: '',
    payment_method: 'moyasar' as 'moyasar' | 'bank_transfer' | 'cash_on_delivery',
  });


  const fmt = (n: number) => new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', { maximumFractionDigits: 2 }).format(n);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <SeoHead title={isAr ? 'إتمام الطلب' : 'Checkout'} description={isAr ? 'أكمل شراء منتجات فحم النخلة بأمان — إدخال بيانات الشحن، اختيار طريقة الدفع، وإصدار الفاتورة الضريبية إلكترونيًا.' : 'Securely complete your Palm Charcoal purchase — enter shipping details, choose a payment method, and receive an e-invoice instantly.'} noindex />
        <div className="text-center">
          <h1 className="text-2xl font-display mb-2">{isAr ? 'سلتك فارغة' : 'Your cart is empty'}</h1>
          <button onClick={() => navigate('/products')} className="mt-4 px-6 py-3 rounded-xl bg-[hsl(var(--gold-hi))] text-[hsl(var(--ink))] font-bold">
            {isAr ? 'تصفح المنتجات' : 'Browse products'}
          </button>
        </div>
      </div>
    );
  }

  async function submit() {
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      toast.error(isAr ? 'تحقق من البيانات المدخلة' : 'Please check the form');
      return;
    }
    if (!legalAccepted) {
      toast.error(isAr ? 'يجب الموافقة على الشروط وسياسة الخصوصية' : 'Please accept the terms & privacy policy');
      return;
    }
    setLoading(true);
    try {
      const first = items[0];
      const totalQty = items.reduce((s, i) => s + i.qty, 0);
      const unitPrice = subtotal / Math.max(totalQty, 1);

      // Server-side price snapshot (authoritative record for audit).
      const pricingSnapshot = {
        currency: 'SAR',
        vat_rate: 0.15,
        subtotal: Math.round(subtotal * 100) / 100,
        vat: Math.round(vat * 100) / 100,
        total: Math.round(total * 100) / 100,
        items: items.map((i) => ({ slug: i.slug, qty: i.qty, unit: i.unit })),
        computed_at: new Date().toISOString(),
        source: 'client_cart_v1',
      };

      const insertRes = await supabase.from('orders').insert({
        user_id: user?.id ?? null,
        status: 'new',
        product_type: items.length === 1 ? first.slug : 'mixed',
        quantity: totalQty,
        unit: first.unit,
        unit_price_sar: unitPrice,
        contact_name: form.contact_name,
        phone: form.phone,
        email: form.email || null,
        company_name: form.company_name,
        city: form.city,
        address: form.address,
        notes: form.notes || null,
        payment_method: form.payment_method,
        country: 'SA',
        items: items.map((i) => ({ slug: i.slug, nameAr: i.nameAr, nameEn: i.nameEn, qty: i.qty, unit: i.unit })),
        pricing_snapshot: pricingSnapshot,
        legal_accepted_at: new Date().toISOString(),
      } as never);
      if (insertRes.error) throw insertRes.error;

      let newId: string | null = null;
      if (user?.id) {
        const { data: latest } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        newId = (latest as { id: string } | null)?.id ?? null;
      }

      // Online payment → redirect to Moyasar hosted invoice
      if (form.payment_method === 'moyasar' && newId) {
        const { data: session, error: sessErr } = await supabase.functions.invoke(
          'payments-create-session',
          { body: { order_id: newId } },
        );
        if (sessErr || !session?.redirect_url) {
          throw new Error(sessErr?.message || 'payment_session_failed');
        }
        clear();
        window.location.href = session.redirect_url as string;
        return;
      }

      clear();
      toast.success(isAr ? 'تم إنشاء الطلب بنجاح' : 'Order created');
      navigate(newId ? `/checkout/success?order=${newId}` : '/checkout/success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed';
      toast.error(msg);
      navigate(`/checkout/failed?reason=${encodeURIComponent('server_error')}`);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="container max-w-5xl py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <SeoHead title={isAr ? 'إتمام الطلب | فحم النخلة' : 'Checkout | Palm Charcoal'} description={isAr ? 'مراجعة السلة وإدخال بيانات الشحن وإتمام الدفع لطلبات فحم النخلة.' : 'Review your cart, enter shipping details and complete payment for Palm Charcoal orders.'} noindex />
      <h1 className="text-3xl font-display mb-6">{isAr ? 'إتمام الطلب' : 'Checkout'}</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-[hsl(var(--gold-hi))]' : 'bg-[hsl(var(--muted))]'}`} />
        ))}
      </div>

      {step === 3 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="w-16 h-16 text-[hsl(var(--gold-hi))] mx-auto mb-4" />
          <h2 className="text-2xl font-display mb-2">{isAr ? 'تم استلام طلبك!' : 'Order received!'}</h2>
          <p className="text-[hsl(var(--muted-foreground))]">{isAr ? 'سنتواصل معك خلال ساعات لتأكيد الطلب.' : 'We will contact you within hours to confirm.'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr,360px] gap-6">
          <div className="space-y-4 p-6 rounded-2xl border border-[hsl(var(--gold-hi)/0.2)] bg-[hsl(var(--card))]">
            {step === 1 && (
              <>
                <h2 className="font-display text-xl mb-2">{isAr ? 'بيانات التواصل' : 'Contact details'}</h2>
                <Field label={isAr ? 'الاسم الكامل' : 'Full name'} value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} required />
                <Field label={isAr ? 'رقم الجوال' : 'Phone'} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <Field label={isAr ? 'البريد الإلكتروني' : 'Email'} value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                <Field label={isAr ? 'اسم المنشأة' : 'Company'} value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} required />
                <button onClick={() => setStep(2)} className="w-full mt-4 py-3 rounded-xl bg-[hsl(var(--gold-hi))] text-[hsl(var(--ink))] font-bold">
                  {isAr ? 'التالي: الشحن' : 'Next: Shipping'}
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="font-display text-xl mb-2">{isAr ? 'الشحن والدفع' : 'Shipping & payment'}</h2>
                <Field label={isAr ? 'المدينة' : 'City'} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <Field label={isAr ? 'العنوان التفصيلي' : 'Address'} value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
                <label className="block">
                  <span className="text-sm mb-1 block">{isAr ? 'طريقة الدفع' : 'Payment method'}</span>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value as 'moyasar' | 'bank_transfer' | 'cash_on_delivery' })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
                  >
                    <option value="moyasar">{isAr ? 'دفع إلكتروني (مدى / Apple Pay / STC Pay / بطاقة)' : 'Pay online (Mada / Apple Pay / STC Pay / Card)'}</option>
                    <option value="bank_transfer">{isAr ? 'تحويل بنكي' : 'Bank transfer'}</option>
                    <option value="cash_on_delivery">{isAr ? 'الدفع عند الاستلام' : 'Cash on delivery'}</option>
                  </select>
                </label>
                <Field label={isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} textarea />

                <label className="flex items-start gap-3 mt-4 p-3 rounded-lg border border-[hsl(var(--gold-hi)/0.25)] bg-[hsl(var(--muted)/0.3)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalAccepted}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--gold-hi))]"
                    required
                  />
                  <span className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {isAr ? (
                      <>أوافق على <Link to="/terms" target="_blank" className="text-[hsl(var(--gold-hi))] underline">الشروط والأحكام</Link>، و<Link to="/privacy" target="_blank" className="text-[hsl(var(--gold-hi))] underline">سياسة الخصوصية</Link>، و<Link to="/refund-policy" target="_blank" className="text-[hsl(var(--gold-hi))] underline">سياسة الاسترجاع</Link>، و<Link to="/shipping-policy" target="_blank" className="text-[hsl(var(--gold-hi))] underline">سياسة الشحن</Link>.</>
                    ) : (
                      <>I accept the <Link to="/terms" target="_blank" className="text-[hsl(var(--gold-hi))] underline">Terms</Link>, <Link to="/privacy" target="_blank" className="text-[hsl(var(--gold-hi))] underline">Privacy Policy</Link>, <Link to="/refund-policy" target="_blank" className="text-[hsl(var(--gold-hi))] underline">Refund Policy</Link>, and <Link to="/shipping-policy" target="_blank" className="text-[hsl(var(--gold-hi))] underline">Shipping Policy</Link>.</>
                    )}
                  </span>
                </label>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))]">{isAr ? 'السابق' : 'Back'}</button>
                  <button onClick={submit} disabled={loading || !legalAccepted} className="flex-1 py-3 rounded-xl bg-[hsl(var(--gold-hi))] text-[hsl(var(--ink))] font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {form.payment_method === 'moyasar'
                      ? (isAr ? 'ادفع الآن' : 'Pay now')
                      : (isAr ? 'تأكيد الطلب' : 'Place order')}
                  </button>
                </div>

              </>
            )}
          </div>

          <aside className="p-6 rounded-2xl border border-[hsl(var(--gold-hi)/0.2)] bg-[hsl(var(--card))] h-fit space-y-3">
            <h3 className="font-display text-lg">{isAr ? 'ملخص الطلب' : 'Order summary'}</h3>
            <ul className="space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.slug} className="flex justify-between">
                  <span>{isAr ? i.nameAr : i.nameEn} × {i.qty} {i.unit}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-[hsl(var(--border))] space-y-1 text-sm">
              <div className="flex justify-between"><span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-[hsl(var(--muted-foreground))]"><span>{isAr ? 'الضريبة 15%' : 'VAT 15%'}</span><span>{fmt(vat)}</span></div>
              <div className="flex justify-between text-lg font-bold pt-2"><span>{isAr ? 'الإجمالي' : 'Total'}</span><span className="text-[hsl(var(--gold-hi))]">{fmt(total)} {isAr ? 'ر.س' : 'SAR'}</span></div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required, type = 'text', textarea }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))]" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))]" />
      )}
    </label>
  );
}
