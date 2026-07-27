import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Zap } from 'lucide-react';

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
};

const TRIGGERS = [
  { value: 'order.created', label: 'عند إنشاء طلب' },
  { value: 'order.status_changed', label: 'عند تغيّر حالة طلب' },
  { value: 'review.created', label: 'عند تقييم منتج' },
  { value: 'stock.low', label: 'عند انخفاض المخزون' },
  { value: 'quote.accepted', label: 'عند قبول عرض سعر' },
];

const DEFAULT_ACTIONS = `[
  { "type": "notify_admin", "message": "حدث جديد" }
]`;

export default function Automations() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger_event: 'order.created',
    actions: DEFAULT_ACTIONS,
    conditions: '{}',
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('automation_rules').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRules((data as Rule[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return toast.error('الاسم مطلوب');
    let actions: unknown; let conditions: unknown;
    try { actions = JSON.parse(form.actions); } catch { return toast.error('صيغة الإجراءات JSON غير صحيحة'); }
    try { conditions = JSON.parse(form.conditions); } catch { return toast.error('صيغة الشروط JSON غير صحيحة'); }
    setCreating(true);
    const { error } = await supabase.from('automation_rules').insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      trigger_event: form.trigger_event,
      actions, conditions, active: true,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success('تم إنشاء القاعدة');
    setForm({ name: '', description: '', trigger_event: 'order.created', actions: DEFAULT_ACTIONS, conditions: '{}' });
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

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="h-7 w-7 text-palm-gold" /> قواعد الأتمتة</h1>
        <p className="text-sm text-muted-foreground mt-1">اربط الأحداث بإجراءات: عند حدث ↓ نفّذ ↓ إشعار/بريد/واتساب.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>قاعدة جديدة</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="اسم القاعدة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select
              className="border rounded px-3 h-10 bg-background"
              value={form.trigger_event}
              onChange={(e) => setForm({ ...form, trigger_event: e.target.value })}
            >
              {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{r.name}</span>
                    <Badge variant="outline">{r.trigger_event}</Badge>
                    <Badge variant="secondary">{r.run_count} تنفيذًا</Badge>
                  </div>
                  {r.description && <p className="text-sm text-muted-foreground mb-2">{r.description}</p>}
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(r.actions, null, 2)}</pre>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch checked={r.active} onCheckedChange={() => toggle(r)} />
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
