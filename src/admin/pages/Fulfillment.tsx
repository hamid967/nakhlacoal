import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, PackageCheck, Truck, RefreshCw, Printer } from 'lucide-react';

type Order = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
  contact_name: string | null;
  company_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  grand_total_sar: number | null;
  items: unknown;
};

type Shipment = { id: string; order_id: string; tracking_no: string | null; carrier: string | null; status: string };

export default function AdminFulfillment() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Record<string, Shipment>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'to_pick' | 'to_ship' | 'shipped'>('to_pick');

  const load = async () => {
    setLoading(true);
    const { data: os, error } = await supabase
      .from('orders')
      .select('id,status,payment_status,created_at,contact_name,company_name,phone,city,address,grand_total_sar,items')
      .in('payment_status', ['paid'])
      .not('status', 'in', '(delivered,cancelled,refunded,expired)')
      .order('paid_at', { ascending: true })
      .limit(200);
    if (error) toast.error(error.message);
    setOrders((os as Order[]) || []);

    const ids = ((os as Order[]) || []).map((o) => o.id);
    if (ids.length) {
      const { data: sh } = await supabase
        .from('shipments')
        .select('id,order_id,tracking_no,carrier,status')
        .in('order_id', ids);
      const map: Record<string, Shipment> = {};
      (sh as Shipment[] | null)?.forEach((s) => (map[s.order_id] = s));
      setShipments(map);
    } else {
      setShipments({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const s = shipments[o.id];
      if (tab === 'to_pick') return o.status === 'paid' && !s;
      if (tab === 'to_ship') return o.status === 'processing' && (!s || !s.tracking_no);
      if (tab === 'shipped') return !!s?.tracking_no;
      return true;
    });
  }, [orders, shipments, tab]);

  async function markProcessing(id: string) {
    const { error } = await supabase.from('orders').update({ status: 'processing' }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('تم تعليم الطلب "قيد التجهيز"');
    load();
  }

  async function createShipment(o: Order) {
    const carrier = window.prompt('شركة الشحن (SMSA/Aramex/DHL/Other):', 'SMSA')?.trim();
    if (!carrier) return;
    const tracking = window.prompt('رقم التتبع:')?.trim();
    if (!tracking) return;
    const { error } = await supabase.from('shipments').insert({
      order_id: o.id,
      carrier,
      tracking_no: tracking,
      status: 'shipped',
      shipped_at: new Date().toISOString(),
      recipient_name: o.contact_name,
      recipient_phone: o.phone,
      recipient_city: o.city,
      recipient_address: o.address,
    } as never);
    if (error) return toast.error(error.message);
    await supabase.from('orders').update({ status: 'shipped' }).eq('id', o.id);
    toast.success('تم إنشاء الشحنة');
    load();
  }

  return (
    <div className="space-y-5">
      <header className="a-page-header flex items-center justify-between">
        <div>
          <p className="a-crumbs">العمليات · التجهيز والشحن</p>
          <h1>عمليات المستودع</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
            الطلبات المدفوعة الجاهزة للتجهيز والشحن.
          </p>
        </div>
        <button className="a-btn a-btn-ghost" onClick={load}><RefreshCw className="w-4 h-4" /> تحديث</button>
      </header>

      <div className="flex gap-2">
        {(['to_pick', 'to_ship', 'shipped'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`a-btn ${tab === t ? 'a-btn-primary' : 'a-btn-ghost'}`}
          >
            {t === 'to_pick' ? 'للتجهيز' : t === 'to_ship' ? 'للشحن' : 'تم الشحن'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>لا توجد طلبات في هذا التبويب.</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">التاريخ</th>
                <th className="px-3 py-2 font-medium">العميل</th>
                <th className="px-3 py-2 font-medium">المدينة</th>
                <th className="px-3 py-2 font-medium">الإجمالي</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2 font-medium">التتبع</th>
                <th className="px-3 py-2 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const s = shipments[o.id];
                return (
                  <tr key={o.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                    <td className="px-3 py-2 text-xs">{new Date(o.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{o.contact_name || '—'}</div>
                      <div className="text-xs opacity-70">{o.company_name}</div>
                    </td>
                    <td className="px-3 py-2">{o.city || '—'}</td>
                    <td className="px-3 py-2 ltr-text">{o.grand_total_sar?.toFixed(2)}</td>
                    <td className="px-3 py-2"><span className="a-pill">{o.status}</span></td>
                    <td className="px-3 py-2 ltr-text text-xs">{s?.tracking_no || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {o.status === 'paid' && !s && (
                          <button className="a-btn a-btn-sm" onClick={() => markProcessing(o.id)}>
                            <PackageCheck className="w-3 h-3" /> تجهيز
                          </button>
                        )}
                        {(o.status === 'processing' || (!s?.tracking_no && o.status !== 'delivered')) && (
                          <button className="a-btn a-btn-sm a-btn-primary" onClick={() => createShipment(o)}>
                            <Truck className="w-3 h-3" /> شحن
                          </button>
                        )}
                        <button className="a-btn a-btn-sm a-btn-ghost" onClick={() => window.print()}>
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
