import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Activity, Gauge, MousePointerClick, Timer, Layers } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar,
} from 'recharts';

type Row = {
  metric_name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
  metric_value: number;
  rating: string | null;
  path: string;
  created_at: string;
};

const METRICS = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'] as const;
type MetricName = typeof METRICS[number];

const META: Record<MetricName, { label: string; icon: any; unit: string; good: number; poor: number }> = {
  LCP:  { label: 'Largest Contentful Paint', icon: Layers,             unit: 'ms', good: 2500, poor: 4000 },
  INP:  { label: 'Interaction to Next Paint', icon: MousePointerClick, unit: 'ms', good: 200,  poor: 500 },
  CLS:  { label: 'Cumulative Layout Shift',   icon: Activity,          unit: '',   good: 0.1,  poor: 0.25 },
  FCP:  { label: 'First Contentful Paint',    icon: Gauge,             unit: 'ms', good: 1800, poor: 3000 },
  TTFB: { label: 'Time to First Byte',        icon: Timer,             unit: 'ms', good: 800,  poor: 1800 },
};

const PERIODS = [
  { value: 1,  label: '٢٤ ساعة' },
  { value: 7,  label: '٧ أيام' },
  { value: 30, label: '٣٠ يوم' },
  { value: 90, label: '٩٠ يوم' },
];

function p75(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.floor(s.length * 0.75));
  return s[i];
}

function ratingOf(name: MetricName, v: number): 'good' | 'ni' | 'poor' {
  const m = META[name];
  if (v <= m.good) return 'good';
  if (v <= m.poor) return 'ni';
  return 'poor';
}

function fmt(name: MetricName, v: number): string {
  if (name === 'CLS') return v.toFixed(3);
  return `${Math.round(v)} ${META[name].unit}`.trim();
}

const RATING_COLOR = { good: '#0f9d58', ni: '#f4b400', poor: '#db4437' };

export default function AdminWebVitals() {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    supabase
      .from('web_vitals')
      .select('metric_name,metric_value,rating,path,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(20000)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as Row[]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [days]);

  const summary = useMemo(() => {
    const out: Record<MetricName, { p75: number; count: number }> = {} as any;
    for (const m of METRICS) {
      const vs = rows.filter(r => r.metric_name === m).map(r => Number(r.metric_value));
      out[m] = { p75: p75(vs), count: vs.length };
    }
    return out;
  }, [rows]);

  const trend = useMemo(() => {
    const bucket = days <= 1 ? 'hour' : 'day';
    const map = new Map<string, Record<string, number[]>>();
    for (const r of rows) {
      const d = new Date(r.created_at);
      const key = bucket === 'hour'
        ? `${d.getHours().toString().padStart(2, '0')}:00`
        : `${d.getMonth() + 1}/${d.getDate()}`;
      if (!map.has(key)) map.set(key, {});
      const b = map.get(key)!;
      (b[r.metric_name] ||= []).push(Number(r.metric_value));
    }
    return Array.from(map.entries()).map(([t, b]) => {
      const row: any = { t };
      for (const m of METRICS) row[m] = b[m] ? p75(b[m]) : null;
      return row;
    });
  }, [rows, days]);

  const byPath = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const r of rows) {
      if (r.metric_name !== 'LCP') continue;
      if (!map.has(r.path)) map.set(r.path, []);
      map.get(r.path)!.push(Number(r.metric_value));
    }
    return Array.from(map.entries())
      .map(([path, vs]) => ({ path, lcp: p75(vs), count: vs.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [rows]);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Web Vitals</h1>
          <p className="text-sm text-muted-foreground">
            متوسطات P75 لجودة الأداء الفعلي للمستخدمين
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm border transition ${
                days === p.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="animate-spin" size={16} /> جاري التحميل…
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          خطأ: {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-md">
          لا توجد قياسات في هذه الفترة بعد. بمجرد أن يزور المستخدمون الموقع في الإنتاج ستظهر البيانات هنا.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {METRICS.map(m => {
              const s = summary[m];
              const r = ratingOf(m, s.p75);
              const Icon = META[m].icon;
              return (
                <div key={m} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2 text-muted-foreground">
                    <div className="flex items-center gap-2 text-xs">
                      <Icon size={14} /> {m}
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: RATING_COLOR[r] + '22', color: RATING_COLOR[r] }}
                    >
                      {r === 'good' ? 'جيد' : r === 'ni' ? 'يحتاج تحسين' : 'ضعيف'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{fmt(m, s.p75)}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {s.count.toLocaleString('ar')} قياس
                  </div>
                </div>
              );
            })}
          </div>

          <section className="p-4 rounded-lg border bg-card">
            <h2 className="font-semibold mb-3">اتجاه P75 عبر الزمن</h2>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="t" />
                  <YAxis yAxisId="ms" />
                  <YAxis yAxisId="cls" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="ms"  type="monotone" dataKey="LCP"  stroke="#4285f4" dot={false} />
                  <Line yAxisId="ms"  type="monotone" dataKey="INP"  stroke="#db4437" dot={false} />
                  <Line yAxisId="ms"  type="monotone" dataKey="FCP"  stroke="#0f9d58" dot={false} />
                  <Line yAxisId="ms"  type="monotone" dataKey="TTFB" stroke="#f4b400" dot={false} />
                  <Line yAxisId="cls" type="monotone" dataKey="CLS"  stroke="#ab47bc" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="p-4 rounded-lg border bg-card">
            <h2 className="font-semibold mb-3">LCP حسب الصفحة (P75)</h2>
            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <BarChart data={byPath} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="path" width={140} />
                  <Tooltip
                    formatter={(v: number) => `${Math.round(v)} ms`}
                    labelFormatter={(l) => `المسار: ${l}`}
                  />
                  <Bar dataKey="lcp" fill="#1A4A00" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
