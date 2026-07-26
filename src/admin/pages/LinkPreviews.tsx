import { useEffect, useMemo, useState } from 'react';
import {
  Link as LinkIcon, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle,
  XCircle, Trash2, Loader2, Facebook, Linkedin, Twitter, MessageCircle,
  Send as TelegramIcon, Search as GoogleIcon, CalendarClock, PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

type CheckRow = {
  id: string;
  url: string;
  tool: string;
  status: string;
  http_status: number | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  twitter_image: string | null;
  canonical: string | null;
  warnings: string[];
  note: string | null;
  source: string | null;
  batch_id: string | null;
  created_at: string;
};

type BatchSummary = {
  batch_id: string;
  started_at: string;
  total: number;
  ok: number;
  warn: number;
  error: number;
};

type CheckResult = {
  ok: boolean;
  url: string;
  ua: string;
  httpStatus: number;
  status: 'ok' | 'warn' | 'error';
  warnings: string[];
  meta: any;
  debuggerUrls: Record<string, string>;
  fetchError: string | null;
};

const SITE_ORIGIN = 'https://alnakhlacoal.com';
const QUICK_ROUTES = ['/', '/products', '/about', '/quality', '/faq', '/location', '/contact', '/trademarks'];

const TOOLS: { key: string; label: string; icon: any; hint: string }[] = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, hint: 'facebookexternalhit' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, hint: 'LinkedInBot' },
  { key: 'twitter',  label: 'X / Twitter', icon: Twitter, hint: 'Twitterbot' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, hint: 'WhatsApp/2.x' },
  { key: 'telegram', label: 'Telegram', icon: TelegramIcon, hint: 'TelegramBot' },
  { key: 'google',   label: 'Google', icon: GoogleIcon, hint: 'Googlebot' },
];

const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
  ok:    { label: 'سليم',   cls: 'a-pill-emerald', icon: CheckCircle2 },
  warn:  { label: 'تحذير',  cls: 'a-pill-amber',   icon: AlertTriangle },
  error: { label: 'خطأ',    cls: 'a-pill-rose',    icon: XCircle },
};

