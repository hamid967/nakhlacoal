import { useEffect, useState } from 'react';
import { X, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const KEY = 'palm-promo-banner-dismissed';

export function PromoBanner() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) !== '1') setOpen(true); } catch { setOpen(true); }
  }, []);

  if (!open) return null;
  const isAr = i18n.language?.startsWith('ar');

  const dismiss = () => {
    setOpen(false);
    try { sessionStorage.setItem(KEY, '1'); } catch {}
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[60] text-cream text-xs md:text-sm" style={{ background: 'hsl(var(--emerald, 158 84% 16%))' }}>
      <div className="container flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Flame className="w-4 h-4 text-[hsl(var(--gold))] shrink-0" />
          <span className="truncate">
            {isAr
              ? 'عروض خاصة للطلبات بالجملة — تواصل معنا الآن'
              : 'Special wholesale offers — contact us now'}
            <a href="tel:+966501234567" className="ms-3 underline decoration-[hsl(var(--gold))]/50 hover:text-[hsl(var(--gold))]">
              +966 50 123 4567
            </a>
          </span>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="p-1 rounded hover:bg-white/10 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
