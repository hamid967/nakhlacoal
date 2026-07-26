import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addToCart } from '@/lib/cart';
import { toast } from '@/hooks/use-toast';

type Line = { sku: string; qty: number; status?: 'ok' | 'not_found' | 'oos'; variantId?: string; price?: number; label?: string };

export default function BulkOrder() {
  const [raw, setRaw] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);

  const total = useMemo(
    () => lines.reduce((s, l) => s + (l.status === 'ok' ? (l.price ?? 0) * l.qty : 0), 0),
    [lines],
  );

  const parse = () => {
    const parsed: Line[] = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [sku, qty] = line.split(/[,\s\t;]+/);
        return { sku: (sku ?? '').trim(), qty: Math.max(1, parseInt(qty ?? '1', 10) || 1) };
      })
      .filter((l) => l.sku);
    setLines(parsed);
  };

  const validate = async () => {
    if (!lines.length) return;
    setBusy(true);
    const skus = lines.map((l) => l.sku);
    const { data } = await supabase
      .from('product_variants')
      .select('id, sku, label_ar, price, stock')
      .in('sku', skus);
    const bySku = Object.fromEntries((data ?? []).map((v) => [v.sku, v]));

    const enriched: Line[] = await Promise.all(
      lines.map(async (l) => {
        const v = bySku[l.sku];
        if (!v) return { ...l, status: 'not_found' };
        if (v.stock < l.qty) return { ...l, status: 'oos', variantId: v.id, label: v.label_ar, price: v.price };
        const { data: p } = await supabase.rpc('get_wholesale_price', { _variant_id: v.id, _qty: l.qty });
        const price = p?.[0]?.price_sar ?? v.price;
        return { ...l, status: 'ok', variantId: v.id, label: v.label_ar, price };
      }),
    );
    setLines(enriched);
    setBusy(false);
  };

  const addAll = async () => {
    setBusy(true);
    try {
      for (const l of lines) {
        if (l.status === 'ok' && l.variantId) {
          await addToCart({ variantId: l.variantId, unitPrice: l.price ?? 0, qty: l.qty });
        }
      }
      toast({ title: 'تمت الإضافة إلى السلة', description: `${lines.filter((l) => l.status === 'ok').length} صنف` });
    } catch (e: any) {
      toast({ title: 'خطأ', description: e?.message ?? 'حدث خطأ', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">طلب بالجملة</h1>
      <p className="text-sm text-muted-foreground mb-4">
        أدخل SKU والكمية في كل سطر. مثال: <code>PC-KG-05 20</code> أو <code>PC-KG-05,20</code>.
      </p>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={'PC-KG-05 20\nPC-CART-10 50'}
        className="w-full h-40 p-3 rounded-xl border font-mono text-sm"
      />

      <div className="flex gap-2 mt-3">
        <button onClick={parse} className="px-4 py-2 rounded-lg border">تحليل</button>
        <button onClick={validate} disabled={!lines.length || busy} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
          تحقق من المخزون والسعر
        </button>
        <button onClick={addAll} disabled={!lines.some((l) => l.status === 'ok') || busy} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
          إضافة الكل للسلة
        </button>
      </div>

      {lines.length > 0 && (
        <div className="mt-5 overflow-x-auto a-glass rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-start">SKU</th>
                <th className="p-3 text-start">المنتج</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">السعر</th>
                <th className="p-3">الإجمالي</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3 font-mono">{l.sku}</td>
                  <td className="p-3">{l.label ?? '—'}</td>
                  <td className="p-3 text-center">{l.qty}</td>
                  <td className="p-3 text-center">{l.price?.toFixed(2) ?? '—'}</td>
                  <td className="p-3 text-center">{l.price ? (l.price * l.qty).toFixed(2) : '—'}</td>
                  <td className="p-3 text-center">
                    {l.status === 'ok' && <span className="a-pill">جاهز</span>}
                    {l.status === 'not_found' && <span className="a-pill text-red-600">غير موجود</span>}
                    {l.status === 'oos' && <span className="a-pill text-amber-700">غير كافٍ</span>}
                    {!l.status && '—'}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={4} className="p-3 text-end">الإجمالي التقديري</td>
                <td className="p-3 text-center text-primary">{total.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
