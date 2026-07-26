import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';

type Code = { code: string; uses: number; total_reward_sar: number };
type Redemption = { id: string; discount_sar: number; reward_points: number; created_at: string };

export default function Referrals() {
  const [code, setCode] = useState<Code | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const [{ data: c }, { data: r }] = await Promise.all([
        supabase.from('referral_codes').select('code,uses,total_reward_sar').eq('user_id', u.user.id).maybeSingle(),
        supabase.from('referral_redemptions').select('id,discount_sar,reward_points,created_at').eq('referrer_user_id', u.user.id).order('created_at', { ascending: false }),
      ]);
      setCode(c as Code | null);
      setRedemptions((r as Redemption[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const shareUrl = code ? `${window.location.origin}/?ref=${code.code}` : '';
  const shareMsg = `احصل على خصم 10% من فحم النخلة باستخدام كودي: ${code?.code}\n${shareUrl}`;

  const copy = async (v: string) => { await navigator.clipboard.writeText(v); toast.success('تم النسخ'); };
  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-coal dark:text-ivory">برنامج الإحالة</h1>
        <p className="text-sm text-coal/60 dark:text-ivory/60 mt-1">شارك كودك — صديقك يحصل على خصم 10% (حتى 50 ر.س)، وأنت تكسب 50 نقطة عن كل طلب أول.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>كودك الخاص</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-sand/30 rounded-lg border border-palm-gold/30">
            <div className="text-3xl font-bold tracking-widest text-palm-gold flex-1">{code?.code || '—'}</div>
            <Button size="sm" variant="outline" onClick={() => copy(code?.code || '')}><Copy className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-ivory/50 rounded-lg text-sm">
            <div className="truncate flex-1 text-coal/80" dir="ltr">{shareUrl}</div>
            <Button size="sm" variant="outline" onClick={() => copy(shareUrl)}><Copy className="h-4 w-4" /></Button>
          </div>
          <Button className="w-full bg-jade hover:bg-jade/90" onClick={whatsapp}>
            <Share2 className="h-4 w-4 me-2" /> شارك عبر واتساب
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إحالات ناجحة</CardTitle>
            <Users className="h-4 w-4 text-jade" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{code?.uses ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">إجمالي مكافآتك</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-palm-gold">{(code?.total_reward_sar || 0).toLocaleString('ar')} ر.س</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>سجل الإحالات</CardTitle></CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <p className="text-sm text-coal/60 py-8 text-center">لم يستخدم أحد كودك بعد. ابدأ بمشاركته!</p>
          ) : (
            <div className="divide-y divide-sand/40">
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div className="text-sm text-coal/60">{new Date(r.created_at).toLocaleDateString('ar-SA')}</div>
                  <div className="text-sm font-medium text-jade">+{r.reward_points} نقطة · خصم {r.discount_sar} ر.س</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
