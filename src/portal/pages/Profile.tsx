import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function PortalProfile() {
  const { user } = useAuth();
  const [p, setP] = useState<any>({ full_name: '', phone: '', company: '', preferred_language: 'ar' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => data && setP(data));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...p });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success('تم الحفظ');
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · PROFILE</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">الملف الشخصي</h1>
      </header>

      <div className="a-card p-6 max-w-2xl space-y-4">
        <Row label="البريد الإلكتروني"><input className="a-input" value={user?.email || ''} disabled /></Row>
        <Row label="الاسم الكامل"><input className="a-input" value={p.full_name || ''} onChange={(e) => setP({ ...p, full_name: e.target.value })} /></Row>
        <Row label="رقم الجوال"><input className="a-input" value={p.phone || ''} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Row>
        <Row label="الشركة"><input className="a-input" value={p.company || ''} onChange={(e) => setP({ ...p, company: e.target.value })} /></Row>
        <Row label="اللغة المفضلة">
          <select className="a-input" value={p.preferred_language || 'ar'} onChange={(e) => setP({ ...p, preferred_language: e.target.value })}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </Row>
        <button onClick={save} disabled={busy} className="a-btn a-btn-palm">{busy ? '...' : 'حفظ التغييرات'}</button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'var(--a-text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}
