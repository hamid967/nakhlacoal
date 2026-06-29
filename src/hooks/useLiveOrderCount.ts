import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Live count of orders. Starts from a stored count and updates via Realtime.
 * Falls back silently to the initial fetched value if Realtime is unavailable.
 */
export function useLiveOrderCount(fallback = 0) {
  const [count, setCount] = useState<number>(fallback);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { count: c } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (!cancelled && typeof c === 'number') setCount(c);
    })();

    const channel = supabase
      .channel('home-orders-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => setCount((c) => c + 1),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
