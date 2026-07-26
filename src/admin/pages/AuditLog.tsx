import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Search, ScrollText, RefreshCw, Plus, Pencil, Trash2, LogIn, Download, Circle } from 'lucide-react';

type Row = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  summary: string | null;
  old_data: unknown;
  new_data: unknown;
  ip_address: string | null;
  created_at: string;
};

const ACTION_META: Record<string, { label: string; icon: typeof Plus; tint: string }> = {
  create: { label: 'إنشاء', icon: Plus, tint: 'green' },
  update: { label: 'تعديل', icon: Pencil, tint: 'blue' },
  delete: { label: 'حذف', icon: Trash2, tint: 'rose' },
  login: { label: 'دخول', icon: LogIn, tint: 'violet' },
  export: { label: 'تصدير', icon: Download, tint: 'gold' },
  other: { label: 'إجراء', icon: Circle, tint: 'slate' },
};

export default function AdminAuditLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [action, setAction] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (action !== 'all' && r.action !== action) return false;
        if (!q) return true;
        const hay = `${r.actor_email ?? ''} ${r.entity_table} ${r.entity_id ?? ''} ${r.summary ?? ''}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [rows, q, action],
  );

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">النظام · التدقيق</p>
          <h1>سجل النشاط</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
            كل تعديل يقوم به فريق الأدمن — للمراجعة والتدقيق.
          </p>
        </div>
        <button onClick={load} className="a-btn a-btn-ghost">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 flex-1"
          style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
        >
          <Search className="h-4 w-4 opacity-60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالبريد، الجدول، المعرّف، الوصف…"
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm bg-transparent"
          style={{ borderColor: 'var(--a-border)' }}
        >
          <option value="all">كل الإجراءات</option>
          {Object.entries(ACTION_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
      >
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="h-5 w-5 animate-spin inline" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
            <ScrollText className="h-6 w-6 mx-auto mb-2 opacity-60" />
            لا توجد سجلات
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">الوقت</th>
                <th className="px-3 py-2 font-medium">الفاعل</th>
                <th className="px-3 py-2 font-medium">الإجراء</th>
                <th className="px-3 py-2 font-medium">الجدول</th>
                <th className="px-3 py-2 font-medium">المعرّف</th>
                <th className="px-3 py-2 font-medium">الوصف</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = ACTION_META[r.action] ?? ACTION_META.other;
                const Icon = meta.icon;
                const opened = openId === r.id;
                return (
                  <>
                    <tr
                      key={r.id}
                      className="border-t cursor-pointer hover:bg-black/[.02]"
                      style={{ borderColor: 'var(--a-border)' }}
                      onClick={() => setOpenId(opened ? null : r.id)}
                    >
                      <td className="px-3 py-2 text-xs" style={{ color: 'var(--a-text-muted)' }}>
                        {new Date(r.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="px-3 py-2 ltr-text">{r.actor_email || '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`a-pill a-pill-${meta.tint} inline-flex items-center gap-1`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <code className="text-xs">{r.entity_table}</code>
                      </td>
                      <td className="px-3 py-2 ltr-text text-xs">{r.entity_id || '—'}</td>
                      <td className="px-3 py-2">{r.summary || '—'}</td>
                    </tr>
                    {opened && (r.old_data || r.new_data) && (
                      <tr style={{ background: 'var(--a-surface-2)' }}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid md:grid-cols-2 gap-3 text-[11px]">
                            {r.old_data != null && (
                              <div>
                                <div className="font-semibold mb-1">قبل</div>
                                <pre className="p-2 rounded bg-black/5 overflow-auto max-h-56 ltr-text whitespace-pre-wrap">
                                  {safeJson(r.old_data)}
                                </pre>
                              </div>
                            )}
                            {r.new_data != null && (
                              <div>
                                <div className="font-semibold mb-1">بعد</div>
                                <pre className="p-2 rounded bg-black/5 overflow-auto max-h-56 ltr-text whitespace-pre-wrap">
                                  {safeJson(r.new_data)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function safeJson(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
