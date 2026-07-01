import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, vat, total, count } = useCart();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const fmt = (n: number) => new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-US', { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={isAr ? 'سلة الشراء' : 'Shopping cart'}>
      <button
        type="button"
        aria-label={isAr ? 'إغلاق' : 'Close'}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <aside
        className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-[hsl(var(--background))] border-s border-[hsl(var(--gold-hi)/0.3)] shadow-2xl flex flex-col`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <header className="flex items-center justify-between p-4 border-b border-[hsl(var(--gold-hi)/0.2)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[hsl(var(--gold-hi))]" />
            <h2 className="font-display text-lg">{isAr ? 'سلة الشراء' : 'Your Cart'} ({count})</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{isAr ? 'سلتك فارغة' : 'Your cart is empty'}</p>
              <Link to="/products" onClick={() => setOpen(false)} className="inline-block mt-4 text-[hsl(var(--gold-hi))] underline underline-offset-4">
                {isAr ? 'تصفح المنتجات' : 'Browse products'}
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.slug + it.unit} className="flex gap-3 p-3 rounded-xl border border-[hsl(var(--gold-hi)/0.15)] bg-[hsl(var(--card))]">
                {it.image && <img src={it.image} alt="" className="w-16 h-16 rounded-lg object-cover" loading="lazy" decoding="async" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{isAr ? it.nameAr : it.nameEn}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{it.unit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setQty(it.slug, it.qty - 1)} className="p-1 rounded border" aria-label="−"><Minus className="w-3 h-3" /></button>
                    <span className="min-w-8 text-center text-sm font-bold">{it.qty}</span>
                    <button onClick={() => setQty(it.slug, it.qty + 1)} className="p-1 rounded border" aria-label="+"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => remove(it.slug)} className="ms-auto p-1 text-red-500 hover:bg-red-500/10 rounded" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-[hsl(var(--gold-hi)/0.2)] p-4 space-y-2 bg-[hsl(var(--card))]">
            <div className="flex justify-between text-sm"><span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{fmt(subtotal)} {isAr ? 'ر.س' : 'SAR'}</span></div>
            <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]"><span>{isAr ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span><span>{fmt(vat)} {isAr ? 'ر.س' : 'SAR'}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[hsl(var(--gold-hi)/0.2)]"><span>{isAr ? 'الإجمالي' : 'Total'}</span><span className="text-[hsl(var(--gold-hi))]">{fmt(total)} {isAr ? 'ر.س' : 'SAR'}</span></div>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="block w-full text-center mt-3 py-3 rounded-xl bg-[hsl(var(--gold-hi))] text-[hsl(var(--ink))] font-bold hover:opacity-90 transition"
            >
              {isAr ? 'إتمام الطلب' : 'Checkout'}
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
