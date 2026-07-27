import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdminNotification = {
  id: string;
  title: string;
  body: string | null;
  severity: 'info' | 'success' | 'warning' | 'critical';
  kind: string;
  link: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

export function useAdminNotifications(limit = 50) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    setItems((data as AdminNotification[]) ?? []);
    setLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('admin_notifications_live')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'admin_notifications' },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const unread = items.filter((n) => !n.read_at).length;

  const markRead = useCallback(async (id: string) => {
    await supabase.from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id).is('read_at', null);
    load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    await supabase.from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);
    load();
  }, [load]);

  return { items, unread, loading, reload: load, markRead, markAllRead };
}
