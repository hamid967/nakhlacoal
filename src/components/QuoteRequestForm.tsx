import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const PRODUCT_LABELS: Record<string, string> = {
  bbq: 'فحم مشاوي BBQ',
  coconut: 'فحم جوز الهند',
  hookah: 'فحم شيشة كيوبس',
  incense: 'فحم بخور',
  compressed: 'فحم مضغوط',
  export: 'فحم تصدير',
};

const schema = z.object({
  full_name: z.string().trim().min(2, 'الاسم قصير').max(120),
  company_name: z.string().trim().min(2, 'اسم الشركة قصير').max(200),
  phone: z.string().trim().min(7, 'رقم غير صالح').max(25),
  email: z.string().trim().email('بريد غير صالح').max(255).optional().or(z.literal('')),
  product: z.string().trim().min(2, 'حدد المنتج').max(160),
  quantity: z.coerce.number().positive('الكمية يجب أن تكون أكبر من صفر').max(1_000_000),
  unit: z.string().default('كرتون'),
  destination: z.string().trim().max(160).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormState = Record<keyof z.infer<typeof schema>, string>;

const initial: FormState = {
  full_name: '', company_name: '', phone: '', email: '',
  product: '', quantity: '', unit: 'كرتون', destination: '', notes: '',
};

export interface QuoteRequestFormProps {
  initialProduct?: string; // slug from URL, e.g. "hookah"
  initialSku?: string;     // SKU from URL, e.g. "PC-HK-CUBE-1KG"
}

export function QuoteRequestForm({ initialProduct, initialSku }: QuoteRequestFormProps = {}) {
  const { user } = useAuth();
  const [values, setValues] = useState<FormState>(() => ({
    ...initial,
    product: initialProduct ? (PRODUCT_LABELS[initialProduct] ?? initialProduct) : '',
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  // Sync when URL params change while page is mounted
  useEffect(() => {
    if (initialProduct) {
      const label = PRODUCT_LABELS[initialProduct] ?? initialProduct;
      setValues((s) => (s.product ? s : { ...s, product: label }));
    }
  }, [initialProduct]);


  const set = <K extends keyof FormState>(k: K, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormState;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      toast.error('يرجى مراجعة الحقول المطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      const d = parsed.data;
      const payload = {
        full_name: d.full_name!,
        company_name: d.company_name!,
        phone: d.phone!,
        email: d.email || null,
        product: d.product!,
        quantity: d.quantity!,
        unit: d.unit || 'كرتون',
        destination: d.destination || null,
        notes: d.notes || null,
        user_id: user?.id ?? null,
      };
      const { data, error } = await supabase
        .from('quote_requests')
        .insert(payload)
        .select('id')
        .single();
      if (error) throw error;
      setDone(data?.id ?? 'ok');
      setValues(initial);
      toast.success('تم إرسال طلب عرض السعر — سنعاود التواصل خلال 24 ساعة');
    } catch (err: any) {
      console.error('[QuoteRequestForm]', err);
      toast.error(err?.message || 'تعذّر إرسال الطلب، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-sand0/30 bg-sand0/5 p-6 text-center">
        <CheckCircle2 className="size-10 text-sand0 mx-auto mb-3" />
        <h4 className="font-bold text-lg mb-1">تم استلام طلبك بنجاح</h4>
        <p className="text-sm text-muted-foreground mb-4">
          رقم الطلب: <span className="font-mono tabular-nums text-foreground">{String(done).slice(0, 8)}</span>
        </p>
        <Button variant="outline" size="sm" onClick={() => setDone(null)}>إرسال طلب جديد</Button>
      </div>
    );
  }

  const cls = (k: keyof FormState) =>
    `w-full rounded-lg border bg-background/50 px-3 py-2 text-sm outline-none transition focus:border-gold ${
      errors[k] ? 'border-destructive' : 'border-border'
    }`;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold">الاسم الكامل *</span>
          <input className={cls('full_name')} value={values.full_name} onChange={(e) => set('full_name', e.target.value)} maxLength={120} />
          {errors.full_name && <span className="text-[11px] text-destructive">{errors.full_name}</span>}
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold">اسم الشركة *</span>
          <input className={cls('company_name')} value={values.company_name} onChange={(e) => set('company_name', e.target.value)} maxLength={200} />
          {errors.company_name && <span className="text-[11px] text-destructive">{errors.company_name}</span>}
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold">الجوال *</span>
          <input dir="ltr" className={cls('phone')} value={values.phone} onChange={(e) => set('phone', e.target.value)} maxLength={25} placeholder="+9665..." />
          {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold">البريد الإلكتروني</span>
          <input dir="ltr" type="email" className={cls('email')} value={values.email} onChange={(e) => set('email', e.target.value)} maxLength={255} />
          {errors.email && <span className="text-[11px] text-destructive">{errors.email}</span>}
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold">المنتج المطلوب *</span>
          <input className={cls('product')} value={values.product} onChange={(e) => set('product', e.target.value)} maxLength={160} placeholder="مثال: فحم شيشة كيوبس فاخر" />
          {errors.product && <span className="text-[11px] text-destructive">{errors.product}</span>}
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold">الكمية *</span>
          <input type="number" min={1} step="any" className={cls('quantity')} value={values.quantity} onChange={(e) => set('quantity', e.target.value)} />
          {errors.quantity && <span className="text-[11px] text-destructive">{errors.quantity}</span>}
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold">الوحدة</span>
          <select className={cls('unit')} value={values.unit} onChange={(e) => set('unit', e.target.value)}>
            <option value="كرتون">كرتون</option>
            <option value="كجم">كجم</option>
            <option value="طن">طن</option>
            <option value="حاوية">حاوية</option>
          </select>
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold">وجهة الشحن (اختياري)</span>
          <input className={cls('destination')} value={values.destination} onChange={(e) => set('destination', e.target.value)} maxLength={160} placeholder="مثال: الرياض · جدة · دبي" />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-semibold">ملاحظات إضافية</span>
          <textarea rows={3} className={cls('notes')} value={values.notes} onChange={(e) => set('notes', e.target.value)} maxLength={1000} />
        </label>
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-gold text-dark hover:bg-gold-hi font-semibold">
        <Send className="size-4 ms-1" />
        {submitting ? 'جارٍ الإرسال…' : 'إرسال طلب عرض السعر'}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        بإرسال الطلب فأنت توافق على استلام التواصل من فريق مبيعات فحم النخلة.
      </p>
    </form>
  );
}
