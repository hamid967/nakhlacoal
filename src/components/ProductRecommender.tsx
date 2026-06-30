import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/products';
import { toast } from 'sonner';

type RecItem = {
  slug: string;
  reason: string;
  quantitySuggestion: string;
};


const PRESETS_AR = [
  'مطعم شواء يحتاج فحم يومي',
  'شيشة للاستخدام المنزلي',
  'بخور للمجلس',
  'تصدير حاوية كاملة',
];
const PRESETS_EN = [
  'BBQ restaurant, daily use',
  'Home shisha lounge setup',
  'Incense for majlis',
  'Full container for export',
];

export function ProductRecommender() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<RecItem[] | null>(null);

  const ask = async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setLoading(true);
    setRecs(null);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-product', {
        body: { query: text, lang: isAr ? 'ar' : 'en' },
      });
      if (error) throw error;
      if (data?.fallback) {
        toast.error(isAr ? 'المستشار الذكي غير متاح حالياً، حاول لاحقاً.' : 'AI advisor temporarily unavailable.');
        return;
      }
      const list: RecItem[] = Array.isArray(data?.recommendations) ? data.recommendations : [];
      if (!list.length) throw new Error('No recommendations');
      setRecs(list.slice(0, 3));
    } catch (e) {
      toast.error(isAr ? 'تعذّر إيجاد توصية. حاول مرة أخرى.' : 'Could not generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const presets = isAr ? PRESETS_AR : PRESETS_EN;


  return (
    <section className="container py-12">
      <div className="rounded-2xl clay-card p-6 md:p-8 border border-amber-700/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-700">
            {isAr ? 'مستشار المنتج الذكي' : 'AI Product Advisor'}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
          {isAr ? 'لست متأكداً أيّ نوع يناسبك؟' : 'Not sure which charcoal fits you?'}
        </h2>
        <p className="text-sm text-foreground/60 mb-5">
          {isAr ? 'صف استخدامك وسنرشّح المنتج الأنسب فوراً.' : 'Describe your use case — we will recommend the right product instantly.'}
        </p>

        <div className="flex gap-2 flex-col md:flex-row mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder={isAr ? 'مثال: مطعم شواء بكمية 200 كجم شهرياً' : 'e.g. BBQ restaurant, ~200 kg per month'}
            className="flex-1 rounded-lg bg-background border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-amber-600"
            dir={isAr ? 'rtl' : 'ltr'}
            maxLength={500}
          />
          <button
            onClick={() => ask()}
            disabled={loading || !query.trim()}
            className="bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg px-6 py-3 text-sm font-medium flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isAr ? 'رشّح لي' : 'Recommend'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => { setQuery(p); ask(p); }}
              className="text-xs px-3 py-1.5 rounded-full bg-foreground/5 hover:bg-amber-600/10 hover:text-amber-700 border border-foreground/10 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {recs && recs.length > 0 && (
          <div className="mt-6 grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2">
            {recs.map((r, i) => {
              const product = products.find((p) => p.slug === r.slug);
              if (!product) return null;
              const isTop = i === 0;
              return (
                <div
                  key={`${r.slug}-${i}`}
                  className={`relative p-4 rounded-xl border transition ${
                    isTop
                      ? 'bg-emerald-900/[0.06] border-emerald-900/20 shadow-sm'
                      : 'bg-foreground/[0.02] border-foreground/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-800">
                      {isAr ? `الخيار ${i + 1}` : `Option ${i + 1}`}
                    </span>
                    {isTop && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white">
                        {isAr ? 'الأفضل' : 'Top pick'}
                      </span>
                    )}
                  </div>
                  <img decoding="async" loading="lazy" src={product.image} alt={product.nameEn} className="w-full h-28 object-cover rounded-lg mb-3" />
                  <h3 className="text-base font-bold text-emerald-900 mb-1">
                    {isAr ? product.nameAr : product.nameEn}
                  </h3>
                  <p className="text-xs text-foreground/75 leading-relaxed mb-2">{r.reason}</p>
                  <div className="text-[11px] text-foreground/60 mb-3">
                    <strong className="text-amber-700">{isAr ? 'الكمية:' : 'Qty:'} </strong>
                    {r.quantitySuggestion}
                  </div>
                  <Link
                    to={`/products/${product.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-emerald-900 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    {isAr ? 'عرض المنتج' : 'View'}
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
