import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { products } from '@/data/products';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

const orderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'name_min' })
    .max(60, { message: 'name_max' })
    .regex(/^[\p{L}\s'-]+$/u, { message: 'name_invalid' }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,16}$/, { message: 'phone_invalid' }),
  qty: z.coerce
    .number({ invalid_type_error: 'qty_invalid' })
    .int({ message: 'qty_invalid' })
    .min(1, { message: 'qty_min' })
    .max(100000, { message: 'qty_max' }),
});

type FieldErrors = Partial<Record<'name' | 'phone' | 'qty', string>>;

const messages: Record<string, { ar: string; en: string }> = {
  name_min: { ar: 'الاسم قصير جداً (حرفين على الأقل)', en: 'Name is too short (min 2 characters)' },
  name_max: { ar: 'الاسم طويل جداً (60 حرفاً كحد أقصى)', en: 'Name is too long (max 60 characters)' },
  name_invalid: { ar: 'يرجى إدخال اسم صحيح بدون أرقام أو رموز', en: 'Please enter a valid name (letters only)' },
  phone_invalid: { ar: 'رقم جوال غير صحيح. مثال: +9665XXXXXXXX', en: 'Invalid phone number. e.g. +9665XXXXXXXX' },
  qty_invalid: { ar: 'الكمية يجب أن تكون رقماً صحيحاً', en: 'Quantity must be a whole number' },
  qty_min: { ar: 'الحد الأدنى للكمية هو 1 كجم', en: 'Minimum quantity is 1 kg' },
  qty_max: { ar: 'الكمية كبيرة جداً (الحد الأقصى 100,000 كجم)', en: 'Quantity is too large (max 100,000 kg)' },
};

export function OrderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const [product, setProduct] = useState(products[0]?.slug ?? '');
  const [qty, setQty] = useState('10');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const msg = (key?: string) => (key ? (isAr ? messages[key]?.ar : messages[key]?.en) : undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = orderSchema.safeParse({ name, phone, qty });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const { name: vName, phone: vPhone, qty: vQty } = result.data;
    const p = products.find((x) => x.slug === product);
    const safeNotes = notes.trim().slice(0, 500);
    const text = isAr
      ? `مرحباً، أود تقديم طلب:\n• المنتج: ${p?.nameAr ?? product}\n• الكمية: ${vQty} كجم\n• الاسم: ${vName}\n• الجوال: ${vPhone}\n• ملاحظات: ${safeNotes}`
      : `Hello, I'd like to place an order:\n• Product: ${p?.nameEn ?? product}\n• Quantity: ${vQty} kg\n• Name: ${vName}\n• Phone: ${vPhone}\n• Notes: ${safeNotes}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    onOpenChange(false);
  };

  const inputCls = (hasError?: boolean) =>
    `w-full px-3 py-2 rounded-lg border bg-background ${hasError ? 'border-destructive focus:outline-destructive' : 'border-input'}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{isAr ? 'اطلب الآن' : 'Place an Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-muted-foreground">{isAr ? 'المنتج' : 'Product'}</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className={inputCls()}>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{isAr ? p.nameAr : p.nameEn}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-muted-foreground">{isAr ? 'الكمية (كجم)' : 'Quantity (kg)'}</label>
              <input
                type="number"
                min="1"
                max="100000"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                aria-invalid={!!errors.qty}
                className={inputCls(!!errors.qty)}
              />
              {errors.qty && <p className="mt-1 text-xs text-destructive">{msg(errors.qty)}</p>}
            </div>
            <div>
              <label className="block mb-1 text-muted-foreground">{isAr ? 'الاسم' : 'Name'}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                aria-invalid={!!errors.name}
                className={inputCls(!!errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{msg(errors.name)}</p>}
            </div>
          </div>
          <div>
            <label className="block mb-1 text-muted-foreground">{isAr ? 'الجوال' : 'Phone'}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+9665XXXXXXXX"
              maxLength={16}
              aria-invalid={!!errors.phone}
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{msg(errors.phone)}</p>}
          </div>
          <div>
            <label className="block mb-1 text-muted-foreground">{isAr ? 'ملاحظات' : 'Notes'}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} className={inputCls()} />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-[#25D366] text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <MessageCircle className="w-4 h-4" />
            {isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
