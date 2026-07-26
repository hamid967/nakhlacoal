import { useEffect, useState } from 'react';
import { Save, BarChart3, ExternalLink, CheckCircle2, XCircle, Loader2, PlugZap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const GA4_RE = /^G-[A-Z0-9]{6,}$/;
const GTM_RE = /^GTM-[A-Z0-9]{4,}$/;

type FailReason = 'format' | 'timeout' | 'offline' | 'blocked' | 'network';
type TestState = {
  status: 'idle' | 'testing' | 'ok' | 'fail';
  message?: string;
  reason?: FailReason;
  hints?: string[];
};

/**
 * Probes a tag URL by injecting a <script> tag. onload => network reachable + ID
 * served by Google. onerror => blocked/invalid. Times out after 6s.
 */
type ProbeResult = 'ok' | 'error' | 'timeout';

function probeScript(url: string, timeoutMs = 7000): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    let done = false;
    const finish = (r: ProbeResult) => {
      if (done) return;
      done = true;
      clearTimeout(t);
      s.remove();
      resolve(r);
    };
    s.async = true;
    s.src = url;
    s.onload = () => finish('ok');
    s.onerror = () => finish('error');
    document.head.appendChild(s);
    const t = setTimeout(() => finish('timeout'), timeoutMs);
  });
}

async function detectFailReason(): Promise<FailReason> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  // Try to reach Google's tag endpoint via no-cors; if it throws → likely blocked by ad-blocker / extension.
  try {
    await fetch('https://www.googletagmanager.com/gtag/js?id=G-PROBE', {
      mode: 'no-cors',
      cache: 'no-store',
    });
    return 'network';
  } catch {
    return 'blocked';
  }
}

const FAIL_COPY: Record<FailReason, { msg: (l: string) => string; hints: string[] }> = {
  format: {
    msg: (l) => `صيغة ${l} غير صالحة`,
    hints: ['تأكّد من النسخ الكامل للمعرّف من Google', 'GA4 يبدأ بـ G- وGTM يبدأ بـ GTM-'],
  },
  timeout: {
    msg: (l) => `انتهت مهلة الاختبار أثناء تحميل ${l}`,
    hints: ['الشبكة بطيئة — أعد المحاولة', 'جرّب من شبكة أخرى أو عطّل VPN'],
  },
  offline: {
    msg: () => 'لا يوجد اتصال بالإنترنت',
    hints: ['تحقّق من اتصال الشبكة وأعد المحاولة'],
  },
  blocked: {
    msg: (l) => `تم حظر تحميل ${l} (يبدو أنّ مانع إعلانات/امتداداً يحظر googletagmanager.com)`,
    hints: [
      'عطّل مانع الإعلانات على هذه الصفحة',
      'أو افتح الموقع في نافذة خاصة بدون امتدادات',
      'تأكّد أنّ جدار الحماية لا يحجب googletagmanager.com',
    ],
  },
  network: {
    msg: (l) => `تعذّر تحميل ${l} رغم وصول الشبكة — قد يكون المعرّف غير مفعّل`,
    hints: [
      'تأكّد أنّ المعرّف منشور وفعّال في حساب Google',
      'انتظر بضع دقائق بعد إنشاء معرّف جديد ثم أعد الاختبار',
    ],
  },
};

async function resultToState(label: string, r: ProbeResult): Promise<TestState> {
  if (r === 'ok') return { status: 'ok', message: `${label} يستجيب — المعرّف صالح ومحمّل من Google.` };
  const reason: FailReason = r === 'timeout' ? 'timeout' : await detectFailReason();
  const c = FAIL_COPY[reason];
  return { status: 'fail', reason, message: c.msg(label), hints: c.hints };
}

