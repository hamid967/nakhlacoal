import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('inventory_items').select('*').order('sort_order');
    if (error) toast.error(error.message); else setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CATALOG</p>
          <h1 className="a-display text-4xl mt-1">المنتجات</h1>
          <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>{items.length} منتج · إدارة المخزون والأسعار</p>
        </div>
        <div className="flex gap-2">
          <button className="a-btn a-btn-ghost"><Sparkles className="w-4 h-4" /> توليد وصف AI</button>
          <Link to="/admin/inventory" className="a-btn a-btn-palm"><Plus className="w-4 h-4" /> إضافة منتج</Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="a-card p-5 h-44 animate-pulse" style={{ background: 'var(--a-surface-2)' }} />
        ))}
        {!loading && items.map((p) => {
          const tiers = Array.isArray(p.tiers) ? p.tiers : [];
          const minPrice = tiers.length ? Math.min(...tiers.map((t: any) => Number(t.pricePerKg ?? t.price_sar) || 0).filter(Boolean)) : 0;
          const stockLow = p.in_stock_kg < (p.min_order_kg || 0) * 5;
          return (
            <div key={p.id} className="a-card a-card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl grid place-items-center" style={{ background: 'var(--a-surface-2)', color: 'var(--a-palm)' }}>
                  <Package className="w-5 h-5" />
                </div>
                <span className={`a-pill ${p.active ? 'a-pill-green' : 'a-pill-rose'}`}>{p.active ? 'مفعّل' : 'موقوف'}</span>
              </div>
              <div className="a-display text-xl mt-3">{p.label}</div>
              <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>{p.slug}</div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <Cell label="المخزون" value={`${p.in_stock_kg} كجم`} warn={stockLow} />
                <Cell label="الأدنى" value={`${p.min_order_kg} كجم`} />
                <Cell label="من" value={`${minPrice || '—'} ر.س`} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span style={{ color: 'var(--a-text-muted)' }}>{tiers.length} شريحة سعرية</span>
                <Link to={`/products/${p.slug}`} className="inline-flex items-center gap-1" style={{ color: 'var(--a-palm)' }}>
                  معاينة <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Cell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-xl py-2 px-1" style={{ background: 'var(--a-surface-2)' }}>
      <div className="text-[10px]" style={{ color: 'var(--a-text-muted)' }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: warn ? 'hsl(var(--destructive))' : 'var(--a-text)' }}>{value}</div>
    </div>
  );
}
