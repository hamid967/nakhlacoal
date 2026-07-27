import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader2, ScanBarcode, ShoppingCart, Trash2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Variant = { id: string; sku: string; label_en: string; label_ar: string; price: number; stock: number };
type Line = { variant: Variant; qty: number };

function PosInner() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Variant[]>([]);
  const [cart, setCart] = useState<Line[]>([]);
  const [searching, setSearching] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'mada' | 'stcpay'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      setSearching(true);
      const { data } = await supabase
        .from('product_variants')
        .select('id,sku,label_en,label_ar,price,stock')
        .or(`sku.ilike.%${q}%,label_ar.ilike.%${q}%,label_en.ilike.%${q}%`)
        .eq('is_active', true)
        .limit(12);
      setResults((data ?? []) as Variant[]);
      setSearching(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const add = (v: Variant) => {
    const idx = cart.findIndex((l) => l.variant.id === v.id);
    if (idx >= 0) {
      const next = [...cart];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      setCart(next);
    } else {
      setCart([...cart, { variant: v, qty: 1 }]);
    }
    setQ('');
    setResults([]);
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return setCart(cart.filter((l) => l.variant.id !== id));
    setCart(cart.map((l) => (l.variant.id === id ? { ...l, qty } : l)));
  };

  const subtotal = cart.reduce((s, l) => s + l.variant.price * l.qty, 0);
  const vat = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  const change = payMethod === 'cash' && cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;

  const checkout = async () => {
    if (cart.length === 0 || !user) return;
    setCheckingOut(true);
    try {
      // Find or open a shift for this cashier
      let { data: shift } = await supabase
        .from('pos_shifts')
        .select('id,register_id')
        .eq('cashier_id', user.id)
        .eq('status', 'open')
        .limit(1)
        .maybeSingle();

      if (!shift) {
        const { data: reg } = await supabase.from('pos_registers').select('id').eq('active', true).limit(1).maybeSingle();
        if (!reg) throw new Error('لا توجد سجلات نقطة بيع نشطة. أنشئ سجلاً من لوحة التحكم أولاً.');
        const { data: newShift, error } = await supabase
          .from('pos_shifts')
          .insert({ register_id: reg.id, cashier_id: user.id, opening_cash_sar: 0 })
          .select('id,register_id')
          .single();
        if (error) throw error;
        shift = newShift;
      }

      const { error: saleErr } = await supabase.from('pos_sales').insert({
        shift_id: shift.id,
        payment_method: payMethod,
        amount_sar: total,
        vat_amount_sar: vat,
        cash_received_sar: payMethod === 'cash' ? parseFloat(cashReceived || '0') : null,
        change_sar: payMethod === 'cash' ? change : null,
      });
      if (saleErr) throw saleErr;

      // Decrement stock
      await Promise.all(cart.map((l) =>
        supabase.from('product_variants').update({ stock: Math.max(0, l.variant.stock - l.qty) }).eq('id', l.variant.id)
      ));

      toast({ title: 'تمت البيعة بنجاح', description: `${total.toFixed(2)} ر.س` });
      setCart([]);
      setCashReceived('');
    } catch (e) {
      toast({ title: 'فشلت العملية', description: e instanceof Error ? e.message : 'خطأ', variant: 'destructive' });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-dvh" style={{ background: 'var(--a-bg)' }}>
      <div className="grid md:grid-cols-[1fr_420px] min-h-dvh">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ScanBarcode className="w-6 h-6" />
            <h1 className="a-display text-2xl">نقطة البيع — POS</h1>
          </div>
          <div className="relative mb-4">
            <input
              autoFocus
              className="a-input w-full text-lg py-4"
              placeholder="ابحث بالباركود أو SKU أو الاسم…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {results.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 a-card max-h-80 overflow-y-auto z-10">
                {results.map((r) => (
                  <button key={r.id} onClick={() => add(r)} className="w-full text-start p-3 hover:bg-black/5 border-b flex justify-between" style={{ borderColor: 'var(--a-border)' }}>
                    <div>
                      <div className="font-medium">{r.label_ar || r.label_en}</div>
                      <div className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{r.sku} · متوفر: {r.stock}</div>
                    </div>
                    <div className="font-semibold">{r.price} ر.س</div>
                  </button>
                ))}
              </div>
            )}
            {searching && <Loader2 className="w-4 h-4 animate-spin absolute end-3 top-1/2 -translate-y-1/2" />}
          </div>

          <div className="a-card overflow-hidden">
            <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--a-border)' }}>
              <ShoppingCart className="w-4 h-4" /><span className="font-semibold">السلة ({cart.length})</span>
            </div>
            {cart.length === 0 ? (
              <div className="p-12 text-center" style={{ color: 'var(--a-text-muted)' }}>ابدأ بمسح منتج</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {cart.map((l) => (
                    <tr key={l.variant.id} className="border-b" style={{ borderColor: 'var(--a-border)' }}>
                      <td className="p-3">
                        <div className="font-medium">{l.variant.label_ar || l.variant.label_en}</div>
                        <div className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{l.variant.sku}</div>
                      </td>
                      <td className="p-3 w-32">
                        <div className="flex items-center gap-1">
                          <button className="a-btn text-xs w-8" onClick={() => setQty(l.variant.id, l.qty - 1)}>−</button>
                          <span className="w-8 text-center font-mono">{l.qty}</span>
                          <button className="a-btn text-xs w-8" onClick={() => setQty(l.variant.id, l.qty + 1)}>+</button>
                        </div>
                      </td>
                      <td className="p-3 w-24 text-end font-semibold">{(l.variant.price * l.qty).toFixed(2)}</td>
                      <td className="p-3 w-10"><button onClick={() => setQty(l.variant.id, 0)}><Trash2 className="w-4 h-4 text-red-500" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="a-card m-4 p-6 space-y-4 sticky top-4 self-start">
          <div className="space-y-2">
            <div className="flex justify-between"><span>الإجمالي قبل الضريبة</span><span className="font-mono">{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--a-text-muted)' }}><span>ضريبة 15%</span><span className="font-mono">{vat.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t pt-2" style={{ borderColor: 'var(--a-border)' }}><span>الإجمالي</span><span className="font-mono">{total.toFixed(2)} ر.س</span></div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">طريقة الدفع</label>
            <div className="grid grid-cols-2 gap-2">
              {(['cash', 'card', 'mada', 'stcpay'] as const).map((m) => (
                <button key={m} onClick={() => setPayMethod(m)}
                  className={`a-btn ${payMethod === m ? 'a-btn-primary' : ''}`}>{m === 'cash' ? 'نقدي' : m === 'card' ? 'بطاقة' : m === 'mada' ? 'مدى' : 'STCPay'}</button>
              ))}
            </div>
          </div>

          {payMethod === 'cash' && (
            <>
              <input type="number" className="a-input w-full" placeholder="المبلغ المستلم" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} />
              <div className="flex justify-between text-sm"><span>الباقي</span><span className="font-mono font-bold">{change.toFixed(2)} ر.س</span></div>
            </>
          )}

          <button
            disabled={cart.length === 0 || checkingOut}
            onClick={checkout}
            className="a-btn a-btn-primary w-full py-4 text-lg"
          >
            {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إتمام البيع'}
          </button>
          <button onClick={() => setCart([])} className="a-btn w-full">
            <X className="w-4 h-4" />إلغاء السلة
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pos() {
  return (
    <ProtectedRoute requireAnyRole={['admin', 'super_admin', 'manager', 'sales']}>
      <PosInner />
    </ProtectedRoute>
  );
}
