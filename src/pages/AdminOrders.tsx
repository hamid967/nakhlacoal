import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Loader2, RefreshCw, Phone, Mail, Building2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type Order = {
  id: string;
  status: string;
  product_type: string;
  quantity: number;
  unit: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
  business_type: string | null;
  commercial_register: string | null;
  delivery_date: string | null;
  notes: string | null;
  ai_summary: string | null;
  created_at: string;
};

const STATUS_OPTIONS = ['new', 'contacted', 'confirmed', 'shipped', 'completed', 'cancelled'];
const STATUS_LABEL: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', confirmed: 'مؤكد',
  shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي',
};
const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('تم تحديث الحالة');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <>
      <SEO title="إدارة الطلبات" description="لوحة إدارة طلبات فحم النخلة" path="/admin/orders" noindex />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl">إدارة الطلبات</h1>
            <p className="text-muted-foreground text-sm mt-1">{orders.length} طلب إجمالي</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {s === 'all' ? 'الكل' : STATUS_LABEL[s]} {s !== 'all' && `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد طلبات</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(o => (
              <article key={o.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold">{o.company_name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] || 'bg-muted'}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
                      {' • '}#{o.id.slice(0, 8)}
                    </p>
                  </div>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">المنتج</div>
                    <div className="font-medium">{o.product_type}</div>
                    <div className="text-xs">{o.quantity} {o.unit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">المسؤول</div>
                    <div className="font-medium">{o.contact_name}</div>
                    <a href={`tel:${o.phone}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <Phone className="w-3 h-3" /> {o.phone}
                    </a>
                  </div>
                  {o.email && (
                    <div>
                      <div className="text-xs text-muted-foreground">البريد</div>
                      <a href={`mailto:${o.email}`} className="font-medium text-xs flex items-center gap-1 hover:underline break-all">
                        <Mail className="w-3 h-3 shrink-0" /> {o.email}
                      </a>
                    </div>
                  )}
                  {o.delivery_date && (
                    <div>
                      <div className="text-xs text-muted-foreground">التسليم</div>
                      <div className="font-medium text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {o.delivery_date}
                      </div>
                    </div>
                  )}
                </div>

                {(o.city || o.address || o.business_type || o.notes) && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                    {o.business_type && <div><strong>النشاط:</strong> {o.business_type}</div>}
                    {(o.city || o.address) && <div><strong>الموقع:</strong> {[o.city, o.address].filter(Boolean).join(' — ')}</div>}
                    {o.commercial_register && <div><strong>س.ت:</strong> {o.commercial_register}</div>}
                    {o.notes && <div><strong>ملاحظات:</strong> {o.notes}</div>}
                    {o.ai_summary && <div className="italic">"{o.ai_summary}"</div>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
