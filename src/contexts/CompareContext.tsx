import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

const STORAGE_KEY = 'palm-charcoal-compare';
const MAX_ITEMS = 4;

type Ctx = {
  items: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  isFull: boolean;
};

const CompareContext = createContext<Ctx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const toggle = useCallback((slug: string) => {
    setItems((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, slug];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((slug: string) => items.includes(slug), [items]);

  return (
    <CompareContext.Provider value={{ items, toggle, remove, clear, has, isFull: items.length >= MAX_ITEMS }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
