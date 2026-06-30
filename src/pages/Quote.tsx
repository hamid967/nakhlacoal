import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { FileText, Sparkles, MessageCircle, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteBuilder';
import { PRICING } from '@/data/pricing';

const WHATSAPP_NUMBER = '966540060095';
const ORDER_EMAIL = 'mab355@gmail.com';

export default function Quote() {
  const [sp] = useSearchParams();
  const initialSlug = sp.get('product') || undefined;
  const validSlug = initialSlug && PRICING[initialSlug] ? initialSlug : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const openAssistant = () => {
    window.dispatchEvent(new CustomEvent('palm:open-assistant'));
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

      <main dir="rtl" className="min-h-screen pt-24 pb-16">
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
              <Button onClick={openAssistant} className="w-full bg-gold text-dark hover:bg-gold-hi font-semibold">
                <MessageCircle className="size-4 ms-1" /> ابدأ المحادثة الآن
              </Button>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">●</span> توصية فورية حسب الاستخدام</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">●</span> أسعار الجملة والتدرّج الكمّي</li>
                <li className="flex items-start gap-2"><span className="text-gold mt-0.5">●</span> تحويل المحادثة إلى طلب جاهز</li>
              </ul>
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
                <MessageCircle className="size-5 text-[#25D366]" />
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
      </main>
    </>
  );
}
