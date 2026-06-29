import { useEffect, useState } from 'react';
import { Save, BarChart3, ExternalLink, CheckCircle2, XCircle, Loader2, PlugZap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const GA4_RE = /^G-[A-Z0-9]{6,}$/;
const GTM_RE = /^GTM-[A-Z0-9]{4,}$/;

type TestState = { status: 'idle' | 'testing' | 'ok' | 'fail'; message?: string };

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

function resultToState(label: string, r: ProbeResult): TestState {
  if (r === 'ok') return { status: 'ok', message: `${label} يستجيب — المعرّف صالح ومحمّل من Google.` };
  if (r === 'timeout')
    return {
      status: 'fail',
      message: `انتهت مهلة الاختبار (الشبكة بطيئة أو محجوبة). جرّب «إعادة المحاولة».`,
    };
  return { status: 'fail', message: `تعذّر تحميل سكربت ${label} (تحقّق من المعرّف أو مانع الإعلانات).` };
}

async function testGa4(id: string): Promise<TestState> {
  if (!GA4_RE.test(id)) return { status: 'fail', message: 'صيغة GA4 غير صالحة (G-XXXXXXXXXX)' };
  return resultToState('GA4', await probeScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`));
}

async function testGtm(id: string): Promise<TestState> {
  if (!GTM_RE.test(id)) return { status: 'fail', message: 'صيغة GTM غير صالحة (GTM-XXXXXXX)' };
  return resultToState('GTM', await probeScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`));
}

function StatusBadge({ state }: { state: TestState }) {
  if (state.status === 'idle') return null;
  if (state.status === 'testing')
    return <span className="inline-flex items-center gap-1 text-[10px]"><Loader2 className="w-3 h-3 animate-spin" /> اختبار…</span>;
  if (state.status === 'ok')
    return <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle2 className="w-3 h-3" /> صالح</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] text-red-600"><XCircle className="w-3 h-3" /> فشل</span>;
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
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>ANALYTICS</p>
        <h1 className="a-display text-4xl mt-1 flex items-center gap-3">
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
            <p className={`text-xs mt-1 flex items-center gap-2 ${ga4Test.status === 'ok' ? 'text-emerald-600' : ga4Test.status === 'fail' ? 'text-red-600' : ''}`}>
              <span>{ga4Test.message}</span>
              {ga4Test.status === 'fail' && ga4 && (
                <button
                  type="button"
                  onClick={async () => { setGa4Test({ status: 'testing' }); setGa4Test(await testGa4(ga4)); }}
                  className="underline shrink-0"
                >
                  إعادة المحاولة
                </button>
              )}
            </p>
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
            <p className={`text-xs mt-1 flex items-center gap-2 ${gtmTest.status === 'ok' ? 'text-emerald-600' : gtmTest.status === 'fail' ? 'text-red-600' : ''}`}>
              <span>{gtmTest.message}</span>
              {gtmTest.status === 'fail' && gtm && (
                <button
                  type="button"
                  onClick={async () => { setGtmTest({ status: 'testing' }); setGtmTest(await testGtm(gtm)); }}
                  className="underline shrink-0"
                >
                  إعادة المحاولة
                </button>
              )}
            </p>
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
