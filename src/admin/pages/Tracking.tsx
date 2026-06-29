import { useEffect, useState } from 'react';
import { Save, BarChart3, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const GA4_RE = /^G-[A-Z0-9]{6,}$/;
const GTM_RE = /^GTM-[A-Z0-9]{4,}$/;

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

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ga4 && !GA4_RE.test(ga4)) return toast.error('GA4 ID غير صالح. مثال: G-XXXXXXXXXX');
    if (gtm && !GTM_RE.test(gtm)) return toast.error('GTM ID غير صالح. مثال: GTM-XXXXXXX');
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
          <div className="text-xs mb-1.5" style={{ color: 'var(--a-text-muted)' }}>
            GA4 Measurement ID
          </div>
          <input
            className="a-input"
            placeholder="G-XXXXXXXXXX"
            value={ga4}
            onChange={(e) => setGa4(e.target.value.trim().toUpperCase())}
            disabled={loading}
            dir="ltr"
          />
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
          <div className="text-xs mb-1.5" style={{ color: 'var(--a-text-muted)' }}>
            GTM Container ID
          </div>
          <input
            className="a-input"
            placeholder="GTM-XXXXXXX"
            value={gtm}
            onChange={(e) => setGtm(e.target.value.trim().toUpperCase())}
            disabled={loading}
            dir="ltr"
          />
        </div>

        <button type="submit" className="a-btn a-btn-palm" disabled={saving || loading}>
          <Save className="w-4 h-4" /> {saving ? 'جارٍ الحفظ…' : 'حفظ وتفعيل'}
        </button>

        <div className="text-xs leading-relaxed pt-4 border-t" style={{ color: 'var(--a-text-muted)' }}>
          الأحداث الجاهزة للإرسال تلقائياً: <code>audience_track_click</code>، <code>order_open</code>، <code>whatsapp_click</code>، <code>quote_request</code>.
          عند تشغيل وضع <code>?debug=track</code> يُضاف <code>debug_mode:true</code> لكل حدث ليظهر في GA4 DebugView مباشرة.
        </div>
      </form>
    </div>
  );
}
