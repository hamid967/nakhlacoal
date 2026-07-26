import { useEffect, useMemo, useState } from 'react';
import { Mail, RefreshCw, Send, Filter, CheckCircle2, XCircle, Clock, Loader2, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

type LogRow = {
  id: string;
  template: string;
  recipient: string;
  subject: string | null;
  status: string;
  provider_id: string | null;
  error_message: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  created_at: string;
};

const RANGES = [
  { key: '24h', label: 'آخر 24 ساعة', ms: 24 * 3600 * 1000 },
  { key: '7d', label: 'آخر 7 أيام', ms: 7 * 24 * 3600 * 1000 },
  { key: '30d', label: 'آخر 30 يوم', ms: 30 * 24 * 3600 * 1000 },
] as const;

const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
  sent: { label: 'مُرسل', cls: 'a-pill-emerald', icon: CheckCircle2 },
  failed: { label: 'فشل', cls: 'a-pill-rose', icon: XCircle },
  bounced: { label: 'مرتد', cls: 'a-pill-amber', icon: XCircle },
  pending: { label: 'معلّق', cls: 'a-pill-slate', icon: Clock },
};

export default function AdminEmails() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('7d');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [runningCron, setRunningCron] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState<boolean>(true);
  const [autoShip, setAutoShip] = useState<boolean>(true);
  const [autoInvoice, setAutoInvoice] = useState<boolean>(true);
  const [savingToggle, setSavingToggle] = useState(false);

  const loadSettings = async () => {
    const { data } = await supabase.from('email_settings')
      .select('auto_order_confirmation, auto_shipment_notification, auto_invoice_receipt').eq('id', true).maybeSingle();
    if (data) {
      setAutoConfirm(!!data.auto_order_confirmation);
      setAutoShip((data as any).auto_shipment_notification !== false);
      setAutoInvoice((data as any).auto_invoice_receipt !== false);
    }
  };
  useEffect(() => { loadSettings(); }, []);

  const toggleAutoConfirm = async (next: boolean) => {
    setSavingToggle(true);
    const { error } = await supabase.from('email_settings')
      .upsert({ id: true, auto_order_confirmation: next, updated_at: new Date().toISOString() });
    setSavingToggle(false);
    if (error) { toast.error('تعذّر حفظ الإعداد'); return; }
    setAutoConfirm(next);
    toast.success(next ? 'تم تفعيل بريد تأكيد الطلب التلقائي' : 'تم تعطيل بريد تأكيد الطلب التلقائي');
  };

  const toggleAutoShip = async (next: boolean) => {
    setSavingToggle(true);
    const { error } = await supabase.from('email_settings')
      .upsert({ id: true, auto_shipment_notification: next, updated_at: new Date().toISOString() } as any);
    setSavingToggle(false);
    if (error) { toast.error('تعذّر حفظ الإعداد'); return; }
    setAutoShip(next);
    toast.success(next ? 'تم تفعيل إشعار الشحن التلقائي' : 'تم تعطيل إشعار الشحن التلقائي');
  };

  const toggleAutoInvoice = async (next: boolean) => {
    setSavingToggle(true);
    const { error } = await supabase.from('email_settings')
      .upsert({ id: true, auto_invoice_receipt: next, updated_at: new Date().toISOString() } as any);
    setSavingToggle(false);
    if (error) { toast.error('تعذّر حفظ الإعداد'); return; }
    setAutoInvoice(next);
    toast.success(next ? 'تم تفعيل إرسال إيصال الفاتورة تلقائياً' : 'تم تعطيل إرسال إيصال الفاتورة تلقائياً');
  };



  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - (RANGES.find((r) => r.key === range)?.ms ?? RANGES[1].ms)).toISOString();
    let q = supabase.from('email_log').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(500);
    if (templateFilter !== 'all') q = q.eq('template', templateFilter);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data, error } = await q;
    if (error) toast.error('تعذّر تحميل السجل');
    setRows((data as LogRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [range, templateFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = rows.length;
    const sent = rows.filter((r) => r.status === 'sent').length;
    const failed = rows.filter((r) => r.status === 'failed' || r.status === 'bounced').length;
    const unique = new Set(rows.map((r) => r.recipient.toLowerCase())).size;
    return { total, sent, failed, unique };
  }, [rows]);

  const templates = useMemo(() => Array.from(new Set(rows.map((r) => r.template))).sort(), [rows]);

  const resend = async (row: LogRow) => {
    setResendingId(row.id);
    try {
      let fn = '';
      let body: any = null;
      if (row.template.startsWith('order-') && row.entity_id) {
        fn = 'send-order-status-email';
        body = { orderId: row.entity_id, status: row.template.replace('order-', '') };
      } else if (row.template.startsWith('quote-') && row.template !== 'quote-expiry-reminder' && row.entity_id) {
        fn = 'send-quote-status-email';
        body = { quoteId: row.entity_id, status: row.template.replace('quote-', '') };
      } else if (row.template === 'order-confirmation' && row.entity_id) {
        fn = 'send-order-confirmation';
        body = { orderId: row.entity_id };
      } else if (row.template === 'shipment-notification' && row.entity_id) {
        fn = 'send-shipment-notification';
        body = { shipmentId: row.entity_id, status: row.metadata?.shipment_status, force: true };

      } else if (row.template === 'test-email') {
        fn = 'send-test-email';
        body = { to: row.recipient };
      } else {
        toast.error('إعادة الإرسال غير مدعومة لهذا القالب');
        setResendingId(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke(fn, { body });
      if (error) throw error;
      if ((data as any)?.ok) {
        toast.success(`أُعيد الإرسال إلى ${row.recipient}`);
        load();
      } else {
        toast.error('فشل الإرسال');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'خطأ');
    } finally {
      setResendingId(null);
    }
  };

  const runExpiryReminder = async () => {
    setRunningCron(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-quote-expiry-reminder', { body: {} });
      if (error) throw error;
      const processed = (data as any)?.processed ?? 0;
      toast.success(`تمت المعالجة: ${processed} عرض سعر`);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? 'فشل التشغيل');
    } finally {
      setRunningCron(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="سجل البريد — فحم النخلة" description="سجل شامل لجميع رسائل البريد الإلكتروني المُرسلة." path="/admin/emails" />

      <header className="a-page-header">
        <div>
          <p className="a-crumbs">الإدارة · البريد الإلكتروني</p>
          <h1>سجل البريد الإلكتروني</h1>
          <p>تتبّع حالة كل رسالة، أعِد إرسال أي إشعار، وشغّل تذكيرات انتهاء عروض الأسعار.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="a-btn" onClick={runExpiryReminder} disabled={runningCron}>
            {runningCron ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
            تشغيل تذكيرات العروض
          </button>
          <button className="a-btn a-btn-palm" onClick={load}>
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="إجمالي الرسائل" value={stats.total} icon={Mail} tint="var(--a-palm)" />
        <Stat label="تم الإرسال بنجاح" value={stats.sent} icon={CheckCircle2} tint="#10b981" />
        <Stat label="فشل / مرتد" value={stats.failed} icon={XCircle} tint="#ef4444" />
        <Stat label="مستلمون فريدون" value={stats.unique} icon={Send} tint="#f59e0b" />
      </div>

      {/* Automations */}
      <div className="a-card p-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--a-text)' }}>
            <BellRing className="w-4 h-4" style={{ color: 'var(--a-palm)' }} />
            بريد تأكيد الطلب التلقائي
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
            يتم إرسال بريد تأكيد فوري للعميل عند إنشاء أي طلب جديد يحتوي على بريد إلكتروني.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-sm" style={{ color: 'var(--a-text-muted)' }}>
            {autoConfirm ? 'مُفعّل' : 'معطّل'}
          </span>
          <input
            type="checkbox"
            className="sr-only peer"
            checked={autoConfirm}
            disabled={savingToggle}
            onChange={(e) => toggleAutoConfirm(e.target.checked)}
          />
          <span
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ background: autoConfirm ? 'var(--a-palm)' : '#cbd5e1' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ [autoConfirm ? 'right' : 'left']: '2px' } as any}
            />
          </span>
        </label>
      </div>

      <div className="a-card p-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--a-text)' }}>
            <BellRing className="w-4 h-4" style={{ color: 'var(--a-palm)' }} />
            إشعار الشحن التلقائي (مع رقم التتبع)
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
            يُرسَل للعميل تلقائيًا عند إضافة رقم تتبّع أو تغيّر حالة الشحنة (شُحنت / قيد النقل / خرج للتوصيل / تم التسليم).
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-sm" style={{ color: 'var(--a-text-muted)' }}>
            {autoShip ? 'مُفعّل' : 'معطّل'}
          </span>
          <input
            type="checkbox"
            className="sr-only peer"
            checked={autoShip}
            disabled={savingToggle}
            onChange={(e) => toggleAutoShip(e.target.checked)}
          />
          <span
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ background: autoShip ? 'var(--a-palm)' : '#cbd5e1' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ [autoShip ? 'right' : 'left']: '2px' } as any}
            />
          </span>
        </label>
      </div>


      {/* Filters */}
      <div className="a-card p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4" style={{ color: 'var(--a-text-muted)' }} />
        <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--a-border)' }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="px-3 py-1 text-xs rounded-md transition-colors"
              style={{
                background: range === r.key ? 'var(--a-palm)' : 'transparent',
                color: range === r.key ? '#fff' : 'var(--a-text)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <select className="a-input" style={{ maxWidth: 220 }} value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)}>
          <option value="all">كل القوالب</option>
          {templates.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="a-input" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="sent">مُرسل</option>
          <option value="failed">فشل</option>
          <option value="bounced">مرتد</option>
        </select>
      </div>

      {/* Table */}
      <div className="a-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr>
                <Th>الوقت</Th>
                <Th>القالب</Th>
                <Th>المستلم</Th>
                <Th>الموضوع</Th>
                <Th>الحالة</Th>
                <Th>إجراء</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: 'var(--a-text-muted)' }}>لا توجد رسائل ضمن الفلاتر المحددة.</td></tr>
              ) : rows.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.pending;
                const Icon = meta.icon;
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                    <Td>{new Date(r.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</Td>
                    <Td><code className="text-xs" style={{ color: 'var(--a-palm)' }}>{r.template}</code></Td>
                    <Td dir="ltr">{r.recipient}</Td>
                    <Td><span className="truncate max-w-[280px] inline-block align-middle">{r.subject}</span></Td>
                    <Td>
                      <span className={`a-pill ${meta.cls} inline-flex items-center gap-1`}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                      {r.error_message && (
                        <div className="text-[11px] mt-1 max-w-[280px] truncate" style={{ color: '#ef4444' }} title={r.error_message}>
                          {r.error_message}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <button
                        className="a-btn"
                        onClick={() => resend(r)}
                        disabled={resendingId === r.id}
                        style={{ padding: '4px 10px', fontSize: 12 }}
                      >
                        {resendingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        إعادة
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: any; tint: string }) {
  return (
    <div className="a-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{label}</div>
          <div className="text-2xl font-semibold mt-1" style={{ color: 'var(--a-text)' }}>{value.toLocaleString('ar-SA')}</div>
        </div>
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${tint}20`, color: tint }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-start px-4 py-3 text-xs font-medium" style={{ color: 'var(--a-text-muted)' }}>{children}</th>;
}
function Td({ children, dir }: { children: React.ReactNode; dir?: string }) {
  return <td className="px-4 py-3 align-top" dir={dir}>{children}</td>;
}
