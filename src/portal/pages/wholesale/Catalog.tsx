import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Row = {
  id: string;
  sku: string;
  label_ar: string;
  price: number;
  stock: number;
  ws_price?: number;
  ws_source?: string;
};

export default function WholesaleCatalog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('product_variants')
        .select('id, sku, label_ar, price, stock, is_active')
        .eq('is_active', true)
        .order('sku')
        .limit(200);
      const base = (data ?? []) as Row[];
      const priced = await Promise.all(
        base.map(async (r) => {
          const { data: p } = await supabase.rpc('get_wholesale_price', { _variant_id: r.id, _qty: 1 });
          const first = p && p[0];
          return { ...r, ws_price: first?.price_sar, ws_source: first?.source };
        }),
      );
      setRows(priced);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">جاري التحميل…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">كتالوج الجملة</h1>
      <div className="overflow-x-auto a-glass rounded-xl">
        <table className="w-full text-sm">
          <thead className="text-start">
            <tr className="border-b">
              <th className="p-3 text-start">SKU</th>
              <th className="p-3 text-start">المنتج</th>
              <th className="p-3">التجزئة</th>
              <th className="p-3">سعر الجملة</th>
              <th className="p-3">التوفر</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-black/5">
                <td className="p-3 font-mono text-xs">{r.sku}</td>
                <td className="p-3">{r.label_ar}</td>
                <td className="p-3 text-center">{r.price.toFixed(2)}</td>
                <td className="p-3 text-center font-bold text-primary">
                  {(r.ws_price ?? r.price).toFixed(2)}
                  {r.ws_source === 'wholesale' && <span className="ms-1 text-[10px] a-pill">جملة</span>}
                </td>
                <td className="p-3 text-center">{r.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
