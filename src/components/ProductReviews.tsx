import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  user_id: string;
};

export default function ProductReviews({ productId, isAr }: { productId: string; isAr: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('product_reviews')
      .select('id,rating,title,body,created_at,user_id')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false });
    const list = (data as Review[]) ?? [];
    setReviews(list);
    setAvg(list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0);
  };

  useEffect(() => {
    load();
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      // Check if user bought this product
      const { data: buyer } = await supabase.rpc as never;
      void buyer;
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_items(variant_id, product_variants(product_id))')
        .eq('user_id', uid)
        .in('status', ['delivered', 'completed'])
        .limit(50);
      const bought = (orders as { order_items?: { product_variants?: { product_id: string } | null }[] }[] | null)
        ?.some((o) => o.order_items?.some((oi) => oi.product_variants?.product_id === productId)) ?? false;
      setCanReview(bought);
    })();
  }, [productId]);

  const submit = async () => {
    if (!userId) return;
    setSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: userId,
      rating,
      title: title || null,
      body: body || null,
      verified: true,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(isAr ? 'تم إرسال المراجعة — بانتظار الاعتماد' : 'Review submitted — awaiting approval');
    setTitle(''); setBody(''); setRating(5);
  };

  return (
    <section className="mt-16 pt-10 border-t border-border/60">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.32em] text-gold">
          {isAr ? 'المراجعات' : 'Reviews'}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2" dir="ltr">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{avg.toFixed(1)} ({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">{isAr ? 'لا مراجعات بعد — كن أول من يشارك تجربته.' : 'No reviews yet — be the first.'}</p>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 5).map((r) => (
            <div key={r.id} className="p-4 border border-border/60 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex text-gold" dir="ltr">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en')}</span>
              </div>
              {r.title && <div className="font-medium text-sm mb-1">{r.title}</div>}
              {r.body && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.body}</p>}
            </div>
          ))}
        </div>
      )}

      {canReview && (
        <div className="mt-8 p-5 border border-gold/40 rounded bg-gold/5">
          <h3 className="text-sm font-medium mb-3">{isAr ? 'شارك تجربتك' : 'Share your experience'}</h3>
          <div className="flex gap-1 mb-3" dir="ltr">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
                <Star className={`w-6 h-6 text-gold ${n <= rating ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isAr ? 'عنوان (اختياري)' : 'Title (optional)'}
            className="w-full mb-2 h-10 px-3 bg-background border border-border rounded text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={isAr ? 'اكتب مراجعتك…' : 'Write your review…'}
            className="w-full mb-3 p-3 bg-background border border-border rounded text-sm"
          />
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 h-10 px-5 bg-gold-hi text-dark text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isAr ? 'إرسال' : 'Submit'}
          </button>
        </div>
      )}
    </section>
  );
}
