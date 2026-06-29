import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LabReport = {
  id: string;
  batch_code: string;
  carbon_pct: number;
  ash_pct: number;
  moisture_pct: number;
  burn_time_min: number;
  max_temp_c: number;
  volatile_pct: number;
  notes: string | null;
  created_at: string;
};

export function useLiveLabReport() {
  const [latest, setLatest] = useState<LabReport | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());

  useEffect(() => {
    let mounted = true;

    const fetchLatest = async () => {
      const { data } = await supabase
        .from('lab_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mounted && data) {
        setLatest(data as LabReport);
        setUpdatedAt(Date.now());
      }
    };

    fetchLatest();

    const channel = supabase
      .channel('lab_reports-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lab_reports' },
        () => fetchLatest(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { latest, updatedAt };
}
