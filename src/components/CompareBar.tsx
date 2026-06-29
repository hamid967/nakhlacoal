import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { getProduct } from '@/data/products';

export function CompareBar() {
  const { items, remove, clear } = useCompare();
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? true;

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(95vw,720px)]">
      <div className="glass-strip glass-dark rounded-2xl p-3 md:p-4 flex items-center gap-3 text-foreground">
        <div className="flex items-center gap-2 shrink-0 text-gold-hi">
          <GitCompare className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.2em] hidden sm:inline">
            {isAr ? 'مقارنة' : 'Compare'}
          </span>
          <span className="text-xs text-foreground/60">({items.length}/4)</span>
        </div>

        <div className="flex-1 flex gap-2 overflow-x-auto">
          {items.map((slug) => {
            const p = getProduct(slug);
            if (!p) return null;
            return (
              <div
                key={slug}
                className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-luxe group"
                title={isAr ? p.nameAr : p.nameEn}
              >
                <img src={p.image} alt={isAr ? p.nameAr : p.nameEn} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                <button
                  onClick={() => remove(slug)}
                  className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  aria-label="remove"
                >
                  <X className="w-4 h-4 text-gold-hi" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clear}
            className="text-xs text-foreground/60 hover:text-gold-hi transition-colors"
          >
            {isAr ? 'مسح' : 'Clear'}
          </button>
          <Link
            to="/compare"
            className={`btn-gold !py-2 !px-4 text-xs ${items.length < 2 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isAr ? 'قارن الآن' : 'Compare now'}
          </Link>
        </div>
      </div>
    </div>
  );
}
