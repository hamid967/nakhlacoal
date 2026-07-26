import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, PackageCheck, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { waLink } from '@/lib/brand';

interface QuoteStatusRow {
  id: string;
  status: string;
  product: string;
  quantity: number;
  unit: string;
  quoted_price_sar: number | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { ar: string; tone: string }> = {
  new: { ar: 'قيد المراجعة', tone: 'bg-sand0/20 text-sand0' },
  reviewing: { ar: 'قيد التسعير', tone: 'bg-sand0/20 text-sand0' },
  quoted: { ar: 'تم إصدار عرض السعر', tone: 'bg-gold/20 text-gold' },
  accepted: { ar: 'تم القبول', tone: 'bg-jade/20 text-jade' },
  rejected: { ar: 'مرفوض', tone: 'bg-destructive/20 text-destructive' },
  expired: { ar: 'منتهي', tone: 'bg-muted text-muted-foreground' },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function QuoteTrack() {
  const [params, setParams] = useSearchParams();
  const [id, setId] = useState(params.get('id') ?? '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteStatusRow | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Auto-fill from URL
  useEffect(() => {
    const urlId = params.get('id') ?? '';
    if (urlId && urlId !== id) setId(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = id.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    if (!UUID_RE.test(trimmedId)) {
      toast.error('رقم الطلب غير صالح');
      return;
    }
    if (trimmedPhone.replace(/\D/g, '').length < 7) {
      toast.error('رقم الجوال غير صالح');
      return;
    }
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const { data, error } = await supabase.rpc('get_quote_status' as never, {
        _id: trimmedId,
        _phone: trimmedPhone,
      } as never);
      if (error) throw error;
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as QuoteStatusRow) : null;
      if (!row) {
        setNotFound(true);
      } else {
        setResult(row);
        setParams({ id: row.id }, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <Helmet>
        <title>تتبّع طلب عرض السعر · فحم النخلة</title>
        <meta
          name="description"
          content="تحقّق من حالة طلب عرض السعر باستخدام رقم الطلب ورقم الجوال المسجّل عند الإرسال."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="container max-w-2xl mx-auto px-4">
        <Link
          to="/quote"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold mb-4"
        >
          <ArrowLeft className="size-4" /> إرسال طلب جديد
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid place-items-center size-11 rounded-full bg-gold/15 text-gold">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">تتبّع طلب عرض السعر</h1>
              <p className="text-xs text-muted-foreground">
                أدخل رقم الطلب ورقم الجوال لمعرفة الحالة
              </p>
            </div>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-semibold">رقم الطلب *</span>
              <input
                dir="ltr"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-mono outline-none focus:border-gold"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">رقم الجوال المسجّل *</span>
              <input
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+9665..."
                maxLength={25}
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-dark hover:bg-gold-hi font-semibold"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin ms-1" />
              ) : (
                <Search className="size-4 ms-1" />
              )}
              {loading ? 'جارٍ البحث…' : 'عرض الحالة'}
            </Button>
          </form>

          {notFound && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-center">
              لم نعثر على طلب مطابق. تأكّد من رقم الطلب ورقم الجوال المسجّل.
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">رقم الطلب</div>
                  <div className="font-mono text-sm">{result.id.slice(0, 8)}</div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_LABELS[result.status]?.tone ?? 'bg-muted text-muted-foreground'
                  }`}
                >
                  {STATUS_LABELS[result.status]?.ar ?? result.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="المنتج" value={result.product} />
                <Field
                  label="الكمية"
                  value={`${Number(result.quantity).toLocaleString('ar-SA')} ${result.unit}`}
                />
                <Field
                  label="السعر المعروض"
                  value={
                    result.quoted_price_sar != null
                      ? `${Number(result.quoted_price_sar).toLocaleString('ar-SA')} ر.س`
                      : '—'
                  }
                />
                <Field
                  label="آخر تحديث"
                  value={new Date(result.updated_at).toLocaleDateString('ar-SA')}
                />
              </div>
              <a
                href={waLink(
                  `مرحباً، أستفسر عن طلب عرض السعر رقم ${result.id.slice(0, 8)} — الحالة الحالية: ${
                    STATUS_LABELS[result.status]?.ar ?? result.status
                  }`,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg border border-jade/40 bg-jade/10 text-jade hover:bg-jade/15 py-2 text-sm font-semibold"
              >
                <MessageCircle className="size-4" /> متابعة عبر واتساب
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
