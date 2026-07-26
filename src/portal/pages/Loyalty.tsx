import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, Gift } from 'lucide-react';

type LoyaltyAccount = {
  points_balance: number;
  tier: string;
  lifetime_spend_sar: number;
};
type Tx = {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  reason: string | null;
  created_at: string;
};

const TIER_META: Record<string, { label: string; next?: number; color: string }> = {
  bronze:   { label: 'برونزي', next: 5000,  color: 'bg-amber-700/20 text-amber-800' },
  silver:   { label: 'فضي',    next: 15000, color: 'bg-slate-400/20 text-slate-700' },
  gold:     { label: 'ذهبي',   next: 50000, color: 'bg-palm-gold/20 text-palm-gold' },
  platinum: { label: 'بلاتيني', color: 'bg-jade/20 text-jade' },
};

export default function Loyalty() {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const [{ data: acc }, { data: tx }] = await Promise.all([
        supabase.from('loyalty_accounts').select('points_balance,tier,lifetime_spend_sar').eq('user_id', u.user.id).maybeSingle(),
        supabase.from('loyalty_transactions').select('id,type,points,reason,created_at').eq('user_id', u.user.id).order('created_at', { ascending: false }).limit(50),
      ]);
      setAccount(acc as LoyaltyAccount | null ?? { points_balance: 0, tier: 'bronze', lifetime_spend_sar: 0 });
      setTxs((tx as Tx[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;

  const tier = TIER_META[account?.tier || 'bronze'];
  const progress = tier.next ? Math.min(100, ((account?.lifetime_spend_sar || 0) / tier.next) * 100) : 100;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-coal dark:text-ivory">نقاط النخلة</h1>
        <p className="text-sm text-coal/60 dark:text-ivory/60 mt-1">اكسب نقطة عن كل 10 ر.س — 100 نقطة = 10 ر.س خصم على طلبك القادم.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">رصيد النقاط</CardTitle>
            <Award className="h-4 w-4 text-palm-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-palm-gold">{account?.points_balance ?? 0}</div>
            <p className="text-xs text-coal/60 mt-1">= {((account?.points_balance ?? 0) / 10).toFixed(2)} ر.س</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المستوى</CardTitle>
            <Badge className={tier.color}>{tier.label}</Badge>
          </CardHeader>
          <CardContent>
            {tier.next ? (
              <>
                <div className="h-2 bg-sand rounded-full overflow-hidden">
                  <div className="h-full bg-palm-gold transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-coal/60 mt-2">
                  {(tier.next - (account?.lifetime_spend_sar || 0)).toLocaleString('ar')} ر.س للترقية
                </p>
              </>
            ) : (
              <p className="text-sm text-jade">أعلى مستوى — شكراً لولائك 🌴</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإنفاق</CardTitle>
            <TrendingUp className="h-4 w-4 text-jade" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(account?.lifetime_spend_sar || 0).toLocaleString('ar')}</div>
            <p className="text-xs text-coal/60 mt-1">ر.س عبر جميع الطلبات</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> سجل المعاملات</CardTitle></CardHeader>
        <CardContent>
          {txs.length === 0 ? (
            <p className="text-sm text-coal/60 py-8 text-center">لا توجد معاملات بعد. أكمل طلبك الأول واكسب نقاطك!</p>
          ) : (
            <div className="divide-y divide-sand/40">
              {txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{t.reason || t.type}</div>
                    <div className="text-xs text-coal/60">{new Date(t.created_at).toLocaleDateString('ar-SA')}</div>
                  </div>
                  <div className={`text-sm font-bold ${t.type === 'earn' ? 'text-jade' : 'text-ember'}`}>
                    {t.type === 'earn' ? '+' : '-'}{Math.abs(t.points)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
