import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { bestPrice, VAT_RATE } from '@/data/pricing';

export type CartUnit = 'kg' | 'carton' | 'ton';
export type CartItem = {
  slug: string;
  nameAr: string;
  nameEn: string;
  image?: string;
  qty: number;
  unit: CartUnit;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  vat: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'palmcharcoal_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const subtotal = items.reduce((s, i) => s + bestPrice(i.slug, i.qty, i.unit) * i.qty, 0);
    const vat = subtotal * VAT_RATE;
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      vat,
      total: subtotal + vat,
      add: (it) => setItems((prev) => {
        const idx = prev.findIndex((p) => p.slug === it.slug && p.unit === it.unit);
        const qty = it.qty ?? 1;
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [...prev, { ...it, qty }];
      }),
      remove: (slug) => setItems((p) => p.filter((i) => i.slug !== slug)),
      setQty: (slug, qty) => setItems((p) => p.map((i) => i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)),
      clear: () => setItems([]),
      open,
      setOpen,
    };
  }, [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart must be used within CartProvider');
  return v;
}
