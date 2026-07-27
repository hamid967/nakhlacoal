import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RefreshCw, TrendingUp, Users, Package as PackageIcon } from 'lucide-react';

type Kpi = { day: string; revenue_sar: number; orders_count: number; aov_sar: number; refunds_sar: number; new_customers: number };
type Segment = { tier: string; count: number; ltv: number };
type Intel = { variant_id: string; velocity_30d: number; days_of_cover: number | null; abc_class: string; reorder_point: number };

const SAR = (n: number) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n || 0);

type RunState = { status: 'idle' | 'running' | 'success' | 'error'; message?: string; at?: string; results?: any };

export default function Growth() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [intel, setIntel] = useState<Intel[]>([]);
  const [loading, setLoading] = useState(true);
  const [runAll, setRunAll] = useState<RunState>({ status: 'idle' });
  const [runKpi, setRunKpi] = useState<RunState>({ status: 'idle' });
  const [runSeg, setRunSeg] = useState<RunState>({ status: 'idle' });
  const [runPi, setRunPi] = useState<RunState>({ status: 'idle' });

  const load = async () => {
    setLoading(true);
    const [k, s, p] = await Promise.all([
      supabase.from('daily_kpi_snapshots').select('day,revenue_sar,orders_count,aov_sar,refunds_sar,new_customers').order('day', { ascending: true }).limit(30),
      supabase.from('customer_segments').select('tier,ltv_sar'),
      supabase.from('product_intelligence').select('variant_id,velocity_30d,days_of_cover,abc_class,reorder_point').order('velocity_30d', { ascending: false }).limit(20),
    ]);
    setKpis((k.data as Kpi[]) ?? []);
    const bucket: Record<string, Segment> = {};
    for (const r of (s.data ?? []) as { tier: string; ltv_sar: number }[]) {
      bucket[r.tier] ??= { tier: r.tier, count: 0, ltv: 0 };
      bucket[r.tier].count++;
      bucket[r.tier].ltv += Number(r.ltv_sar) || 0;
    }
    setSegments(Object.values(bucket).sort((a, b) => b.ltv - a.ltv));
    setIntel((p.data as Intel[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runNow = async () => {
    setRunAll({ status: 'running' });
    const { data, error } = await supabase.functions.invoke('analytics-nightly-rollup', { body: {} });
    if (error) {
      setRunAll({ status: 'error', message: error.message, at: new Date().toISOString() });
      return toast.error(error.message);
    }
    setRunAll({ status: 'success', at: new Date().toISOString(), results: (data as any)?.results });
    toast.success('تم إعادة حساب جميع المؤشرات');
    load();
  };

  const runRpc = async (
    fn: 'compute_daily_kpi' | 'compute_customer_segments' | 'compute_product_intelligence',
    setState: (s: RunState) => void,
    label: string,
  ) => {
    setState({ status: 'running' });
    const { data, error } = await supabase.rpc(fn as any);
    if (error) {
      setState({ status: 'error', message: error.message, at: new Date().toISOString() });
      return toast.error(`${label}: ${error.message}`);
    }
    setState({ status: 'success', at: new Date().toISOString(), results: data });
    toast.success(`${label}: تم`);
    load();
  };

  const StatusPill = ({ s }: { s: RunState }) => {
    if (s.status === 'idle') return <span className="text-xs text-muted-foreground">لم يُشغَّل بعد</span>;
    if (s.status === 'running') return <Badge variant="outline" className="animate-pulse">قيد التنفيذ…</Badge>;
    const time = s.at ? new Date(s.at).toLocaleTimeString('ar-SA') : '';
    if (s.status === 'success') {
      const summary = s.results != null && typeof s.results !== 'object' ? ` · ${s.results}` : '';
      return <Badge className="bg-emerald-600 hover:bg-emerald-600">نجح · {time}{summary}</Badge>;
    }
    return <Badge variant="destructive">فشل · {time} · {s.message}</Badge>;
  };

  const totals = kpis.reduce(
    (acc, k) => ({
      rev: acc.rev + Number(k.revenue_sar || 0),
      orders: acc.orders + (k.orders_count || 0),
      customers: acc.customers + (k.new_customers || 0),
    }),
    { rev: 0, orders: 0, customers: 0 },
  );
  const aov = totals.orders ? totals.rev / totals.orders : 0;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">لوحة النمو</h1>
          <p className="text-sm text-muted-foreground mt-1">مؤشرات آخر 30 يومًا، شرائح العملاء، وذكاء المنتجات.</p>
        </div>
        <Button onClick={runNow} disabled={runAll.status === 'running'} variant="outline">
          <RefreshCw className={`h-4 w-4 me-2 ${runAll.status === 'running' ? 'animate-spin' : ''}`} />
          إعادة الحساب الآن (الكل)
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">تشغيل يدوي للمهام</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between border rounded-lg p-3 gap-2 flex-wrap">
            <div>
              <div className="font-medium text-sm">Rollup كامل (Edge Function)</div>
              <div className="mt-1"><StatusPill s={runAll} /></div>
            </div>
            <Button size="sm" onClick={runNow} disabled={runAll.status === 'running'}>
              <RefreshCw className={`h-3.5 w-3.5 me-2 ${runAll.status === 'running' ? 'animate-spin' : ''}`} />
              تشغيل
            </Button>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3 gap-2 flex-wrap">
            <div>
              <div className="font-medium text-sm">KPI يومي</div>
              <div className="mt-1"><StatusPill s={runKpi} /></div>
            </div>
            <Button size="sm" variant="outline" onClick={() => runRpc('compute_daily_kpi', setRunKpi, 'KPI')} disabled={runKpi.status === 'running'}>
              <RefreshCw className={`h-3.5 w-3.5 me-2 ${runKpi.status === 'running' ? 'animate-spin' : ''}`} />
              تشغيل
            </Button>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3 gap-2 flex-wrap">
            <div>
              <div className="font-medium text-sm">شرائح العملاء (RFM)</div>
              <div className="mt-1"><StatusPill s={runSeg} /></div>
            </div>
            <Button size="sm" variant="outline" onClick={() => runRpc('compute_customer_segments', setRunSeg, 'الشرائح')} disabled={runSeg.status === 'running'}>
              <RefreshCw className={`h-3.5 w-3.5 me-2 ${runSeg.status === 'running' ? 'animate-spin' : ''}`} />
              تشغيل
            </Button>
          </div>
          <div className="flex items-center justify-between border rounded-lg p-3 gap-2 flex-wrap">
            <div>
              <div className="font-medium text-sm">ذكاء المنتجات</div>
              <div className="mt-1"><StatusPill s={runPi} /></div>
            </div>
            <Button size="sm" variant="outline" onClick={() => runRpc('compute_product_intelligence', setRunPi, 'ذكاء المنتجات')} disabled={runPi.status === 'running'}>
              <RefreshCw className={`h-3.5 w-3.5 me-2 ${runPi.status === 'running' ? 'animate-spin' : ''}`} />
              تشغيل
            </Button>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">إيرادات 30 يومًا</div>
          <div className="text-2xl font-bold mt-1">{SAR(totals.rev)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">الطلبات</div>
          <div className="text-2xl font-bold mt-1">{totals.orders.toLocaleString('ar-SA')}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">متوسط قيمة الطلب</div>
          <div className="text-2xl font-bold mt-1">{SAR(aov)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">عملاء جدد</div>
          <div className="text-2xl font-bold mt-1">{totals.customers.toLocaleString('ar-SA')}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> الإيرادات اليومية</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64 w-full" /> : kpis.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد بيانات بعد — اضغط "إعادة الحساب الآن".</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={kpis}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => SAR(v)} />
                  <Line type="monotone" dataKey="revenue_sar" stroke="hsl(var(--palm-gold))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> شرائح العملاء (RFM)</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : segments.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">لا توجد شرائح بعد.</p>
            ) : (
              <div className="space-y-2">
                {segments.map((s) => (
                  <div key={s.tier} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <Badge>{s.tier}</Badge>
                      <span className="ms-2 text-sm">{s.count.toLocaleString('ar-SA')} عميل</span>
                    </div>
                    <div className="font-semibold">{SAR(s.ltv)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PackageIcon className="h-5 w-5" /> أعلى المنتجات دورانًا</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-40 w-full" /> : intel.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">لا توجد بيانات بعد.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {intel.map((p) => (
                  <div key={p.variant_id} className="flex items-center justify-between border rounded p-2 text-sm">
                    <div className="font-mono text-xs truncate">{p.variant_id.slice(0, 8)}…</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.abc_class === 'A' ? 'default' : 'outline'}>{p.abc_class}</Badge>
                      <span>{p.velocity_30d.toFixed(1)}/يوم</span>
                      {p.days_of_cover != null && (
                        <span className={p.days_of_cover < 7 ? 'text-destructive' : 'text-muted-foreground'}>
                          {Math.round(p.days_of_cover)} يوم تغطية
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
