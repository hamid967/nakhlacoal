import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// P75 poor-thresholds (Google CWV).
const POOR: Record<string, number> = { LCP: 4000, INP: 500, CLS: 0.25, FCP: 3000, TTFB: 1800 };
const CHECK_MS = 5 * 60_000;
const MIN_SAMPLES = 20;
const NOTIFY_KEY = 'admin-vitals-alert-until';

function p75(vs: number[]) {
  if (!vs.length) return 0;
  const s = [...vs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * 0.75))];
}

export function useVitalsAlerts() {
  const ran = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function check() {
      const since = new Date(Date.now() - 60 * 60_000).toISOString(); // last hour
      const { data, error } = await supabase
        .from('web_vitals')
        .select('metric_name,metric_value')
        .gte('created_at', since)
        .limit(5000);
      if (cancelled || error || !data?.length) return;

      const buckets: Record<string, number[]> = {};
      for (const r of data) {
        (buckets[r.metric_name] ||= []).push(Number(r.metric_value));
      }

      const bad = Object.entries(buckets)
        .filter(([m, vs]) => vs.length >= MIN_SAMPLES && POOR[m] && p75(vs) > POOR[m])
        .map(([m, vs]) => ({ m, val: p75(vs), n: vs.length }));

      if (!bad.length) return;

      // throttle: once per 30 min per session
      const until = Number(sessionStorage.getItem(NOTIFY_KEY) || 0);
      if (Date.now() < until) return;
      sessionStorage.setItem(NOTIFY_KEY, String(Date.now() + 30 * 60_000));

      const summary = bad
        .map(b => `${b.m} ${b.m === 'CLS' ? b.val.toFixed(3) : Math.round(b.val) + 'ms'}`)
        .join(' · ');

      toast.error('تدهور في أداء الويب', {
        description: `آخر ساعة تجاوزت العتبات: ${summary}`,
        duration: 15000,
        action: {
          label: 'عرض التفاصيل',
          onClick: () => { window.location.href = '/admin/web-vitals'; },
        },
      });
    }
    if (!ran.current) {
      ran.current = true;
      check();
    }
    const id = setInterval(check, CHECK_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);
}
