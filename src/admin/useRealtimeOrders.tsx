import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Admin-only Realtime listener for new orders.
 * Ignores rows created before mount (avoids replay noise on refresh),
 * throttles duplicate toasts via a Set, and cleans up the channel on unmount.
 */
export function useRealtimeOrders() {
  const navigate = useNavigate();
  const seen = useRef<Set<string>>(new Set());
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const row = payload.new as { id?: string; created_at?: string; product_type?: string; company_name?: string; contact_name?: string };
          if (!row?.id || seen.current.has(row.id)) return;
          if (row.created_at && new Date(row.created_at).getTime() < mountedAt.current - 5000) return;
          seen.current.add(row.id);

          try { new Audio('/notification.mp3').play().catch(() => {}); } catch { /* noop */ }

          toast({
            title: '🔔 طلب جديد',
            description: `${row.product_type || 'منتج'} · ${row.company_name || row.contact_name || 'عميل'}`,
            duration: 8000,
            action: (
              <button
                onClick={() => navigate(`/admin/orders?highlight=${row.id}`)}
                className="text-xs font-semibold underline"
              >
                عرض
              </button>
            ) as any,
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [navigate]);
}
