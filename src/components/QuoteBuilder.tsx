import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, MessageCircle, Mail, FileText } from 'lucide-react';
import { products } from '@/data/products';
import { PRICING, VAT_RATE, bestPrice, availableUnits } from '@/data/pricing';
import { saveQuote } from '@/lib/quoteStore';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

type Line = { slug: string; qty: number; unit: 'kg' | 'carton' | 'ton' };

const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const labelOf = (slug: string) => products.find((p) => p.slug === slug)?.nameAr || slug;
const unitAr = (u: string) => ({ kg: 'كجم', carton: 'كرتون', ton: 'طن' }[u] || u);

function defaultLine(): Line {
  const slug = Object.keys(PRICING)[0];
  return { slug, qty: 10, unit: availableUnits(slug)[0] };
}

/** Inner content — usable inside a dialog OR a full page */
export function QuoteForm({ initialSlug, compact = false }: { initialSlug?: string; compact?: boolean }) {
  const [lines, setLines] = useState<Line[]>(() => [
    initialSlug && PRICING[initialSlug]
      ? { slug: initialSlug, qty: 10, unit: availableUnits(initialSlug)[0] }
      : defaultLine(),
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', company: '', city: '' });

  const computed = useMemo(() => {
    const items = lines.map((l) => {
      const unitPrice = bestPrice(l.slug, l.qty, l.unit);
      return { ...l, unitPrice, lineTotal: unitPrice * l.qty };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const vat = subtotal * VAT_RATE;
    return { items, subtotal, vat, total: subtotal + vat };
  }, [lines]);

  const updateLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch, ...(patch.slug ? { unit: availableUnits(patch.slug)[0] } : {}) } : l)));

  const summaryText = () => {
    const sep = '────────────────────';
    const lns = computed.items
      .map(
        (i, idx) =>
          `${idx + 1}) ${labelOf(i.slug)}\n   • الكمية: ${i.qty} ${unitAr(i.unit)}\n   • السعر: ${fmt(i.unitPrice)} ر.س / ${unitAr(i.unit)}\n   • الإجمالي: ${fmt(i.lineTotal)} ر.س`
      )
      .join(`\n${sep}\n`);
    return [
      '🌴 *طلب عرض سعر — فحم النخلة*',
      sep,
      lns,
      sep,
      `*المجموع قبل الضريبة:* ${fmt(computed.subtotal)} ر.س`,
      `*ضريبة القيمة المضافة (15%):* ${fmt(computed.vat)} ر.س`,
      `*الإجمالي شامل الضريبة:* ${fmt(computed.total)} ر.س`,
      sep,
      '*بيانات العميل*',
      `• الاسم: ${customer.name || '—'}`,
      `• الجوال: ${customer.phone || '—'}`,
      customer.email && `• البريد: ${customer.email}`,
      customer.company && `• المنشأة: ${customer.company}`,
      customer.city && `• المدينة: ${customer.city}`,
      sep,
      '_تم إنشاء العرض من موقع alnakhlacoal.com_',
    ].filter(Boolean).join('\n');
  };

  const validate = () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      toast.error('يرجى تعبئة الاسم ورقم الجوال');
      return false;
    }
    if (!computed.items.length) {
      toast.error('أضف منتجاً واحداً على الأقل');
      return false;
    }
    return true;
  };

  const persist = async (channel: 'whatsapp' | 'email') => {
    try {
      await saveQuote({
        channel,
        customer: { ...customer },
        items: computed.items.map((i) => ({ slug: i.slug, qty: i.qty, unit: i.unit, unitPrice: i.unitPrice, lineTotal: i.lineTotal })),
        subtotal: computed.subtotal,
        vat: computed.vat,
        total: computed.total,
      });
      toast.success('تم حفظ عرض السعر — يمكنك مراجعته من صفحة عروضي', {
        action: { label: 'عروضي', onClick: () => (window.location.href = '/quotes') },
      });
    } catch {
      /* noop */
    }
  };

  const sendWhatsApp = async () => {
    if (!validate()) return;
    await persist('whatsapp');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summaryText())}`, '_blank', 'noopener');
  };

  const sendEmail = async () => {
    if (!validate()) return;
    await persist('email');
    const subject = `طلب عرض سعر — ${customer.name}`;
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summaryText())}`;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Lines */}
      <div className="space-y-2">
        {computed.items.map((line, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border bg-muted/30">
            <div className="col-span-12 sm:col-span-5">
              <Label className="text-xs">المنتج</Label>
              <select
                value={line.slug}
                onChange={(e) => updateLine(i, { slug: e.target.value })}
                className="w-full mt-1 h-10 rounded-md border bg-background px-2 text-sm"
              >
                {Object.keys(PRICING).map((slug) => (
                  <option key={slug} value={slug}>{labelOf(slug)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-5 sm:col-span-3">
              <Label className="text-xs">الكمية</Label>
              <Input type="number" min={1} value={line.qty} onChange={(e) => updateLine(i, { qty: Math.max(1, +e.target.value || 1) })} className="mt-1" />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <Label className="text-xs">الوحدة</Label>
              <select
                value={line.unit}
                onChange={(e) => updateLine(i, { unit: e.target.value as Line['unit'] })}
                className="w-full mt-1 h-10 rounded-md border bg-background px-2 text-sm"
              >
                {availableUnits(line.slug).map((u) => <option key={u} value={u}>{unitAr(u)}</option>)}
              </select>
            </div>
            <div className="col-span-3 sm:col-span-2 flex items-center justify-between gap-1">
              <div className="text-sm font-semibold text-gold whitespace-nowrap">{fmt(line.lineTotal)} ر.س</div>
              {computed.items.length > 1 && (
                <Button size="icon" variant="ghost" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, defaultLine()])} className="w-full">
          <Plus className="size-4 ms-1" /> إضافة منتج
        </Button>
      </div>

      {/* Totals */}
      <div className="rounded-lg border bg-gold/5 p-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>الإجمالي قبل الضريبة</span><span>{fmt(computed.subtotal)} ر.س</span></div>
        <div className="flex justify-between text-muted-foreground"><span>الضريبة (15%)</span><span>{fmt(computed.vat)} ر.س</span></div>
        <div className="flex justify-between text-base font-bold text-gold border-t pt-2 mt-2"><span>الإجمالي</span><span>{fmt(computed.total)} ر.س</span></div>
      </div>

      {/* Customer */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div><Label>الاسم *</Label><Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
        <div><Label>الجوال *</Label><Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="05xxxxxxxx" /></div>
        <div><Label>البريد</Label><Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
        <div><Label>المنشأة</Label><Input value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>المدينة</Label><Input value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} /></div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button onClick={sendWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#1eb858] text-white">
          <MessageCircle className="size-4 ms-1" /> إرسال عبر واتساب
        </Button>
        <Button onClick={sendEmail} variant="outline" className="flex-1">
          <Mail className="size-4 ms-1" /> إرسال عبر البريد
        </Button>
      </div>
    </div>
  );
}

export function QuoteBuilder({
  open,
  onOpenChange,
  initialSlug,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialSlug?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card !border-gold/30" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="size-5 text-gold" />
            عرض سعر فوري
          </DialogTitle>
          <DialogDescription>
            احسب تكلفة طلبك تقديرياً وأرسله مباشرة عبر واتساب أو البريد. التسعير النهائي يؤكَّد من فريق المبيعات.
          </DialogDescription>
        </DialogHeader>
        <QuoteForm initialSlug={initialSlug} />
      </DialogContent>
    </Dialog>
  );
}
