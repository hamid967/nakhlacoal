import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Truck, Package, CheckCircle2, Clock, XCircle, RotateCcw,
  ExternalLink, ArrowRight, Loader2, MapPin, User, FileText,
} from 'lucide-react';

type Shipment = any;
type Order = any;
type Customer = any;

const statusLabel: Record<string, string> = {
  preparing: 'قيد التجهيز', shipped: 'تم الشحن', out_for_delivery: 'خارج للتوصيل',
  delivered: 'تم التسليم', returned: 'مرتجعة', cancelled: 'ملغاة',
};
const statusColor: Record<string, string> = {
  preparing: '#9ca3af', shipped: '#2563eb', out_for_delivery: '#d97706',
  delivered: '#16a34a', returned: '#dc2626', cancelled: '#6b7280',
};
const statusIcon: Record<string, any> = {
  preparing: Package, shipped: Truck, out_for_delivery: Truck,
  delivered: CheckCircle2, returned: RotateCcw, cancelled: XCircle,
};

export default function ShipmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      const { data: s } = await supabase
        .from('shipments').select('*').eq('id', id)
        .eq('customer_user_id', user.id).maybeSingle();
      setShipment(s);
      if (s?.order_id) {
        const { data: o } = await supabase.from('orders').select('*').eq('id', s.order_id).maybeSingle();
        setOrder(o);
      }
      if (s?.customer_user_id) {
        const { data: c } = await supabase.from('customers').select('*')
          .eq('user_id', s.customer_user_id).maybeSingle();
        setCustomer(c);
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) {
    return <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;
  }
  if (!shipment) {
    return (
      <div className="p-10 text-center rounded-xl border"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
        لم يتم العثور على الشحنة
        <div className="mt-3"><Link to="/portal/shipments" className="text-sm underline">العودة للشحنات</Link></div>
      </div>
    );
  }

  // Build timeline from available timestamps
  const events: { key: string; label: string; at: string | null; color: string; Icon: any }[] = [
    { key: 'created', label: 'تم إنشاء الشحنة', at: shipment.created_at, color: '#9ca3af', Icon: Package },
    { key: 'shipped', label: 'تم الشحن', at: shipment.shipped_at, color: statusColor.shipped, Icon: Truck },
    { key: 'delivered', label: 'تم التسليم', at: shipment.delivered_at, color: statusColor.delivered, Icon: CheckCircle2 },
  ];
  if (shipment.status === 'returned') {
    events.push({ key: 'returned', label: 'تم الإرجاع', at: shipment.updated_at, color: statusColor.returned, Icon: RotateCcw });
  }
  if (shipment.status === 'cancelled') {
    events.push({ key: 'cancelled', label: 'تم الإلغاء', at: shipment.updated_at, color: statusColor.cancelled, Icon: XCircle });
  }
  const timeline = events.filter((e) => e.at).sort((a, b) => +new Date(a.at!) - +new Date(b.at!));

  const Icon = statusIcon[shipment.status] || Package;
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-6">
      <Link to="/portal/shipments" className="inline-flex items-center gap-1 text-sm"
        style={{ color: 'var(--a-text-muted)' }}>
        <ArrowRight className="h-4 w-4" /> العودة للشحنات
      </Link>

      <header className="rounded-2xl border p-5 flex flex-wrap items-start justify-between gap-4"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl grid place-items-center text-white"
            style={{ background: statusColor[shipment.status] }}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>
              SHIPMENT · {shipment.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="a-display text-3xl mt-1">{shipment.carrier}</h1>
            {shipment.tracking_no && (
              <div className="text-xs font-mono mt-1" style={{ color: 'var(--a-text-muted)' }}>
                {shipment.tracking_no}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs text-white"
            style={{ background: statusColor[shipment.status] }}>
            {statusLabel[shipment.status]}
          </span>
          {shipment.tracking_url && (
            <a href={shipment.tracking_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border"
              style={{ borderColor: 'var(--a-border)' }}>
              تتبع لدى الناقل <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <section className="lg:col-span-2 rounded-2xl border p-5"
          style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" /> سجل تغييرات الحالة
          </h2>
          {timeline.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>لا توجد تحديثات بعد</p>
          ) : (
            <ol className="relative border-s-2 ps-5 space-y-5" style={{ borderColor: 'var(--a-border)' }}>
              {timeline.map((e, i) => (
                <li key={e.key} className="relative">
                  <span className="absolute -start-[27px] top-1 w-4 h-4 rounded-full ring-4"
                    style={{ background: e.color, boxShadow: '0 0 0 4px var(--a-surface)' }} />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <e.Icon className="h-4 w-4" style={{ color: e.color }} />
                      {e.label}
                    </div>
                    <time className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{fmt(e.at)}</time>
                  </div>
                  {i === timeline.length - 1 && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--a-text-muted)' }}>
                      آخر تحديث
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Sidebar: relations + details */}
        <aside className="space-y-4">
          {order && (
            <Card title="الطلب المرتبط" Icon={FileText}>
              <Link to={`/portal/orders/${order.id}`} className="block group">
                <div className="text-sm font-medium group-hover:underline">
                  طلب #{String(order.id).slice(0, 8).toUpperCase()}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
                  {order.product_type || '—'} · {order.quantity || 0} {order.unit || ''}
                </div>
                {order.grand_total_sar && (
                  <div className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
                    الإجمالي: {Number(order.grand_total_sar).toLocaleString('ar-SA')} ر.س
                  </div>
                )}
              </Link>
            </Card>
          )}

          {customer && (
            <Card title="بيانات العميل" Icon={User}>
              <div className="text-sm font-medium">{customer.contact_person || customer.company_name || '—'}</div>
              {customer.company_name && customer.contact_person && (
                <div className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{customer.company_name}</div>
              )}
              {customer.phone && <div className="text-xs mt-1">{customer.phone}</div>}
              {customer.email && <div className="text-xs">{customer.email}</div>}
              <Link to="/portal/profile" className="text-xs underline mt-2 inline-block"
                style={{ color: 'var(--a-text-muted)' }}>
                إدارة بياناتي
              </Link>
            </Card>
          )}

          <Card title="الوجهة" Icon={MapPin}>
            <div className="text-sm">{shipment.destination_city || '—'}</div>
            {shipment.destination_address && (
              <div className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
                {shipment.destination_address}
              </div>
            )}
            {shipment.recipient_name && (
              <div className="text-xs mt-2">المستلم: {shipment.recipient_name}</div>
            )}
            {shipment.recipient_phone && (
              <div className="text-xs">{shipment.recipient_phone}</div>
            )}
          </Card>

          <Card title="تفاصيل الشحنة" Icon={Package}>
            <Row k="الناقل" v={shipment.carrier} />
            <Row k="الوزن" v={shipment.weight_kg ? `${shipment.weight_kg} كجم` : '—'} />
            <Row k="من" v={shipment.origin_city || '—'} />
            <Row k="تكلفة الشحن" v={shipment.shipping_cost_sar ? `${shipment.shipping_cost_sar} ر.س` : '—'} />
          </Card>
        </aside>
      </div>

      {shipment.notes && (
        <div className="rounded-xl border p-4 text-sm"
          style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--a-text-muted)' }}>ملاحظات</div>
          {shipment.notes}
        </div>
      )}
    </div>
  );
}

function Card({ title, Icon, children }: { title: string; Icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
      <h3 className="text-xs font-semibold flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h3>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span style={{ color: 'var(--a-text-muted)' }}>{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
