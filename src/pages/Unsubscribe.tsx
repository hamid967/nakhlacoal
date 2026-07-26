import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// supabase client not needed; using direct fetch to the edge function
import { Helmet } from 'react-helmet-async';

type Prefs = {
  order_updates: boolean;
  shipment_updates: boolean;
  invoice_receipts: boolean;
  quote_updates: boolean;
  marketing: boolean;
  unsubscribed_all: boolean;
};

const LABELS: Record<keyof Omit<Prefs,'unsubscribed_all'>, string> = {
  order_updates: 'تحديثات الطلبات',
  shipment_updates: 'تحديثات الشحن',
  invoice_receipts: 'إيصالات الفواتير',
  quote_updates: 'تحديثات عروض الأسعار',
  marketing: 'العروض والنشرات',
};

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<'loading'|'ready'|'invalid'|'saved'|'done'>('loading');
  const [email, setEmail] = useState('');
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  const fnBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-preferences`;

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    (async () => {
      try {
        const resp = await fetch(`${fnBase}?token=${encodeURIComponent(token)}`, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string },
        });
        const j = await resp.json();
        if (!resp.ok || !j.ok) throw new Error(j.error || 'invalid');
        setEmail(j.email);
        setPrefs(j.prefs);
        setState('ready');
      } catch {
        setState('invalid');
      }
    })();
  }, [token, fnBase]);

  const save = async (payload: any) => {
    const resp = await fetch(fnBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
      },
      body: JSON.stringify({ token, ...payload }),
    });
    if (!resp.ok) return;
    setState(payload.all ? 'done' : 'saved');
  };

  const toggle = (k: keyof Prefs) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [k]: !prefs[k] });
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#f6f5ef' }}>
      <Helmet><title>إدارة تفضيلات البريد · فحم النخلة</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="w-full max-w-lg rounded-2xl bg-white border p-8 shadow-sm" style={{ borderColor: '#e8e4d6' }}>
        <div className="text-center mb-6">
          <div className="text-[11px] tracking-[0.35em] text-emerald-900/70">PALM CHARCOAL</div>
          <h1 className="text-2xl font-bold mt-2" style={{ color: '#1A4A00' }}>إدارة إشعارات البريد</h1>
        </div>

        {state === 'loading' && <p className="text-center text-sm text-gray-500">جاري التحقق…</p>}
        {state === 'invalid' && (
          <p className="text-center text-sm text-red-600">الرابط غير صالح أو منتهي الصلاحية.</p>
        )}
        {state === 'done' && (
          <p className="text-center text-sm text-emerald-800">تم إلغاء اشتراكك من جميع رسائل البريد. يمكنك إعادة تفعيلها من إعدادات حسابك في أي وقت.</p>
        )}
        {(state === 'ready' || state === 'saved') && prefs && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              التفضيلات الخاصة بـ <strong>{email}</strong>
            </p>
            <div className="space-y-2">
              {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => (
                <label key={k} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#f6f5ef' }}>
                  <span className="text-sm">{LABELS[k]}</span>
                  <input
                    type="checkbox"
                    checked={!prefs.unsubscribed_all && prefs[k]}
                    disabled={prefs.unsubscribed_all}
                    onChange={() => toggle(k)}
                  />
                </label>
              ))}
            </div>

            <button
              onClick={() => save({ prefs })}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
              style={{ background: '#1A4A00' }}
            >
              حفظ التفضيلات
            </button>

            <button
              onClick={() => save({ all: true })}
              className="w-full rounded-lg py-2.5 text-sm font-semibold border"
              style={{ borderColor: '#e8e4d6', color: '#8a2b2b' }}
            >
              إلغاء الاشتراك من كل شيء
            </button>

            {state === 'saved' && (
              <p className="text-center text-xs text-emerald-800">تم الحفظ ✓</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
