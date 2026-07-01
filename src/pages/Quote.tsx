import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { FileText, Sparkles, MessageCircle, Phone, Mail, Clock, Calculator, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteBuilder';
import { PRICING } from '@/data/pricing';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

const PRESETS: { label: string; text: string }[] = [
  { label: 'مطعم/مشواة', text: 'مرحباً، أحتاج عرض سعر لفحم مطاعم بكميات شهرية منتظمة. ما الأنسب لي؟' },
  { label: 'مقهى شيشة', text: 'أبحث عن فحم شيشة فاخر (كيوبس) — أحتاج توصية وسعر جملة لكميات شهرية.' },
  { label: 'تصدير/جملة', text: 'لدي طلب تصدير بكميات كبيرة (طن فأكثر). أرجو إرسال عرض سعر تنافسي وشروط الشحن.' },
  { label: 'مناسبات', text: 'أحتاج فحم لمناسبة واحدة (~50–100 كجم). ما الخيار الأفضل سعراً وجودة؟' },
];

type LiveQuote = {
  count: number; subtotal: number; vat: number; total: number;
  items: { label: string; qty: number; unit: string; lineTotal: number }[];
};

const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const unitAr = (u: string) => ({ kg: 'كجم', carton: 'كرتون', ton: 'طن' } as Record<string, string>)[u] || u;

export default function Quote() {
  const [sp] = useSearchParams();
  const initialSlug = sp.get('product') || undefined;
  const validSlug = initialSlug && PRICING[initialSlug] ? initialSlug : undefined;
  const [live, setLive] = useState<LiveQuote | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const onUpdate = (e: Event) => setLive((e as CustomEvent<LiveQuote>).detail);
    window.addEventListener('palm:quote-update', onUpdate);
    return () => window.removeEventListener('palm:quote-update', onUpdate);
  }, []);

  const openAssistant = (prefill?: string) => {
    window.dispatchEvent(new CustomEvent('palm:open-assistant', { detail: { prefill } }));
  };

  const summaryText = () => {
    if (!live || !live.count) return '';
    const lines = live.items
      .map((i, idx) => `${idx + 1}) ${i.label} — ${i.qty} ${unitAr(i.unit)} = ${fmt(i.lineTotal)} ر.س`)
      .join('\n');
    return `🌴 ملخص عرض السعر — فحم النخلة\n${lines}\n— عدد البنود: ${live.count}\n— الإجمالي شامل الضريبة: ${fmt(live.total)} ر.س`;
  };

  const copySummary = async () => {
    const t = summaryText();
    if (!t) return toast.error('أضف منتجاً أولاً لتوليد الملخص');
    await navigator.clipboard.writeText(t);
    setCopied(true);
    toast.success('تم نسخ ملخص السعر');
    setTimeout(() => setCopied(false), 1800);
  };

  const sendSummaryWhatsApp = () => {
    const t = summaryText();
    if (!t) return toast.error('أضف منتجاً أولاً لتوليد الملخص');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  };

  return (
    <>
      <Helmet>
        <title>عرض سعر فوري | فحم النخلة — Palm Charcoal</title>
        <meta
          name="description"
          content="احصل على عرض سعر فوري لأنواع الفحم الفاخر مع مساعد فحم النخلة الذكي. شامل الضريبة، التسعير الجملة، وإرسال مباشر عبر واتساب."
        />
        <link rel="canonical" href="https://alnakhlacoal.com/quote" />
      </Helmet>

      <div dir="rtl" className="min-h-dvh pt-24 pb-16">
        {/* Hero */}
        <section className="container max-w-6xl px-4 mb-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/5 text-gold text-xs font-semibold">
              <Sparkles className="size-3.5" /> عرض سعر فوري
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-arabic">
              احسب طلبك في دقيقة <span className="text-gold">واحدة</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اختر المنتجات، أدخل الكميات، واحصل على إجمالي شامل الضريبة فوراً — مع إمكانية إرساله مباشرة لفريق المبيعات عبر واتساب أو البريد.
            </p>
          </div>
        </section>

        {/* Grid: form + assistant */}
        <section className="container max-w-6xl px-4 grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-gold/20 p-5 md:p-7">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gold/10">
              <FileText className="size-5 text-gold" />
              <h2 className="text-lg font-bold">منشئ عرض السعر</h2>
            </div>
            <QuoteForm initialSlug={validSlug} />
          </div>

          {/* Assistant side panel */}
          <aside className="space-y-4">
            <div className="glass-card rounded-2xl border border-gold/30 p-5 bg-gradient-to-br from-gold/10 via-transparent to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-5 text-gold" />
                <h3 className="font-bold">مساعد فحم النخلة</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                مستشار ذكي يرشّح لك المنتج المناسب، يحسب الكميات، ويجهّز الطلب نيابةً عنك بأسلوب احترافي.
              </p>
              <Button onClick={() => openAssistant()} className="w-full bg-gold text-dark hover:bg-gold-hi font-semibold">
                <MessageCircle className="size-4 ms-1" /> ابدأ المحادثة الآن
              </Button>

              {/* Quick prompt suggestions */}
              <div className="mt-4">
                <div className="text-[11px] font-semibold text-muted-foreground mb-2">اقتراحات جاهزة</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => openAssistant(p.text)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-gold/30 bg-background/50 hover:bg-gold/10 hover:border-gold/60 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">●</span> توصية فورية حسب الاستخدام</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">●</span> أسعار الجملة والتدرّج الكمّي</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">●</span> تحويل المحادثة إلى طلب جاهز</li>
              </ul>
            </div>

            {/* Live price summary */}
            <div className="glass-card rounded-2xl border border-gold/20 p-5">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Calculator className="size-4 text-gold" /> ملخص السعر المباشر
              </h3>
              {live && live.count > 0 ? (
                <>
                  <ul className="space-y-1.5 text-xs max-h-40 overflow-auto pe-1">
                    {live.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between gap-2 border-b border-border/40 pb-1">
                        <span className="truncate">{i.label} <span className="text-muted-foreground">× {i.qty} {unitAr(i.unit)}</span></span>
                        <span className="font-semibold tabular-nums">{fmt(i.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">قبل الضريبة</span><span className="tabular-nums">{fmt(live.subtotal)} ر.س</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">ضريبة 15%</span><span className="tabular-nums">{fmt(live.vat)} ر.س</span></div>
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-gold/30 mt-1">
                      <span>الإجمالي</span><span className="text-gold tabular-nums">{fmt(live.total)} ر.س</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button onClick={copySummary} variant="outline" size="sm" className="text-xs">
                      {copied ? <Check className="size-3.5 ms-1" /> : <Copy className="size-3.5 ms-1" />}
                      {copied ? 'تم النسخ' : 'نسخ الملخص'}
                    </Button>
                    <Button onClick={sendSummaryWhatsApp} size="sm" className="text-xs bg-whatsapp hover:bg-whatsapp-hover text-white">
                      <MessageCircle className="size-3.5 ms-1" /> إرسال واتساب
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">أضف منتجاً في النموذج لعرض ملخص الأسعار هنا قبل الإرسال.</p>
              )}
            </div>

            <div className="glass-card rounded-2xl border p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="size-4 text-gold" /> تفضّل بالتواصل المباشر
              </h3>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition"
              >
                <MessageCircle className="size-5 text-whatsapp" />
                <div>
                  <div className="text-sm font-semibold">واتساب المبيعات</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">+966 54 006 0095</div>
                </div>
              </a>
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition"
              >
                <Phone className="size-5 text-gold" />
                <div>
                  <div className="text-sm font-semibold">اتصال مباشر</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">+966 54 006 0095</div>
                </div>
              </a>
              <a
                href={`mailto:${ORDER_EMAIL}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition"
              >
                <Mail className="size-5 text-gold" />
                <div>
                  <div className="text-sm font-semibold">البريد الإلكتروني</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">{ORDER_EMAIL}</div>
                </div>
              </a>
              <p className="text-[11px] text-muted-foreground pt-2 border-t">
                ساعات العمل: السبت – الخميس · 8 صباحاً – 9 مساءً
              </p>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
