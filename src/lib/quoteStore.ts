// LocalStorage-backed saved quotes (scoped by user id when logged in).
import { supabase } from '@/integrations/supabase/client';

export type SavedQuoteLine = { slug: string; qty: number; unit: 'kg' | 'carton' | 'ton'; unitPrice: number; lineTotal: number };
export type SavedQuoteCustomer = { name: string; phone: string; email?: string; company?: string; city?: string };
export type SavedQuote = {
  id: string;
  createdAt: number;
  channel: 'whatsapp' | 'email';
  customer: SavedQuoteCustomer;
  items: SavedQuoteLine[];
  subtotal: number;
  vat: number;
  total: number;
};

const BASE_KEY = 'palm:saved-quotes';

async function storageKey(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    return uid ? `${BASE_KEY}:${uid}` : BASE_KEY;
  } catch {
    return BASE_KEY;
  }
}

export async function listQuotes(): Promise<SavedQuote[]> {
  const key = await storageKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedQuote[];
    return Array.isArray(arr) ? arr.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

export async function saveQuote(q: Omit<SavedQuote, 'id' | 'createdAt'>): Promise<SavedQuote> {
  const key = await storageKey();
  const full: SavedQuote = { ...q, id: crypto.randomUUID(), createdAt: Date.now() };
  const current = await listQuotes();
  const next = [full, ...current].slice(0, 100); // cap
  localStorage.setItem(key, JSON.stringify(next));
  return full;
}

export async function deleteQuote(id: string): Promise<void> {
  const key = await storageKey();
  const current = await listQuotes();
  localStorage.setItem(key, JSON.stringify(current.filter((q) => q.id !== id)));
}

export async function clearQuotes(): Promise<void> {
  const key = await storageKey();
  localStorage.removeItem(key);
}
