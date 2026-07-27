import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck, ExternalLink } from 'lucide-react';
import { useAdminNotifications } from '@/admin/hooks/useNotifications';

const SEVERITIES = ['all', 'critical', 'warning', 'info', 'success'] as const;
const SEV_BADGE: Record<string, string> = {
  critical: 'bg-red-500 hover:bg-red-500',
  warning: 'bg-amber-500 hover:bg-amber-500',
  info: 'bg-sky-500 hover:bg-sky-500',
  success: 'bg-emerald-600 hover:bg-emerald-600',
};

export default function Notifications() {
  const { items, unread, loading, markRead, markAllRead } = useAdminNotifications(200);
  const [sev, setSev] = useState<(typeof SEVERITIES)[number]>('all');
  const [q, setQ] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (sev !== 'all' && n.severity !== sev) return false;
      if (onlyUnread && n.read_at) return false;
      if (q && !`${n.title} ${n.body ?? ''} ${n.kind}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, sev, q, onlyUnread]);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">مركز الإشعارات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            كل التنبيهات التشغيلية في مكان واحد — {items.length} إجماليًا، {unread} غير مقروء.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 me-2" /> تعليم الكل كمقروء
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">تصفية</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <Input placeholder="بحث بالعنوان أو النوع…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {SEVERITIES.map((s) => (
              <button key={s}
                onClick={() => setSev(s)}
                className={`px-3 py-1 rounded text-xs transition ${sev === s ? 'bg-background shadow font-medium' : 'text-muted-foreground'}`}
              >
                {s === 'all' ? 'الكل' : s === 'critical' ? 'حرج' : s === 'warning' ? 'تحذير' : s === 'info' ? 'معلومة' : 'نجاح'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
            غير المقروء فقط
          </label>
        </CardContent>
      </Card>

      {loading ? <Skeleton className="h-40 w-full" /> : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">لا توجد إشعارات مطابقة.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((n) => (
            <Card key={n.id} className={!n.read_at ? 'border-primary/40' : ''}>
              <CardContent className="py-3 flex items-start gap-3">
                <Badge className={`${SEV_BADGE[n.severity]} text-white`}>{n.severity}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`${!n.read_at ? 'font-semibold' : ''}`}>{n.title}</span>
                    <Badge variant="outline" className="text-[10px]">{n.kind}</Badge>
                    <span className="text-[11px] text-muted-foreground ms-auto">{new Date(n.created_at).toLocaleString('ar-SA')}</span>
                  </div>
                  {n.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.body}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {n.link && (
                    <Button asChild size="sm" variant="ghost">
                      <Link to={n.link} onClick={() => markRead(n.id)}><ExternalLink className="w-3.5 h-3.5 me-1" /> فتح</Link>
                    </Button>
                  )}
                  {!n.read_at && (
                    <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>تم القراءة</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
