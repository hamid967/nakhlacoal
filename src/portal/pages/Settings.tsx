import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES: { key: 'order_updates'|'shipment_updates'|'invoice_receipts'|'quote_updates'|'marketing'; label: string; hint: string }[] = [
  { key: 'order_updates', label: 'تحديثات الطلبات', hint: 'تأكيد الطلب وتغيّر حالته' },
  { key: 'shipment_updates', label: 'تحديثات الشحن', hint: 'إشعارات الشحن ورقم التتبع' },
  { key: 'invoice_receipts', label: 'إيصالات الفواتير', hint: 'الفواتير الضريبية وإشعارات الدفع' },
  { key: 'quote_updates', label: 'تحديثات عروض الأسعار', hint: 'موافقة/رفض/انتهاء صلاحية العروض' },
  { key: 'marketing', label: 'العروض والنشرات (اختياري)', hint: 'رسائل ترويجية — معطّلة افتراضياً' },
];

type Prefs = Record<typeof CATEGORIES[number]['key'], boolean> & { unsubscribed_all: boolean };

const DEFAULT_PREFS: Prefs = {
  order_updates: true,
  shipment_updates: true,
  invoice_receipts: true,
  quote_updates: true,
  marketing: false,
  unsubscribed_all: false,
};

export default function PortalSettings() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [twoFA, setTwoFA] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const em = userRes.user?.email ?? '';
      setEmail(em);
      if (!em) { setLoading(false); return; }
      const { data } = await supabase
        .from('email_preferences')
        .select('order_updates,shipment_updates,invoice_receipts,quote_updates,marketing,unsubscribed_all')
        .ilike('email', em)
        .maybeSingle();
      if (data) setPrefs({ ...DEFAULT_PREFS, ...data } as Prefs);
      setLoading(false);
    })();
  }, []);

  const toggle = (k: keyof Prefs) => setPrefs((p) => ({ ...p, [k]: !p[k], unsubscribed_all: k === 'unsubscribed_all' ? !p.unsubscribed_all : false }));

  const save = async () => {
    if (!email) { toast.error('لا يوجد بريد للحساب'); return; }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('email_preferences')
      .upsert({ email, user_id: userRes.user?.id ?? null, ...prefs }, { onConflict: 'email' });
    setSaving(false);
    if (error) toast.error('تعذّر حفظ التفضيلات');
    else toast.success('تم حفظ تفضيلات البريد');
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · SETTINGS</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">إعدادات الحساب</h1>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <section className="a-card p-6 space-y-4">
          <h3 className="font-semibold">اللغة</h3>
          <div className="flex gap-2">
            <button onClick={() => setLang('ar')} className={`a-btn ${lang === 'ar' ? 'a-btn-palm' : 'a-btn-ghost'}`}>العربية</button>
            <button onClick={() => setLang('en')} className={`a-btn ${lang === 'en' ? 'a-btn-palm' : 'a-btn-ghost'}`}>English</button>
          </div>
        </section>

        <section className="a-card p-6 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">تفضيلات البريد الإلكتروني</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>
                {email ? `الإشعارات تُرسل إلى: ${email}` : 'سجّل الدخول لإدارة تفضيلاتك'}
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>جاري التحميل…</p>
          ) : (
            <>
              <div className="space-y-3">
                {CATEGORIES.map((c) => (
                  <label key={c.key} className="flex items-start justify-between gap-4 cursor-pointer p-3 rounded-lg" style={{ background: 'var(--a-surface-2, #f6f5ef)' }}>
                    <div>
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>{c.hint}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!prefs.unsubscribed_all && prefs[c.key]}
                      disabled={prefs.unsubscribed_all}
                      onChange={() => toggle(c.key)}
                    />
                  </label>
                ))}
              </div>

              <div className="border-t pt-3" style={{ borderColor: 'var(--a-border, #e8e4d6)' }}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">إلغاء الاشتراك من كل رسائل البريد</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--a-text-muted)' }}>لن نرسل لك أي إشعارات آلية.</div>
                  </div>
                  <input type="checkbox" checked={prefs.unsubscribed_all} onChange={() => toggle('unsubscribed_all')} />
                </label>
              </div>

              <button onClick={save} disabled={saving} className="a-btn a-btn-palm">
                {saving ? 'جارٍ الحفظ…' : 'حفظ تفضيلات البريد'}
              </button>
            </>
          )}
        </section>

        <section className="a-card p-6 space-y-4">
          <h3 className="font-semibold">الأمان</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">المصادقة الثنائية (2FA)</span>
            <input type="checkbox" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
          </label>
          <p className="text-xs" style={{ color: 'var(--a-text-muted)' }}>قريباً — حماية إضافية لحسابك.</p>
        </section>

        <section className="a-card p-6 space-y-4">
          <h3 className="font-semibold">الخصوصية</h3>
          <p className="text-xs" style={{ color: 'var(--a-text-muted)' }}>
            بياناتك محفوظة بأمان وفق سياسة الخصوصية. لن نشاركها مع أي طرف ثالث.
          </p>
        </section>
      </div>
    </div>
  );
}