async function testGa4(id: string): Promise<TestState> {
  if (!GA4_RE.test(id)) {
    const c = FAIL_COPY.format;
    return { status: 'fail', reason: 'format', message: c.msg('GA4') + ' (G-XXXXXXXXXX)', hints: c.hints };
  }
  return resultToState('GA4', await probeScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`));
}

async function testGtm(id: string): Promise<TestState> {
  if (!GTM_RE.test(id)) {
    const c = FAIL_COPY.format;
    return { status: 'fail', reason: 'format', message: c.msg('GTM') + ' (GTM-XXXXXXX)', hints: c.hints };
  }
  return resultToState('GTM', await probeScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`));
}

function StatusBadge({ state }: { state: TestState }) {
  if (state.status === 'idle') return null;
  if (state.status === 'testing')
    return <span className="inline-flex items-center gap-1 text-[10px]"><Loader2 className="w-3 h-3 animate-spin" /> اختبار…</span>;
  if (state.status === 'ok')
    return <span className="inline-flex items-center gap-1 text-[10px] text-gold"><CheckCircle2 className="w-3 h-3" /> صالح</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] text-red-600"><XCircle className="w-3 h-3" /> فشل</span>;
}

function TestFeedback({ state, onRetry }: { state: TestState; onRetry?: () => void }) {
  const tone =
    state.status === 'ok' ? 'text-gold bg-sand border-gold/20'
    : state.status === 'fail' ? 'text-red-700 bg-red-50 border-red-200'
    : 'text-foreground bg-muted border-border';
  return (
    <div className={`text-xs mt-2 rounded-md border px-3 py-2 ${tone}`}>
      <div className="flex items-start gap-2">
        <span className="flex-1">{state.message}</span>
        {state.status === 'fail' && onRetry && (
          <button type="button" onClick={onRetry} className="underline shrink-0">إعادة المحاولة</button>
        )}
      </div>
      {state.hints && state.hints.length > 0 && (
        <ul className="list-disc ms-5 mt-1.5 space-y-0.5 opacity-90">
          {state.hints.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function AdminTracking() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ga4, setGa4] = useState('');
  const [gtm, setGtm] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('analytics_settings')
        .select('*')
        .eq('id', true)
        .maybeSingle();
      if (!error && data) {
        setGa4(data.ga4_measurement_id ?? '');
        setGtm(data.gtm_container_id ?? '');
        setEnabled(!!data.enabled);
      }
      setLoading(false);
    })();
  }, []);

  const [ga4Test, setGa4Test] = useState<TestState>({ status: 'idle' });
  const [gtmTest, setGtmTest] = useState<TestState>({ status: 'idle' });

  // Reset test result when value changes
  useEffect(() => setGa4Test({ status: 'idle' }), [ga4]);
  useEffect(() => setGtmTest({ status: 'idle' }), [gtm]);

  const runTests = async (): Promise<{ ga4Ok: boolean; gtmOk: boolean }> => {
    const tasks: Promise<void>[] = [];
    let ga4Ok = true;
    let gtmOk = true;
    if (ga4) {
      setGa4Test({ status: 'testing' });
      tasks.push(testGa4(ga4).then((r) => { setGa4Test(r); ga4Ok = r.status === 'ok'; }));
    }
    if (gtm) {
      setGtmTest({ status: 'testing' });
      tasks.push(testGtm(gtm).then((r) => { setGtmTest(r); gtmOk = r.status === 'ok'; }));
    }
    await Promise.all(tasks);
    return { ga4Ok, gtmOk };
  };

  const onTest = async () => {
    if (!ga4 && !gtm) return toast.error('أدخل GA4 أو GTM ID للاختبار');
    const { ga4Ok, gtmOk } = await runTests();
    if (ga4Ok && gtmOk) toast.success('✓ كل المعرّفات صالحة');
    else toast.error('فشل الاختبار — راجع التفاصيل أدناه');
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ga4 && !GA4_RE.test(ga4)) return toast.error('GA4 ID غير صالح. مثال: G-XXXXXXXXXX');
    if (gtm && !GTM_RE.test(gtm)) return toast.error('GTM ID غير صالح. مثال: GTM-XXXXXXX');

    // Auto-verify reachability before saving
    if (ga4 || gtm) {
      const { ga4Ok, gtmOk } = await runTests();
      if (!ga4Ok || !gtmOk) {
        return toast.error('تعذّر التحقّق من المعرّفات — صحّح الأخطاء قبل الحفظ');
      }
    }

    setSaving(true);
    const { error } = await supabase
      .from('analytics_settings')
      .upsert({
        id: true,
        ga4_measurement_id: ga4 || null,
        gtm_container_id: gtm || null,
        enabled,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) return toast.error('تعذّر الحفظ: ' + error.message);
    toast.success('تم الحفظ. حدّث الصفحة لتفعيل السكربتات.');
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="a-crumbs">ANALYTICS</p>
        <h1 className=" flex items-center gap-3">
          <BarChart3 className="w-8 h-8" /> إعدادات التتبع
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--a-text-muted)' }}>
          فعّل Google Analytics 4 أو Google Tag Manager بإدخال المعرّف هنا — بدون أي تعديل في الكود.
        </p>
      </header>

      <form onSubmit={onSave} className="a-card p-6 space-y-5 max-w-2xl">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={loading}
            className="w-4 h-4"
          />
          <span className="font-medium">تفعيل التتبع على كامل الموقع</span>
        </label>

        <div>
          <div className="text-xs mb-1.5 flex items-center justify-between" style={{ color: 'var(--a-text-muted)' }}>
            <span>GA4 Measurement ID</span>
            <StatusBadge state={ga4Test} />
          </div>
          <input
            className="a-input"
            placeholder="G-XXXXXXXXXX"
            value={ga4}
            onChange={(e) => setGa4(e.target.value.trim().toUpperCase())}
            disabled={loading}
            dir="ltr"
          />
          {ga4Test.message && (
            <TestFeedback
              state={ga4Test}
              onRetry={ga4 ? async () => { setGa4Test({ status: 'testing' }); setGa4Test(await testGa4(ga4)); } : undefined}
            />
          )}
          <a
            href="https://analytics.google.com/analytics/web/#/p0/admin/streams/table/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs mt-1.5 underline"
          >
            أين أجد المعرّف؟ <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div>
          <div className="text-xs mb-1.5 flex items-center justify-between" style={{ color: 'var(--a-text-muted)' }}>
            <span>GTM Container ID</span>
            <StatusBadge state={gtmTest} />
          </div>
          <input
            className="a-input"
            placeholder="GTM-XXXXXXX"
            value={gtm}
            onChange={(e) => setGtm(e.target.value.trim().toUpperCase())}
            disabled={loading}
            dir="ltr"
          />
          {gtmTest.message && (
            <TestFeedback
              state={gtmTest}
              onRetry={gtm ? async () => { setGtmTest({ status: 'testing' }); setGtmTest(await testGtm(gtm)); } : undefined}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTest}
            className="a-btn"
            disabled={loading || ga4Test.status === 'testing' || gtmTest.status === 'testing'}
          >
            {(ga4Test.status === 'testing' || gtmTest.status === 'testing')
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الاختبار…</>
              : <><PlugZap className="w-4 h-4" /> اختبار المعرّفات</>}
          </button>
          <button type="submit" className="a-btn a-btn-palm" disabled={saving || loading}>
            <Save className="w-4 h-4" /> {saving ? 'جارٍ الحفظ…' : 'حفظ وتفعيل'}
          </button>
        </div>

        <div className="text-xs leading-relaxed pt-4 border-t" style={{ color: 'var(--a-text-muted)' }}>
          الأحداث الجاهزة للإرسال تلقائياً: <code>audience_track_click</code>، <code>order_open</code>، <code>whatsapp_click</code>، <code>quote_request</code>.
          عند تشغيل وضع <code>?debug=track</code> يُضاف <code>debug_mode:true</code> لكل حدث ليظهر في GA4 DebugView مباشرة.
        </div>
      </form>
    </div>
  );
}
