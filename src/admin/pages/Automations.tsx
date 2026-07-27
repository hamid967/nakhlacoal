import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trash2, Zap, FlaskConical, PlayCircle } from 'lucide-react';

type Rule = {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  conditions: Record<string, unknown>;
  actions: Array<Record<string, unknown>>;
  active: boolean;
  run_count: number;
  last_run_at: string | null;
  throttle_seconds: number | null;
};

type Run = {
  id: string;
  rule_id: string;
  entity_type: string | null;
  status: string;
  log: any;
  created_at: string;
};

const TRIGGERS = [
  { value: 'stock.low', label: 'انخفاض المخزون' },
  { value: 'cart.abandoned', label: 'سلة مهجورة' },
  { value: 'order.created', label: 'عند إنشاء طلب' },
  { value: 'order.status_changed', label: 'تغيّر حالة طلب' },
  { value: 'quote.accepted', label: 'قبول عرض سعر' },
  { value: 'zatca.failed', label: 'فشل ZATCA' },
  { value: 'churn.risk', label: 'عميل معرّض للفقد' },
];

const DEFAULT_ACTIONS = `[
  { "type": "create_notification", "title": "حدث: {{variant_id}}", "severity": "warning" }
]`;

const STATUS_COLOR: Record<string, string> = {
  success: 'bg-emerald-600',
  failed: 'bg-red-500',
  throttled: 'bg-slate-500',
  skipped: 'bg-slate-400',
};

export default function Automations() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', trigger_event: 'stock.low',
    actions: DEFAULT_ACTIONS, conditions: '{}', throttle_seconds: '',
  });

  const load = async () => {
    setLoading(true);
    const [r, ru] = await Promise.all([
      supabase.from('automation_rules').select('*').order('created_at', { ascending: false }),
      supabase.from('automation_runs').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (r.error) toast.error(r.error.message);
    setRules((r.data as Rule[]) ?? []);
    setRuns((ru.data as Run[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return toast.error('الاسم مطلوب');
    let actions: any; let conditions: any;
    try { actions = JSON.parse(form.actions); } catch { return toast.error('صيغة الإجراءات JSON غير صحيحة'); }
    try { conditions = JSON.parse(form.conditions); } catch { return toast.error('صيغة الشروط JSON غير صحيحة'); }
    setCreating(true);
    const { error } = await supabase.from('automation_rules').insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      trigger_event: form.trigger_event,
      actions, conditions, active: true,
      throttle_seconds: form.throttle_seconds ? Number(form.throttle_seconds) : null,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success('تم إنشاء القاعدة');
    setForm({ name: '', description: '', trigger_event: 'stock.low', actions: DEFAULT_ACTIONS, conditions: '{}', throttle_seconds: '' });
    load();
  };

  const toggle = async (r: Rule) => {
    const { error } = await supabase.from('automation_rules').update({ active: !r.active }).eq('id', r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('حذف القاعدة نهائيًا؟')) return;
    const { error } = await supabase.from('automation_rules').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('حُذفت القاعدة');
    load();
  };

  const runDispatcher = async () => {
    setDispatching(true);
    const { data, error } = await supabase.functions.invoke('automation-dispatcher', { body: { trigger: 'manual' } });
    setDispatching(false);
    if (error) return toast.error(error.message);
    toast.success(`تم تشغيل الأتمتة — عولج ${(data as any)?.processed ?? 0} حدث`);
    load();
  };

  const testRule = async (r: Rule) => {
    setTestingId(r.id);
    const { data, error } = await supabase.functions.invoke('automation-dispatcher', { body: { mode: 'test', rule_id: r.id } });
    setTestingId(null);
    if (error) return toast.error(error.message);
    const d = data as any;
    toast.success(`تجربة "${r.name}": ${d?.would_run ?? 0} من ${d?.sampled ?? 0} حدث سينفّذ`);
  };

  const ruleName = (id: string) => rules.find((r) => r.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="h-7 w-7 text-palm-gold" /> قواعد الأتمتة</h1>
          <p className="text-sm text-muted-foreground mt-1">اربط الأحداث بإجراءات: إشعار / بريد / واتساب / Webhook. يعمل المُشغّل تلقائيًا كل 5 دقائق.</p>
        </div>
        <Button onClick={runDispatcher} disabled={dispatching} variant="outline">
          <PlayCircle className={`h-4 w-4 me-2 ${dispatching ? 'animate-pulse' : ''}`} />
          تشغيل المُشغّل الآن
        </Button>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">القواعد ({rules.length})</TabsTrigger>
          <TabsTrigger value="runs">السجل ({runs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>قاعدة جديدة</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <Input placeholder="اسم القاعدة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <select className="border rounded px-3 h-10 bg-background" value={form.trigger_event}
                  onChange={(e) => setForm({ ...form, trigger_event: e.target.value })}>
                  {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <Input type="number" placeholder="Throttle (ثوانٍ)" value={form.throttle_seconds}
                  onChange={(e) => setForm({ ...form, throttle_seconds: e.target.value })} />
              </div>
              <Input placeholder="وصف (اختياري)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الشروط (JSON)</label>
                  <Textarea rows={4} value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} className="font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الإجراءات (JSON)</label>
                  <Textarea rows={4} value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} className="font-mono text-xs" />
                </div>
              </div>
              <Button onClick={create} disabled={creating}><Plus className="h-4 w-4 me-1" /> إنشاء القاعدة</Button>
            </CardContent>
          </Card>

          {loading ? <Skeleton className="h-40 w-full" /> : (
            <div className="grid gap-3">
              {rules.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد قواعد بعد.</CardContent></Card>
              ) : rules.map((r) => (
                <Card key={r.id}>
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">{r.name}</span>
                        <Badge variant="outline">{r.trigger_event}</Badge>
                        <Badge variant="secondary">{r.run_count} تنفيذًا</Badge>
                        {r.last_run_at && <span className="text-xs text-muted-foreground">آخر: {new Date(r.last_run_at).toLocaleString('ar-SA')}</span>}
                      </div>
                      {r.description && <p className="text-sm text-muted-foreground mb-2">{r.description}</p>}
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">{JSON.stringify(r.actions, null, 2)}</pre>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch checked={r.active} onCheckedChange={() => toggle(r)} />
                      <Button size="sm" variant="outline" onClick={() => testRule(r)} disabled={testingId === r.id}>
                        <FlaskConical className="h-3.5 w-3.5 me-1" /> {testingId === r.id ? '…' : 'تجربة'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="runs">
          {loading ? <Skeleton className="h-40 w-full" /> : runs.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">لا يوجد تنفيذ بعد.</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {runs.map((run) => (
                <Card key={run.id}>
                  <CardContent className="py-3 flex items-start gap-3">
                    <Badge className={`${STATUS_COLOR[run.status] || 'bg-slate-500'} text-white`}>{run.status}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="font-semibold">{ruleName(run.rule_id)}</span>
                        {run.entity_type && <Badge variant="outline" className="text-[10px]">{run.entity_type}</Badge>}
                        <span className="text-[11px] text-muted-foreground ms-auto">{new Date(run.created_at).toLocaleString('ar-SA')}</span>
                      </div>
                      <pre className="text-[11px] bg-muted p-2 rounded mt-2 overflow-x-auto max-h-40">{JSON.stringify(run.log, null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
