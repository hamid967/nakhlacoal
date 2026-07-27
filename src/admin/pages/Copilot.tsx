import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Turn = { question: string; answer?: string; rows?: unknown[]; count?: number | null; error?: string };

const SAMPLES = [
  'كم بلغت المبيعات آخر 7 أيام؟',
  'من هم أفضل 5 عملاء من حيث قيمة الشراء؟',
  'ما المنتجات ذات أعلى دوران هذا الشهر؟',
  'كم عدد الفواتير غير المدفوعة؟',
];

export default function Copilot() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setTurns((t) => [...t, { question }]);
    const { data, error } = await supabase.functions.invoke('admin-copilot', { body: { question } });
    setBusy(false);
    if (error) {
      setTurns((t) => t.map((x, i) => i === t.length - 1 ? { ...x, error: error.message } : x));
      return;
    }
    setTurns((t) => t.map((x, i) => i === t.length - 1 ? { ...x, answer: data.answer, rows: data.rows, count: data.count, error: data.queryError } : x));
    setQ('');
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-7 w-7 text-palm-gold" /> المساعد الذكي للإدارة</h1>
        <p className="text-sm text-muted-foreground mt-1">اسأل بالعربية عن أي بيانات في المتجر — قراءة فقط، بدون تعديل.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-2">
          <Input
            placeholder="مثلاً: كم بلغت المبيعات في جدة هذا الأسبوع؟"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') ask(q); }}
            disabled={busy}
          />
          <Button onClick={() => ask(q)} disabled={busy || !q.trim()}>
            <Send className="h-4 w-4 me-1" /> اسأل
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <Button key={s} size="sm" variant="outline" onClick={() => ask(s)} disabled={busy}>{s}</Button>
        ))}
      </div>

      <div className="space-y-4">
        {turns.map((t, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{t.question}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!t.answer && !t.error && <div className="text-sm text-muted-foreground">جارٍ التحليل…</div>}
              {t.error && <div className="text-sm text-destructive">خطأ: {t.error}</div>}
              {t.answer && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{t.answer}</ReactMarkdown>
                </div>
              )}
              {t.count != null && <div className="text-xs text-muted-foreground">النتائج: {t.count}</div>}
              {t.rows && t.rows.length > 0 && (
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-64">{JSON.stringify(t.rows, null, 2)}</pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
