import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type QR = {
  id: string; product: string; quantity: number; unit: string;
  status: string; quoted_price_sar: number | null; order_id: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: 'جديد', under_review: 'قيد المراجعة', priced: 'تم التسعير',
  accepted: 'مقبول', rejected: 'مرفوض', converted_to_order: 'محوّل لطلب',
};
const STATUS_TINT: Record<string, string> = {
  new: 'bg-slate-500/10 text-slate-600',
  under_review: 'bg-blue-500/10 text-blue-600',
  priced: 'bg-amber-500/10 text-amber-700',
  accepted: 'bg-sand0/10 text-gold',
  rejected: 'bg-rose-500/10 text-rose-700',
  converted_to_order: 'bg-violet-500/10 text-violet-700',
};

export default function PortalQuotes() {
  const { user } = useAuth();
  const [rows, setRows] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('quote_requests')
        .select('id,product,quantity,unit,status,quoted_price_sar,order_id,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRows((data as QR[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-4" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold">عروضي السعرية</h1>
        <p className="text-sm text-muted-foreground">تتبّع كل طلب عرض سعر أرسلته إلى فريق المبيعات.</p>
      </header>

      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> جارٍ التحميل…
        </div>
      ) : !rows.length ? (
        <div className="rounded-2xl border p-10 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">لم ترسل أي طلب عرض سعر بعد.</p>
          <Link to="/quote" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-dark font-semibold">
            إنشاء عرض سعر جديد
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-right">
                <th className="p-3 text-xs font-semibold">#</th>
                <th className="p-3 text-xs font-semibold">المنتج</th>
                <th className="p-3 text-xs font-semibold">الكمية</th>
                <th className="p-3 text-xs font-semibold">السعر</th>
                <th className="p-3 text-xs font-semibold">الحالة</th>
                <th className="p-3 text-xs font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{q.id.slice(0, 8)}</td>
                  <td className="p-3">{q.product}</td>
                  <td className="p-3 tabular-nums">{q.quantity} {q.unit}</td>
                  <td className="p-3 tabular-nums">{q.quoted_price_sar ? `${q.quoted_price_sar} ر.س` : '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_TINT[q.status] || ''}`}>
                      {STATUS_LABEL[q.status] || q.status}
                    </span>
                    {q.order_id && (
                      <Link to={`/portal/orders/${q.order_id}`} className="ms-2 text-[11px] text-gold underline">
                        الطلب
                      </Link>
                    )}
                  </td>
                  <td className="p-3 text-[11px] text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
