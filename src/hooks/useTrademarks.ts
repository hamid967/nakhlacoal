import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trademarks as fallback, type Trademark } from '@/data/trademarks';
import tm0 from '@/assets/trademarks/trademark-0.png';
import tm1 from '@/assets/trademarks/trademark-1.png';
import tm2 from '@/assets/trademarks/trademark-2.png';
import tm3 from '@/assets/trademarks/trademark-3.png';
import tm4 from '@/assets/trademarks/trademark-4.png';

const imageById: Record<string, string> = {
  'palm-charcoal': tm0,
  nakhlan: tm1,
  'al-markaz': tm2,
  'al-nakhlatain': tm3,
  baashen: tm4,
};

const mapRow = (r: any): Trademark => ({
  id: r.id,
  registrationNo: r.registration_no,
  nameAr: r.name_ar,
  nameEn: r.name_en,
  niceClass: r.nice_class,
  filedHijri: r.filed_hijri ?? '',
  registeredHijri: r.registered_hijri ?? '',
  expiresHijri: r.expires_hijri ?? '',
  ownerAr: r.owner_ar ?? '',
  addressAr: r.address_ar ?? '',
  countryAr: r.country_ar ?? '',
  descriptionAr: r.description_ar ?? '',
  goodsAr: r.goods_ar ?? '',
  colors: r.colors ?? [],
  image: imageById[r.id] ?? tm0,
});

const sortItems = (a: any, b: any) =>
  (a._sort ?? 0) - (b._sort ?? 0) || a.id.localeCompare(b.id);

export type SyncStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'offline';

export function useTrademarks() {
  const [items, setItems] = useState<Trademark[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // Track row versions to resolve out-of-order realtime events (last-write-wins by updated_at).
  const versionsRef = useRef<Map<string, number>>(new Map());
  const rowsRef = useRef<Map<string, { row: any; sort: number }>>(new Map());

  const commit = useCallback(() => {
    const list = Array.from(rowsRef.current.values())
      .filter((v) => v.row.is_active !== false)
      .sort((a, b) => a.sort - b.sort || String(a.row.id).localeCompare(String(b.row.id)))
      .map((v) => mapRow(v.row));
    if (list.length) setItems(list);
  }, []);

  const versionOf = (r: any) =>
    r?.updated_at ? new Date(r.updated_at).getTime() : Date.now();

  const upsertRow = useCallback((r: any) => {
    const v = versionOf(r);
    const prev = versionsRef.current.get(r.id) ?? 0;
    if (v < prev) return; // stale event — ignore (conflict resolution)
    versionsRef.current.set(r.id, v);
    rowsRef.current.set(r.id, { row: r, sort: r.sort_order ?? 0 });
    commit();
  }, [commit]);

  const deleteRow = useCallback((id: string) => {
    rowsRef.current.delete(id);
    versionsRef.current.delete(id);
    commit();
  }, [commit]);

  const load = useCallback(async () => {
    setSyncing(true);
    const { data, error } = await supabase
      .from('trademarks')
      .select('*')
      .order('sort_order', { ascending: true });
    setSyncing(false);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    rowsRef.current.clear();
    versionsRef.current.clear();
    (data ?? []).forEach((r: any) => {
      versionsRef.current.set(r.id, versionOf(r));
      rowsRef.current.set(r.id, { row: r, sort: r.sort_order ?? 0 });
    });
    setError(null);
    commit();
    setLoading(false);
  }, [commit]);

  useEffect(() => {
    let cancelled = false;
    setStatus('connecting');
    load().catch((e) => !cancelled && setError(String(e?.message ?? e)));

    const channel = supabase
      .channel('trademarks-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trademarks' },
        (p) => upsertRow(p.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trademarks' },
        (p) => upsertRow(p.new))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trademarks' },
        (p) => deleteRow((p.old as any).id))
      .subscribe((s) => {
        if (cancelled) return;
        if (s === 'SUBSCRIBED') setStatus('live');
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          setStatus('reconnecting');
          setError('انقطع الاتصال — جاري إعادة المزامنة');
          load().catch(() => {});
        } else if (s === 'CLOSED') setStatus('offline');
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [load, upsertRow, deleteRow]);

  return { trademarks: items, loading, syncing, status, error, refetch: load };
}
