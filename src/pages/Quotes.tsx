import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FileText, Trash2, MessageCircle, Mail, Plus, Archive, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listQuotes, deleteQuote, clearQuotes, type SavedQuote } from '@/lib/quoteStore';
import { exportQuoteToPdf } from '@/lib/exportQuotePdf';
import { products } from '@/data/products';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '966540060085';
const ORDER_EMAIL = 'nakhlacoal@gmail.com';

const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const labelOf = (slug: string) => products.find((p) => p.slug === slug)?.nameAr || slug;
const unitAr = (u: string) => ({ kg: 'كجم', carton: 'كرتون', ton: 'طن' }[u] || u);

function quoteText(q: SavedQuote) {
  const sep = '────────────────────';
  const lns = q.items
    .map((i, idx) =>
      `${idx + 1}) ${labelOf(i.slug)}\n   • الكمية: ${i.qty} ${unitAr(i.unit)}\n   • السعر: ${fmt(i.unitPrice)} ر.س\n   • الإجمالي: ${fmt(i.lineTotal)} ر.س`,
    )
    .join(`\n${sep}\n`);
  return [
    '🌴 *عرض سعر — فحم النخلة*',
    sep,
    lns,
    sep,
    `*الإجمالي قبل الضريبة:* ${fmt(q.subtotal)} ر.س`,
    `*الضريبة (15%):* ${fmt(q.vat)} ر.س`,
    `*الإجمالي شامل الضريبة:* ${fmt(q.total)} ر.س`,
    sep,
    `العميل: ${q.customer.name} — ${q.customer.phone}`,
  ].join('\n');
}

export default function Quotes() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setQuotes(await listQuotes());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onDelete = async (id: string) => {
    await deleteQuote(id);
    toast.success('تم حذف العرض');
    refresh();
  };

  const onClear = async () => {
    if (!confirm('حذف جميع العروض المحفوظة؟')) return;
    await clearQuotes();
    refresh();
  };

  const resend = (q: SavedQuote, channel: 'whatsapp' | 'email') => {
    const text = quoteText(q);
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } else {
      window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(`عرض سعر — ${q.customer.name}`)}&body=${encodeURIComponent(text)}`;
    }
  };

  return (
    <>
      <Helmet>
        <title>عروضي المحفوظة | فحم النخلة</title>
        <meta name="description" content="مراجعة وإعادة إرسال عروض الأسعار التي أنشأتها سابقًا من فحم النخلة." />
        <link rel="canonical" href="https://alnakhlacoal.com/quotes" />
      </Helmet>

      <div dir="rtl" className="min-h-dvh pt-24 pb-16">
        <section className="container max-w-5xl px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Archive className="size-6 text-gold" /> عروضي المحفوظة
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                تُحفظ العروض محلياً على جهازك (ومرتبطة بحسابك عند تسجيل الدخول).
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/quote"><Plus className="size-4 ms-1" /> عرض جديد</Link>
              </Button>
              {quotes.length > 0 && (
                <Button onClick={onClear} variant="ghost" size="sm" className="text-destructive">
                  حذف الكل
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جارٍ التحميل…</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl border border-dashed">
              <FileText className="size-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground mb-4">لا توجد عروض محفوظة بعد.</p>
              <Button asChild className="bg-gold text-dark hover:bg-gold-hi">
                <Link to="/quote">إنشاء أول عرض</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {quotes.map((q) => (
                <li key={q.id} className="glass-card rounded-xl border border-gold/20 p-4 md:p-5">
                  <div className="flex flex-wrap justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold">{q.customer.name || 'عميل'}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{q.customer.phone}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-lg font-bold text-gold">{fmt(q.total)} ر.س</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(q.createdAt).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                  <ul className="text-sm space-y-1 mb-3">
                    {q.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between border-b border-border/50 py-1">
                        <span>{labelOf(i.slug)} — {i.qty} {unitAr(i.unit)}</span>
                        <span className="text-muted-foreground">{fmt(i.lineTotal)} ر.س</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => resend(q, 'whatsapp')} className="bg-whatsapp hover:bg-whatsapp-hover text-white">
                      <MessageCircle className="size-4 ms-1" /> واتساب
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => resend(q, 'email')}>
                      <Mail className="size-4 ms-1" /> بريد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gold/40 text-gold hover:bg-gold/10"
                      onClick={async () => {
                        try {
                          toast.loading('جارٍ إنشاء PDF…', { id: q.id });
                          await exportQuoteToPdf({ ...q, quoteId: q.id });
                          toast.success('تم التنزيل', { id: q.id });
                        } catch {
                          toast.error('تعذّر إنشاء الملف', { id: q.id });
                        }
                      }}
                    >
                      <Download className="size-4 ms-1" /> PDF
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(q.id)} className="text-destructive ms-auto">
                      <Trash2 className="size-4 ms-1" /> حذف
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
