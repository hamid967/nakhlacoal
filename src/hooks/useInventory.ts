import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { INVENTORY, type InventoryItem } from '@/data/inventory';

type DbRow = {
  id: string;
  slug: string;
  label: string;
  match_pattern: string;
  in_stock_kg: number;
  min_order_kg: number;
  lead_days: number;
  tiers: { minKg: number; pricePerKg: number }[];
  sort_order: number;
  active: boolean;
};

export type DbInventoryItem = InventoryItem & { id: string; slug: string; sortOrder: number; active: boolean };

function rowToItem(r: DbRow): DbInventoryItem {
  return {
    id: r.id,
    slug: r.slug,
    label: r.label,
    match: new RegExp(r.match_pattern, 'i'),
    inStockKg: Number(r.in_stock_kg),
    minOrderKg: Number(r.min_order_kg),
    leadDays: Number(r.lead_days),
    tiers: Array.isArray(r.tiers) ? r.tiers : [],
    sortOrder: r.sort_order,
    active: r.active,
  };
}

export function useInventory() {
  const [items, setItems] = useState<DbInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      setError(error.message);
      // fallback to static catalog
      setItems(INVENTORY.map((i, idx) => ({ ...i, id: String(idx), slug: String(idx), sortOrder: idx, active: true })));
    } else {
      setItems(((data ?? []) as unknown as DbRow[]).map(rowToItem));
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return { items, loading, error, reload: load };
}
