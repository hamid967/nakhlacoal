import { useState } from 'react';
import { toast } from 'sonner';

export default function PortalSettings() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [notif, setNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  const save = () => toast.success('تم حفظ الإعدادات');

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

        <section className="a-card p-6 space-y-4">
          <h3 className="font-semibold">الإشعارات</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">إشعارات تحديث الطلبات والعروض</span>
            <input type="checkbox" checked={notif} onChange={(e) => setNotif(e.target.checked)} />
          </label>
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

      <button onClick={save} className="a-btn a-btn-palm">حفظ التغييرات</button>
    </div>
  );
}
