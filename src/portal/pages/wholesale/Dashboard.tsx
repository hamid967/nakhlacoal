import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Account = {
  id: string;
  company_name: string;
  status: string;
  credit_limit_sar: number;
  payment_terms: string;
  approved_at: string | null;
};

type Balance = { credit_limit_sar: number; outstanding_sar: number; available_sar: number };

export default function WholesaleDashboard() {
  const { user } = useAuth();
  const [acct, setAcct] = useState<Account | null>(null);
  const [bal, setBal] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('wholesale_accounts')
        .select('id, company_name, status, credit_limit_sar, payment_terms, approved_at')
        .eq('user_id', user.id)
        .maybeSingle();
      setAcct(data as Account | null);
      if (data?.id) {
        const { data: b } = await supabase.rpc('get_account_balance', { _account_id: data.id });
        if (b && b[0]) setBal(b[0] as Balance);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="p-6">جاري التحميل…</div>;

  if (!acct) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-3">حساب الجملة</h1>
        <p className="text-muted-foreground mb-4">
          لا يوجد حساب جملة مرتبط بحسابك بعد. سجّل اهتمامك عبر نموذج الجملة وسيتم مراجعة طلبك.
        </p>
        <Link to="/wholesale" className="inline-block px-5 py-2 rounded-xl bg-primary text-primary-foreground">
          طلب تفعيل حساب جملة
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{acct.company_name}</h1>
        <p className="text-sm text-muted-foreground">
          الحالة: {acct.status} · شروط الدفع: {acct.payment_terms}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="الحد الائتماني" value={fmt(bal?.credit_limit_sar ?? acct.credit_limit_sar)} />
        <Card title="المستحق" value={fmt(bal?.outstanding_sar ?? 0)} />
        <Card title="المتاح" value={fmt(bal?.available_sar ?? acct.credit_limit_sar)} accent />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/portal/wholesale/catalog" className="a-glass p-4 rounded-xl hover:shadow-md">كتالوج الجملة</Link>
        <Link to="/portal/wholesale/bulk-order" className="a-glass p-4 rounded-xl hover:shadow-md">طلب بالجملة</Link>
        <Link to="/portal/quotes" className="a-glass p-4 rounded-xl hover:shadow-md">عروض الأسعار</Link>
        <Link to="/portal/wholesale/statement" className="a-glass p-4 rounded-xl hover:shadow-md">كشف الحساب</Link>
      </div>
    </div>
  );
}

function Card({ title, value, accent }: { title: string; value: string; accent?: boolean }) {
  return (
    <div className="a-glass p-4 rounded-xl">
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-primary' : ''}`}>{value}</div>
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(n || 0);
}