export default function AdminLinkPreviews() {
  const [url, setUrl] = useState(SITE_ORIGIN + '/');
  const [ua, setUa] = useState<string>('facebook');
  const [note, setNote] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const [rows, setRows] = useState<CheckRow[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);

  const loadLog = async () => {
    setLoadingLog(true);
    const { data, error } = await supabase
      .from('link_preview_checks')
      .select('id,url,tool,status,http_status,og_title,og_description,og_image,twitter_card,twitter_image,canonical,warnings,note,created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) toast.error('تعذّر تحميل سجل الفحوصات');
    setRows((data ?? []) as any);
    setLoadingLog(false);
  };
  useEffect(() => { loadLog(); }, []);

  const runCheck = async () => {
    if (!/^https?:\/\//i.test(url)) {
      toast.error('أدخل رابطاً كاملاً يبدأ بـ https://');
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-link-preview', {
        body: { url, ua, note: note.trim() || undefined, log: true },
      });
      if (error) throw error;
      const res = data as CheckResult;
      setResult(res);
      const label = STATUS_META[res.status]?.label ?? res.status;
      toast.success(`اكتمل الفحص — ${label}`);
      loadLog();
    } catch (err: any) {
      toast.error(err?.message ?? 'فشل تشغيل الفحص');
    } finally {
      setRunning(false);
    }
  };

  const openDebugger = (kind: string) => {
    if (!result?.debuggerUrls?.[kind]) {
      // Build client-side if we don't have a result yet.
      const map: Record<string, string> = {
        facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`,
        twitter:  `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`,
        whatsapp: `https://developers.facebook.com/tools/debug/sharing/?q=${encodeURIComponent(url)}`,
        telegram: `https://t.me/webpagebot?start=${encodeURIComponent(url)}`,
        google:   `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`,
      };
      window.open(map[kind], '_blank', 'noopener,noreferrer');
      return;
    }
    window.open(result.debuggerUrls[kind], '_blank', 'noopener,noreferrer');
  };

  const deleteRow = async (id: string) => {
    const { error } = await supabase.from('link_preview_checks').delete().eq('id', id);
    if (error) return toast.error('تعذّر الحذف');
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const summary = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => r.status === 'ok').length;
    const warn = rows.filter((r) => r.status === 'warn').length;
    const error = rows.filter((r) => r.status === 'error').length;
    return { total, ok, warn, error };
  }, [rows]);

  return (
    <div className="a-page">
      <SEO title="فحص معاينة الروابط — لوحة الأدمن" description="فحص Open Graph و Twitter Cards عبر Facebook Debugger و LinkedIn Post Inspector وتسجيل النتائج." path="/admin/link-previews" noindex />

      <header className="a-page-header">
        <div className="flex items-center gap-3">
          <div className="a-icon-tile"><LinkIcon size={18} /></div>
          <div>
            <h1 className="a-h1">فحص معاينة الروابط</h1>
            <p className="a-sub">افحص وسوم Open Graph و Twitter Cards قبل النشر، وسجّل النتيجة في سجل قابل للمراجعة.</p>
          </div>
        </div>
      </header>

      {/* Input */}
      <section className="a-card">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div>
            <label className="a-label">الرابط</label>
            <input
              type="url"
              className="a-input w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://alnakhlacoal.com/products"
              dir="ltr"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_ROUTES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="a-chip"
                  onClick={() => setUrl(SITE_ORIGIN + r)}
                >{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="a-label">User-Agent</label>
            <select className="a-input w-full" value={ua} onChange={(e) => setUa(e.target.value)}>
              {TOOLS.map((t) => (
                <option key={t.key} value={t.key}>{t.label} — {t.hint}</option>
              ))}
              <option value="server">افتراضي (متصفح)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="a-btn a-btn-primary w-full" disabled={running} onClick={runCheck}>
              {running ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              <span>تشغيل الفحص</span>
            </button>
          </div>
        </div>

        <div className="mt-3">
          <label className="a-label">ملاحظة (اختياري)</label>
          <input
            className="a-input w-full"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثال: تحقّق بعد تحديث og-image"
          />
        </div>

        {/* External debuggers */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} type="button" className="a-btn a-btn-ghost" onClick={() => openDebugger(t.key)}>
                <Icon size={14} />
                <span>افتح {t.label}</span>
                <ExternalLink size={12} className="opacity-60" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="a-card mt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {(() => {
                const S = STATUS_META[result.status] ?? STATUS_META.ok;
                const Icon = S.icon;
                return <span className={`a-pill ${S.cls}`}><Icon size={12} /> {S.label}</span>;
              })()}
              <span className="a-mono text-xs opacity-70">HTTP {result.httpStatus || '—'}</span>
              <span className="a-mono text-xs opacity-70">UA: {result.ua}</span>
            </div>
            <a href={result.url} target="_blank" rel="noreferrer noopener" className="a-link text-sm inline-flex items-center gap-1">
              فتح الرابط <ExternalLink size={12} />
            </a>
          </div>

          {result.fetchError && (
            <div className="a-alert a-alert-rose mt-3">{result.fetchError}</div>
          )}

          {result.warnings?.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {result.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <MetaPanel meta={result.meta} />
            <PreviewMock meta={result.meta} url={result.url} />
          </div>
        </section>
      )}

      {/* Log */}
      <section className="a-card mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="a-h2">سجل الفحوصات</h2>
          <div className="flex items-center gap-2 text-xs opacity-70">
            <span>{summary.total} إجمالاً</span>
            <span>·</span>
            <span className="text-emerald-600">{summary.ok} سليم</span>
            <span>·</span>
            <span className="text-amber-600">{summary.warn} تحذير</span>
            <span>·</span>
            <span className="text-rose-600">{summary.error} خطأ</span>
            <button className="a-btn a-btn-ghost ms-2" onClick={loadLog} disabled={loadingLog}>
              {loadingLog ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              تحديث
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="a-table w-full">
            <thead>
              <tr>
                <th>الوقت</th>
                <th>الرابط</th>
                <th>الأداة</th>
                <th>الحالة</th>
                <th>og:image</th>
                <th>ملاحظة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const S = STATUS_META[r.status] ?? STATUS_META.ok;
                const Icon = S.icon;
                return (
                  <tr key={r.id}>
                    <td className="a-mono text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString('ar-SA')}</td>
                    <td className="max-w-[280px] truncate"><a href={r.url} target="_blank" rel="noreferrer noopener" className="a-link">{r.url}</a></td>
                    <td className="text-xs">{r.tool}</td>
                    <td><span className={`a-pill ${S.cls}`}><Icon size={12} /> {S.label}</span></td>
                    <td className="max-w-[220px] truncate text-xs opacity-80">{r.og_image ?? '—'}</td>
                    <td className="max-w-[180px] truncate text-xs opacity-70">{r.note ?? '—'}</td>
                    <td>
                      <button className="a-icon-btn" onClick={() => deleteRow(r.id)} aria-label="حذف">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loadingLog && rows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 opacity-60">لا توجد فحوصات بعد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetaPanel({ meta }: { meta: any }) {
  if (!meta) return null;
  const rows: Array<[string, string | null]> = [
    ['og:title', meta.ogTitle],
    ['og:description', meta.ogDescription],
    ['og:image', meta.ogImage],
    ['og:url', meta.ogUrl],
    ['og:type', meta.ogType],
    ['twitter:card', meta.twitterCard],
    ['twitter:image', meta.twitterImage],
    ['canonical', meta.canonical],
    ['<title>', meta.title],
  ];
  return (
    <div className="a-card-inner">
      <div className="text-xs opacity-70 mb-2">الوسوم المكتشفة</div>
      <dl className="text-sm space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[150px_1fr] gap-2">
            <dt className="a-mono text-xs opacity-70">{k}</dt>
            <dd className="break-words">{v ?? <span className="opacity-40">—</span>}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PreviewMock({ meta, url }: { meta: any; url: string }) {
  const title = meta?.ogTitle ?? meta?.title ?? 'بدون عنوان';
  const desc  = meta?.ogDescription ?? '';
  const img   = meta?.ogImage;
  let host = url;
  try { host = new URL(url).hostname; } catch { /* ignore */ }
  return (
    <div className="a-card-inner">
      <div className="text-xs opacity-70 mb-2">معاينة تقريبية</div>
      <div className="border rounded-lg overflow-hidden bg-background">
        {img ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={img} alt="معاينة" className="w-full aspect-[1.91/1] object-cover bg-muted" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center text-xs opacity-60">لا توجد صورة og:image</div>
        )}
        <div className="p-3">
          <div className="text-[11px] uppercase opacity-60">{host}</div>
          <div className="font-semibold text-sm mt-0.5 line-clamp-2">{title}</div>
          {desc && <div className="text-xs opacity-70 mt-1 line-clamp-2">{desc}</div>}
        </div>
      </div>
    </div>
  );
}
