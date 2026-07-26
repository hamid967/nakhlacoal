import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Star } from 'lucide-react';
import { toast } from 'sonner';

type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  approved: boolean;
  created_at: string;
  products?: { name_ar: string } | null;
};

export default function Reviews() {
  const [rows, setRows] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('product_reviews').select('id,product_id,user_id,rating,title,body,verified,approved,created_at, products(name_ar)').order('created_at', { ascending: false });
    if (filter === 'pending') q = q.eq('approved', false);
    if (filter === 'approved') q = q.eq('approved', true);
    const { data } = await q.limit(200);
    setRows((data as unknown as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase.from('product_reviews').update({ approved }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(approved ? 'تمت الموافقة' : 'تم الإخفاء');
    load();
  };
  const remove = async (id: string) => {
    if (!confirm('حذف المراجعة نهائياً؟')) return;
    await supabase.from('product_reviews').delete().eq('id', id);
    load();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مراجعات المنتجات</h1>
          <p className="text-sm text-muted-foreground mt-1">اعتمد المراجعات لعرضها للعملاء.</p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'all'] as const).map((k) => (
            <Button key={k} size="sm" variant={filter === k ? 'default' : 'outline'} onClick={() => setFilter(k)}>
              {k === 'pending' ? 'قيد المراجعة' : k === 'approved' ? 'معتمدة' : 'الكل'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : rows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد مراجعات في هذا التصنيف.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base">{r.title || '(بدون عنوان)'}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-palm-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{r.products?.name_ar || r.product_id.slice(0, 8)}</span>
                      {r.verified && <Badge variant="outline" className="text-jade border-jade">مشترٍ موثّق</Badge>}
                      {r.approved ? <Badge className="bg-jade">معتمدة</Badge> : <Badge variant="secondary">قيد المراجعة</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!r.approved && <Button size="sm" onClick={() => setApproved(r.id, true)}><Check className="h-4 w-4" /></Button>}
                    {r.approved && <Button size="sm" variant="outline" onClick={() => setApproved(r.id, false)}>إلغاء الاعتماد</Button>}
                    <Button size="sm" variant="destructive" onClick={() => remove(r.id)}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.body || '—'}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString('ar-SA')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
