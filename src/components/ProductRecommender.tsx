import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/products';
import { toast } from 'sonner';

type Recommendation = {
  slug: string;
  reason: string;
  quantitySuggestion: string;
  alternativeSlug?: string;
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
  const [rec, setRec] = useState<Recommendation | null>(null);

  const ask = async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setLoading(true);
    setRec(null);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-product', {
        body: { query: text, lang: isAr ? 'ar' : 'en' },
      });
      if (error) throw error;
      if (data?.fallback) {
        toast.error(isAr ? 'المستشار الذكي غير متاح حالياً، حاول لاحقاً.' : 'AI advisor temporarily unavailable.');
        return;
      }
      if (!data?.slug) throw new Error('No recommendation');
      setRec(data as Recommendation);
    } catch (e) {
      toast.error(isAr ? 'تعذّر إيجاد توصية. حاول مرة أخرى.' : 'Could not generate recommendation.');
    } finally {
      setLoading(false);
    }
  };

  const presets = isAr ? PRESETS_AR : PRESETS_EN;
  const product = rec ? products.find((p) => p.slug === rec.slug) : null;
  const alternative = rec?.alternativeSlug ? products.find((p) => p.slug === rec.alternativeSlug) : null;

  return (
    <section className="container py-12">
      <div className="rounded-2xl glass-card p-6 md:p-8 border border-amber-700/20">
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

        {rec && product && (
          <div className="mt-6 grid md:grid-cols-[180px_1fr] gap-5 p-5 rounded-xl bg-emerald-900/5 border border-emerald-900/10 animate-in fade-in slide-in-from-bottom-2">
            <img src={product.image} alt={product.nameEn} className="w-full h-32 md:h-full object-cover rounded-lg" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-800 mb-1">
                {isAr ? 'التوصية' : 'Recommended'}
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">
                {isAr ? product.nameAr : product.nameEn}
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">{rec.reason}</p>
              <div className="text-xs text-foreground/60 mb-4">
                <strong className="text-amber-700">{isAr ? 'الكمية المقترحة:' : 'Suggested quantity:'} </strong>
                {rec.quantitySuggestion}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/products/${product.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm bg-emerald-900 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg transition"
                >
                  {isAr ? 'عرض المنتج' : 'View product'}
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
                {alternative && (
                  <Link
                    to={`/products/${alternative.slug}`}
                    className="text-sm text-amber-700 hover:underline"
                  >
                    {isAr ? 'أو جرّب: ' : 'Or consider: '}
                    {isAr ? alternative.nameAr : alternative.nameEn}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
